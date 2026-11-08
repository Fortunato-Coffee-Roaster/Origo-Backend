import { AlmacenEntity } from "./almacen.entity";

export class InventarioLoteTostadoEntity {
  constructor(
    public id_inventario: string,
    public id_lote_tostado: string,
    public id_almacen: string,
    public cantidad_g: number,
    public fecha_registro: Date,
    public fecha_editado?: Date,
    public almacen?: AlmacenEntity
  ) {}

  static fromObject(obj: { [key: string]: any }): InventarioLoteTostadoEntity {
    const {
      id_inventario,
      id_lote_tostado,
      id_almacen,
      cantidad_g,
      fecha_registro,
      fecha_editado,
      almacen
    } = obj;

    if (!id_inventario) throw new Error('id_inventario property is required');
    if (!id_lote_tostado) throw new Error('id_lote_tostado property is required');
    if (!id_almacen) throw new Error('id_almacen property is required');

    const newFechaRegistro = new Date(fecha_registro);
    if (isNaN(newFechaRegistro.getTime())) {
      throw new Error('fecha_registro no es válida');
    }

    const newFechaEditado = fecha_editado ? new Date(fecha_editado) : undefined;
    if (fecha_editado && isNaN(newFechaEditado!.getTime())) {
      throw new Error('fecha_editado no es válida');
    }

    return new InventarioLoteTostadoEntity(
      id_inventario,
      id_lote_tostado,
      id_almacen,
      cantidad_g,
      newFechaRegistro,
      newFechaEditado,
      almacen ? AlmacenEntity.fromObject(almacen) : undefined
    );
  }
}