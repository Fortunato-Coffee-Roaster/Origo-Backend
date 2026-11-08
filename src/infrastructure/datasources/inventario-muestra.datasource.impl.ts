import { prisma } from "../../data/postgres";
import { InventarioMuestraDataSource } from "../../domain/datasources/inventario-muestra.datasource";
import { CreateInventarioMuestraDto } from "../../domain/dtos/inventarios/inventario-muestra/create";
import { UpdateInventarioMuestraDto } from "../../domain/dtos/inventarios/inventario-muestra/update";
import { InventarioMuestraEntity } from "../../domain/entities/inventario-muestra.entity";

export class InventarioMuestraDataSourceImpl
  implements InventarioMuestraDataSource {

  async createInventario(
    dto: CreateInventarioMuestraDto
  ): Promise<InventarioMuestraEntity> {

    const inventario = await prisma.inventarioMuestra.create({
      data: {
        id_muestra: dto.id_muestra,
        id_almacen: dto.id_almacen,
        peso_g: dto.peso_g,
      },
    });

    return InventarioMuestraEntity.fromObject(inventario);
  }

  async updateInventario(
    id_inventario: string,
    dto: UpdateInventarioMuestraDto
  ): Promise<InventarioMuestraEntity> {

    const inventario = await prisma.inventarioMuestra.update({
      where: { id_inventario },
      data: dto.values,
    });

    return InventarioMuestraEntity.fromObject(inventario);
  }

  async getByMuestraAndAlmacen(
    id_muestra: string,
    id_almacen: string
  ): Promise<InventarioMuestraEntity | null> {

    const inventario = await prisma.inventarioMuestra.findFirst({
      where: {
        id_muestra,
        id_almacen,
      },
    });

    if (!inventario) return null;
    return InventarioMuestraEntity.fromObject(inventario);
  }

  async getByAlmacen(
    id_almacen: string
  ): Promise<InventarioMuestraEntity[]> {

    const inventarios = await prisma.inventarioMuestra.findMany({
      where: { id_almacen },
      orderBy: { fecha_registro: "asc" },
    });

    return inventarios.map(InventarioMuestraEntity.fromObject);
  }
}
