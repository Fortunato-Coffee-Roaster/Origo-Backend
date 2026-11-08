import { prisma } from "../../data/postgres";
import { CompraCafeDataSource } from "../../domain/datasources/compra-cafe.datasource";
import { CreateCompraCafeDto } from "../../domain/dtos/lotes/compra-cafe/create";
import { FiltrosComprasCafeDto } from "../../domain/dtos/lotes/compra-cafe/filtros";
import { CompraCafeEntity, CostoKgLote } from "../../domain/entities/compra-cafe.entity";
import { TipoMovimiento } from "../../enums/tipo-movimiento.enum";
import { EntidadInventario } from "../../enums/entidad-inventario.enum";

const COMPRA_RELACIONES = {
    proveedor: { select: { id_proveedor: true, nombre: true } },
    almacen: { select: { id_almacen: true, nombre: true } },
};

export class CompraCafeDataSourceImpl implements CompraCafeDataSource {

    async createCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity> {
        const compra = await prisma.compraCafe.create({
            data: dto.values,
            include: COMPRA_RELACIONES,
        });
        return CompraCafeEntity.fromObject(compra);
    }

    async registrarCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity> {
        const compra = await prisma.$transaction(async (tx) => {
            const creada = await tx.compraCafe.create({
                data: dto.values,
                include: COMPRA_RELACIONES,
            });

            await tx.inventarioLote.upsert({
                where: { id_lote_id_almacen: { id_lote: dto.id_lote, id_almacen: dto.id_almacen } },
                create: { id_lote: dto.id_lote, id_almacen: dto.id_almacen, cantidad_g: dto.cantidad_g },
                update: { cantidad_g: { increment: dto.cantidad_g } },
            });

            await tx.movimientoAlmacen.create({
                data: {
                    tipo: TipoMovimiento.INGRESO,
                    entidad: EntidadInventario.LOTE,
                    id_entidad_primario: dto.id_lote,
                    id_almacen_destino: dto.id_almacen,
                    cantidad: dto.cantidad_g,
                    id_user: dto.id_user,
                    comentario: `Ingreso por compra de café ${creada.id_compra}`,
                },
            });

            return creada;
        });

        return CompraCafeEntity.fromObject(compra);
    }

    async getComprasByLote(id_lote: string): Promise<CompraCafeEntity[]> {
        const compras = await prisma.compraCafe.findMany({
            where: { id_lote },
            include: COMPRA_RELACIONES,
            orderBy: { fecha_ingreso: 'desc' },
        });
        return compras.map(c => CompraCafeEntity.fromObject(c));
    }

    async getCompras(filtros: FiltrosComprasCafeDto): Promise<CompraCafeEntity[]> {
        const compras = await prisma.compraCafe.findMany({
            where: {
                ...((filtros.from || filtros.to) && {
                    fecha_ingreso: {
                        ...(filtros.from && { gte: filtros.from }),
                        ...(filtros.to && { lte: filtros.to }),
                    },
                }),
            },
            include: COMPRA_RELACIONES,
            orderBy: { fecha_ingreso: 'desc' },
        });
        return compras.map(c => CompraCafeEntity.fromObject(c));
    }

    async getCostosKg(id_lotes: string[]): Promise<CostoKgLote[]> {
        if (id_lotes.length === 0) return [];

        const compras = await prisma.compraCafe.findMany({
            where: { id_lote: { in: id_lotes } },
            select: { id_lote: true, cantidad_g: true, costo_compra_kg: true, costo_adicional_kg: true },
        });

        // Promedio ponderado por cantidad_g de (costo_compra_kg + costo_adicional_kg).
        const acumulado = new Map<string, { gramos: number; total: number }>();
        for (const c of compras) {
            const a = acumulado.get(c.id_lote) ?? { gramos: 0, total: 0 };
            a.gramos += c.cantidad_g;
            a.total += c.cantidad_g * (c.costo_compra_kg + (c.costo_adicional_kg ?? 0));
            acumulado.set(c.id_lote, a);
        }

        return [...acumulado.entries()]
            .filter(([, a]) => a.gramos > 0)
            .map(([id_lote, a]) => ({ id_lote, costo_kg: a.total / a.gramos }));
    }
}
