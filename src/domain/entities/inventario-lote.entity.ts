export class InventarioLoteEntity {
  constructor(
    public id_inventario: string,
    public id_lote: string,
    public id_almacen: string,
    public cantidad_g: number,
    public fecha_registro: Date,
    public fecha_editado?: Date,
    public cantidad_tostado_g?: number,
  ) {}

  static fromObject(obj: { [key: string]: any }): InventarioLoteEntity {
    const {
      id_inventario,
      id_lote,
      id_almacen,
      cantidad_g,
      fecha_registro,
      fecha_editado,
      cantidad_tostado_g
    } = obj;

    if (!id_inventario) throw new Error('id_inventario property is required');
    if (!id_lote) throw new Error('id_lote property is required');
    if (!id_almacen) throw new Error('id_almacen property is required');

    if (cantidad_g === undefined || cantidad_g === null) {
      throw new Error('cantidad_g property is required');
    }
    if (typeof cantidad_g !== 'number' || isNaN(cantidad_g) || cantidad_g < 0) {
      throw new Error('cantidad_g must be a number >= 0');
    }

    if (!fecha_registro) throw new Error('fecha_registro property is required');
    const fr = new Date(fecha_registro);
    if (isNaN(fr.getTime())) {
      throw new Error('fecha_registro is not a valid date');
    }

    let fe: Date | undefined;
    if (fecha_editado) {
      fe = new Date(fecha_editado);
      if (isNaN(fe.getTime())) {
        throw new Error('fecha_editado is not a valid date');
      }
    }

    let ct: number | undefined;
    if (cantidad_tostado_g !== undefined && cantidad_tostado_g !== null) {
      const n = typeof cantidad_tostado_g === 'string'
        ? Number(cantidad_tostado_g)
        : cantidad_tostado_g;

      if (typeof n !== 'number' || isNaN(n) || n < 0) {
        throw new Error('cantidad_tostado_g must be a number >= 0');
      }

      ct = n;
    }

    return new InventarioLoteEntity(
      id_inventario,
      id_lote,
      id_almacen,
      cantidad_g,
      fr,
      fe,
      ct
    );
  }
}