import { Prisma } from "@prisma/client";
import { prisma } from "../../data/postgres";
import { InventarioGenericoDataSource, InventarioItemRef } from "../../domain/datasources/inventario-generico.datasource";

export class InventarioGenericoDataSourceImpl implements InventarioGenericoDataSource {

    async obtenerStockDisponible(item: InventarioItemRef, tx: Prisma.TransactionClient | typeof prisma = prisma): Promise<number> {
        switch (item.entidad) {
            case 'LOTE': {
                const inv = await tx.inventarioLote.findUnique({
                    where: { id_lote_id_almacen: { id_lote: item.id_entidad, id_almacen: item.id_almacen } },
                });
                return inv?.cantidad_g ?? 0;
            }
            case 'LOTE_TOSTADO': {
                const inv = await tx.inventarioLoteTostado.findUnique({
                    where: { id_lote_tostado_id_almacen: { id_lote_tostado: item.id_entidad, id_almacen: item.id_almacen } },
                });
                return inv?.cantidad_g ?? 0;
            }
            case 'BOLSA': {
                const inv = await tx.inventarioBolsa.findUnique({
                    where: { id_bolsa_id_almacen: { id_bolsa: item.id_entidad, id_almacen: item.id_almacen } },
                });
                return inv?.cantidad ?? 0;
            }
            case 'PRODUCTO': {
                const inv = await tx.inventarioProducto.findFirst({
                    where: {
                        id_producto: item.id_entidad,
                        id_almacen: item.id_almacen,
                        gramaje: item.gramaje ?? null,
                        molienda: (item.molienda ?? 'NINGUNO') as any,
                    },
                });
                return inv?.cantidad ?? 0;
            }
            case 'INSUMO': {
                const inv = await tx.inventarioInsumo.findUnique({
                    where: { id_insumo_id_almacen: { id_insumo: item.id_entidad, id_almacen: item.id_almacen } },
                });
                return inv?.cantidad ?? 0;
            }
            case 'MUESTRA': {
                const inv = await tx.inventarioMuestra.findUnique({
                    where: { id_muestra_id_almacen: { id_muestra: item.id_entidad, id_almacen: item.id_almacen } },
                });
                return inv?.peso_g ?? 0;
            }
            default:
                throw new Error(`Tipo de entidad de inventario no soportado: ${item.entidad}`);
        }
    }

    async descontarStock(item: InventarioItemRef, tx: Prisma.TransactionClient | typeof prisma = prisma): Promise<void> {
        switch (item.entidad) {
            case 'LOTE':
                await tx.inventarioLote.update({
                    where: { id_lote_id_almacen: { id_lote: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad_g: { decrement: item.cantidad } },
                });
                return;
            case 'LOTE_TOSTADO':
                await tx.inventarioLoteTostado.update({
                    where: { id_lote_tostado_id_almacen: { id_lote_tostado: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad_g: { decrement: item.cantidad } },
                });
                return;
            case 'BOLSA':
                await tx.inventarioBolsa.update({
                    where: { id_bolsa_id_almacen: { id_bolsa: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad: { decrement: item.cantidad } },
                });
                return;
            case 'PRODUCTO':
                await tx.inventarioProducto.updateMany({
                    where: {
                        id_producto: item.id_entidad,
                        id_almacen: item.id_almacen,
                        gramaje: item.gramaje ?? null,
                        molienda: (item.molienda ?? 'NINGUNO') as any,
                    },
                    data: { cantidad: { decrement: item.cantidad } },
                });
                return;
            case 'INSUMO':
                await tx.inventarioInsumo.update({
                    where: { id_insumo_id_almacen: { id_insumo: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad: { decrement: item.cantidad } },
                });
                return;
            case 'MUESTRA':
                await tx.inventarioMuestra.update({
                    where: { id_muestra_id_almacen: { id_muestra: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { peso_g: { decrement: item.cantidad } },
                });
                return;
            default:
                throw new Error(`Tipo de entidad de inventario no soportado: ${item.entidad}`);
        }
    }

    async reingresarStock(item: InventarioItemRef, tx: Prisma.TransactionClient | typeof prisma = prisma): Promise<void> {
        switch (item.entidad) {
            case 'LOTE':
                await tx.inventarioLote.update({
                    where: { id_lote_id_almacen: { id_lote: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad_g: { increment: item.cantidad } },
                });
                return;
            case 'LOTE_TOSTADO':
                await tx.inventarioLoteTostado.update({
                    where: { id_lote_tostado_id_almacen: { id_lote_tostado: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad_g: { increment: item.cantidad } },
                });
                return;
            case 'BOLSA':
                await tx.inventarioBolsa.update({
                    where: { id_bolsa_id_almacen: { id_bolsa: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad: { increment: item.cantidad } },
                });
                return;
            case 'PRODUCTO':
                await tx.inventarioProducto.updateMany({
                    where: {
                        id_producto: item.id_entidad,
                        id_almacen: item.id_almacen,
                        gramaje: item.gramaje ?? null,
                        molienda: (item.molienda ?? 'NINGUNO') as any,
                    },
                    data: { cantidad: { increment: item.cantidad } },
                });
                return;
            case 'INSUMO':
                await tx.inventarioInsumo.update({
                    where: { id_insumo_id_almacen: { id_insumo: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { cantidad: { increment: item.cantidad } },
                });
                return;
            case 'MUESTRA':
                await tx.inventarioMuestra.update({
                    where: { id_muestra_id_almacen: { id_muestra: item.id_entidad, id_almacen: item.id_almacen } },
                    data: { peso_g: { increment: item.cantidad } },
                });
                return;
            default:
                throw new Error(`Tipo de entidad de inventario no soportado: ${item.entidad}`);
        }
    }
}