import { Prisma } from "@prisma/client";
import { prisma } from "../../data/postgres";
import {
    DatosCambioEstado,
    DatosCongelamiento,
    DatosNuevaSuscripcion,
    DatosReactivacion,
    FiltrosConsultaSuscripcion,
    SuscripcionDataSource,
} from "../../domain/datasources/suscripcion.datasource";
import { SuscripcionEntity } from "../../domain/entities/suscripcion.entity";

// La entity necesita `tipo` y `congelamientos` para calcular congelada / vencida / dias_restantes.
export const SUSCRIPCION_INCLUDE = {
    tipo: true,
    congelamientos: { orderBy: { fecha_congelamiento: 'asc' } },
} satisfies Prisma.SuscripcionInclude;

type Tx = Prisma.TransactionClient;

export class SuscripcionDataSourceImpl implements SuscripcionDataSource {

    async crearSuscripcion(datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity> {
        const suscripcion = await prisma.$transaction(async (tx) => {
            const creada = await tx.suscripcion.create({ data: datos, include: SUSCRIPCION_INCLUDE });

            await this.registrarHistorial(tx, 'CREATE', creada.id_suscripcion, datos.created_by, null, creada);

            return creada;
        });

        return SuscripcionEntity.fromObject(suscripcion);
    }

    async renovarSuscripcion(id_anterior: string, datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity> {
        const nueva = await prisma.$transaction(async (tx) => {
            const antes = await this.findOrThrow(tx, id_anterior);

            const anteriorRenovada = await tx.suscripcion.update({
                where: { id_suscripcion: id_anterior },
                data: { estado: 'RENOVADA' },
                include: SUSCRIPCION_INCLUDE,
            });
            await this.registrarHistorial(tx, 'UPDATE', id_anterior, datos.created_by, antes, anteriorRenovada, 'Renovada');

            const creada = await tx.suscripcion.create({ data: datos, include: SUSCRIPCION_INCLUDE });
            await this.registrarHistorial(tx, 'CREATE', creada.id_suscripcion, datos.created_by, null, creada, 'Renovación');

            return creada;
        });

        return SuscripcionEntity.fromObject(nueva);
    }

    async cambiarEstado(id: string, datos: DatosCambioEstado): Promise<SuscripcionEntity> {
        const suscripcion = await prisma.$transaction(async (tx) => {
            const antes = await this.findOrThrow(tx, id);

            if (datos.cerrar_congelamiento) {
                const { id_congelamiento, ...cierre } = datos.cerrar_congelamiento;
                await tx.suscripcionCongelamiento.update({ where: { id_congelamiento }, data: cierre });
            }

            const despues = await tx.suscripcion.update({
                where: { id_suscripcion: id },
                data: { estado: datos.estado },
                include: SUSCRIPCION_INCLUDE,
            });

            const accion = datos.estado === 'FINALIZADA' ? 'COMPLETE' : 'CANCEL';
            await this.registrarHistorial(tx, accion, id, datos.id_user, antes, despues, datos.comentario);

            return despues;
        });

        return SuscripcionEntity.fromObject(suscripcion);
    }

    async congelarSuscripcion(id: string, datos: DatosCongelamiento): Promise<SuscripcionEntity> {
        const suscripcion = await prisma.$transaction(async (tx) => {
            const antes = await this.findOrThrow(tx, id);

            await tx.suscripcionCongelamiento.create({
                data: { id_suscripcion: id, ...datos },
            });

            const despues = await this.findOrThrow(tx, id);
            await this.registrarHistorial(tx, 'UPDATE', id, datos.congelado_por, antes, despues, 'Congelada');

            return despues;
        });

        return SuscripcionEntity.fromObject(suscripcion);
    }

    async reactivarSuscripcion(id: string, datos: DatosReactivacion): Promise<SuscripcionEntity> {
        const suscripcion = await prisma.$transaction(async (tx) => {
            const antes = await this.findOrThrow(tx, id);

            const { id_congelamiento, ...cierre } = datos.cierre;
            await tx.suscripcionCongelamiento.update({
                where: { id_congelamiento },
                data: datos.comentario ? { ...cierre, comentario: datos.comentario } : cierre,
            });

            const despues = await tx.suscripcion.update({
                where: { id_suscripcion: id },
                data: { fecha_fin: datos.nueva_fecha_fin },
                include: SUSCRIPCION_INCLUDE,
            });
            await this.registrarHistorial(tx, 'UPDATE', id, datos.cierre.reactivado_por, antes, despues, 'Reactivada');

            return despues;
        });

        return SuscripcionEntity.fromObject(suscripcion);
    }

    async getSuscripcionById(id: string): Promise<SuscripcionEntity | null> {
        const suscripcion = await prisma.suscripcion.findUnique({
            where: { id_suscripcion: id },
            include: SUSCRIPCION_INCLUDE,
        });
        if (!suscripcion) return null;
        return SuscripcionEntity.fromObject(suscripcion);
    }

    async getSuscripciones(filtros: FiltrosConsultaSuscripcion): Promise<SuscripcionEntity[]> {
        const suscripciones = await prisma.suscripcion.findMany({
            where: {
                ...(filtros.estado && { estado: filtros.estado }),
                ...(filtros.id_cliente && { id_cliente: filtros.id_cliente }),
            },
            include: SUSCRIPCION_INCLUDE,
            orderBy: { fecha_fin: 'asc' },
        });
        return suscripciones.map(s => SuscripcionEntity.fromObject(s));
    }

    async getSuscripcionesByCliente(id_cliente: string): Promise<SuscripcionEntity[]> {
        const suscripciones = await prisma.suscripcion.findMany({
            where: { id_cliente },
            include: SUSCRIPCION_INCLUDE,
            orderBy: { fecha_inicio: 'desc' },
        });
        return suscripciones.map(s => SuscripcionEntity.fromObject(s));
    }

    async getSuscripcionActivaByCliente(id_cliente: string): Promise<SuscripcionEntity | null> {
        const suscripcion = await prisma.suscripcion.findFirst({
            where: { id_cliente, estado: 'ACTIVA' },
            include: SUSCRIPCION_INCLUDE,
            orderBy: { fecha_inicio: 'desc' },
        });
        if (!suscripcion) return null;
        return SuscripcionEntity.fromObject(suscripcion);
    }

    async existeCliente(id_cliente: string): Promise<boolean> {
        const cliente = await prisma.userCliente.findFirst({
            where: { id_user: id_cliente, user: { eliminado: false } },
            select: { id_user: true },
        });
        return cliente !== null;
    }

    private async findOrThrow(tx: Tx, id: string) {
        return tx.suscripcion.findUniqueOrThrow({
            where: { id_suscripcion: id },
            include: SUSCRIPCION_INCLUDE,
        });
    }

    private async registrarHistorial(
        tx: Tx,
        accion: 'CREATE' | 'UPDATE' | 'COMPLETE' | 'CANCEL',
        id_suscripcion: string,
        id_user: string,
        antes: object | null,
        despues: object,
        comentario?: string | null,
    ): Promise<void> {
        await tx.historial.create({
            data: {
                entidad: 'SUSCRIPCION',
                accion,
                id_entidad: id_suscripcion,
                id_user,
                comentario: comentario ?? null,
                objeto_antes: antes ? (JSON.parse(JSON.stringify(antes)) as Prisma.InputJsonValue) : Prisma.JsonNull,
                objeto_despues: JSON.parse(JSON.stringify(despues)) as Prisma.InputJsonValue,
            },
        });
    }
}
