import { Prisma } from "@prisma/client";
import { prisma } from "../../data/postgres";
import { TipoSuscripcionDataSource } from "../../domain/datasources/tipo-suscripcion.datasource";
import { CreateTipoSuscripcionDto } from "../../domain/dtos/suscripcion/tipo-suscripcion/create";
import { UpdateTipoSuscripcionDto } from "../../domain/dtos/suscripcion/tipo-suscripcion/update";
import { TipoSuscripcionEntity } from "../../domain/entities/tipo-suscripcion.entity";

// Fechas y demás tipos → JSON plano para las columnas Json del Historial.
const aJson = (obj: object): Prisma.InputJsonValue => JSON.parse(JSON.stringify(obj));

export class TipoSuscripcionDataSourceImpl implements TipoSuscripcionDataSource {

    async createTipoSuscripcion(dto: CreateTipoSuscripcionDto): Promise<TipoSuscripcionEntity> {
        const tipo = await prisma.$transaction(async (tx) => {
            const creado = await tx.tipoSuscripcion.create({ data: dto.values });

            await tx.historial.create({
                data: {
                    entidad: 'TIPO_SUSCRIPCION',
                    accion: 'CREATE',
                    id_entidad: creado.id_tipo_suscripcion,
                    id_user: dto.id_user,
                    objeto_despues: aJson(creado),
                },
            });

            return creado;
        });

        return TipoSuscripcionEntity.fromObject(tipo);
    }

    async updateTipoSuscripcion(id: string, dto: UpdateTipoSuscripcionDto): Promise<TipoSuscripcionEntity> {
        const tipo = await prisma.$transaction(async (tx) => {
            const antes = await tx.tipoSuscripcion.findUniqueOrThrow({ where: { id_tipo_suscripcion: id } });

            const despues = await tx.tipoSuscripcion.update({
                where: { id_tipo_suscripcion: id },
                data: dto.values,
            });

            await tx.historial.create({
                data: {
                    entidad: 'TIPO_SUSCRIPCION',
                    accion: 'UPDATE',
                    id_entidad: id,
                    id_user: dto.id_user,
                    objeto_antes: aJson(antes),
                    objeto_despues: aJson(despues),
                },
            });

            return despues;
        });

        return TipoSuscripcionEntity.fromObject(tipo);
    }

    async getTipoSuscripcionById(id: string): Promise<TipoSuscripcionEntity | null> {
        const tipo = await prisma.tipoSuscripcion.findUnique({ where: { id_tipo_suscripcion: id } });
        if (!tipo) return null;
        return TipoSuscripcionEntity.fromObject(tipo);
    }

    async getTipoSuscripcionByNombre(nombre: string): Promise<TipoSuscripcionEntity | null> {
        const tipo = await prisma.tipoSuscripcion.findFirst({
            where: { nombre: { equals: nombre, mode: 'insensitive' } },
        });
        if (!tipo) return null;
        return TipoSuscripcionEntity.fromObject(tipo);
    }

    async getAllTiposSuscripcion(): Promise<TipoSuscripcionEntity[]> {
        const tipos = await prisma.tipoSuscripcion.findMany({
            orderBy: [{ activo: 'desc' }, { cantidad_meses: 'asc' }, { nombre: 'asc' }],
        });
        return tipos.map(t => TipoSuscripcionEntity.fromObject(t));
    }
}
