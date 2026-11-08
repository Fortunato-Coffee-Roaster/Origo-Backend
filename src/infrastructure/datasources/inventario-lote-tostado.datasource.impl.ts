import { prisma } from "../../data/postgres";
import { InventarioLoteTostadoDataSource } from "../../domain/datasources/inventario-lote-tostado.datasource";
import { CreateInventarioLoteTostadoDto } from "../../domain/dtos/inventarios/inventario-lote-tostado/create";
import { UpdateInventarioLoteTostadoDto } from "../../domain/dtos/inventarios/inventario-lote-tostado/update";
import { InventarioLoteTostadoEntity } from "../../domain/entities/inventario-lote-tostado.entity";

export class InventarioLoteTostadoDataSourceImpl
  implements InventarioLoteTostadoDataSource {

  async createInventario(
    dto: CreateInventarioLoteTostadoDto
  ): Promise<InventarioLoteTostadoEntity> {

    const inventario = await prisma.inventarioLoteTostado.create({
      data: {
        id_lote_tostado: dto.id_lote_tostado,
        id_almacen: dto.id_almacen,
        cantidad_g: dto.cantidad_g,
      },
    });

    return InventarioLoteTostadoEntity.fromObject(inventario);
  }

  async updateInventario(
    id_inventario: string,
    dto: UpdateInventarioLoteTostadoDto
  ): Promise<InventarioLoteTostadoEntity> {

    const inventario = await prisma.inventarioLoteTostado.update({
      where: { id_inventario },
      data: dto.values,
    });

    return InventarioLoteTostadoEntity.fromObject(inventario);
  }

  async getByLoteTostadoAndAlmacen(
    id_lote_tostado: string,
    id_almacen: string
  ): Promise<InventarioLoteTostadoEntity | null> {

    const inventario = await prisma.inventarioLoteTostado.findFirst({
      where: {
        id_lote_tostado,
        id_almacen,
      },
    });

    if (!inventario) return null;
    return InventarioLoteTostadoEntity.fromObject(inventario);
  }

  async getByAlmacen(
    id_almacen: string
  ): Promise<InventarioLoteTostadoEntity[]> {

    const inventarios = await prisma.inventarioLoteTostado.findMany({
      where: { id_almacen },
      orderBy: { fecha_registro: "asc" },
    });

    return inventarios.map(InventarioLoteTostadoEntity.fromObject);
  }

  async getByLote(id_lote_tostado: string): Promise<InventarioLoteTostadoEntity[]> {
    const inventarios = await prisma.inventarioLoteTostado.findMany({
      where: { id_lote_tostado },
      orderBy: { fecha_registro: 'asc' },
    });
    return inventarios.map(InventarioLoteTostadoEntity.fromObject);
  }
}
