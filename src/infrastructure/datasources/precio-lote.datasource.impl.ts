import { Prisma } from "@prisma/client";
import { prisma } from "../../data/postgres";
import { PrecioLoteDataSource } from "../../domain/datasources/precio-lote.datasource";
import { FiltrosListaPreciosDto } from "../../domain/dtos/lotes/precio-lote/filtros";
import { UpsertPrecioLoteDto } from "../../domain/dtos/lotes/precio-lote/upsert";
import { LotePrecioListadoEntity } from "../../domain/entities/lote-precio-listado.entity";
import { PrecioLoteEntity } from "../../domain/entities/precio-lote.entity";

// Fechas y demás tipos → JSON plano para las columnas Json del Historial.
const aJson = (obj: object): Prisma.InputJsonValue => JSON.parse(JSON.stringify(obj));

export class PrecioLoteDataSourceImpl implements PrecioLoteDataSource {

    async getPrecioByLote(id_lote: string): Promise<PrecioLoteEntity | null> {
        const precio = await prisma.precioLote.findUnique({ where: { id_lote } });
        if (!precio) return null;
        return PrecioLoteEntity.fromObject(precio);
    }

    async upsertPrecio(dto: UpsertPrecioLoteDto): Promise<PrecioLoteEntity> {
        const precio = await prisma.$transaction(async (tx) => {
            const antes = await tx.precioLote.findUnique({ where: { id_lote: dto.id_lote } });

            const despues = await tx.precioLote.upsert({
                where: { id_lote: dto.id_lote },
                create: { id_lote: dto.id_lote, ...dto.values },
                update: dto.values,
            });

            await tx.historial.create({
                data: {
                    entidad: 'PRECIO_LOTE',
                    accion: antes ? 'UPDATE' : 'CREATE',
                    id_entidad: dto.id_lote,
                    id_user: dto.id_user,
                    objeto_antes: antes ? aJson(antes) : Prisma.JsonNull,
                    objeto_despues: aJson(despues),
                },
            });

            return despues;
        });

        return PrecioLoteEntity.fromObject(precio);
    }

    async getListadoPrecios(filtros: FiltrosListaPreciosDto): Promise<LotePrecioListadoEntity[]> {
        const lotes = await prisma.lote.findMany({
            where: {
                owned_by_store: true,
                eliminado: false,
                tipo_lote: 'Lote Verde',
                ...(filtros.clasificacion && { clasificacion: filtros.clasificacion }),
            },
            include: {
                origen: true,
                proveedor: { select: { id_proveedor: true, nombre: true } },
                precio: true,
                inventarioLotes: { select: { cantidad_g: true } },
            },
            orderBy: { id_lote: 'asc' },
        });
        return lotes.map(l => LotePrecioListadoEntity.fromObject(l));
    }
}
