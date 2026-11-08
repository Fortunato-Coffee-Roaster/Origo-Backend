export class CreateInventarioLoteTostadoDto {

  private constructor(
    public readonly id_lote_tostado: string,
    public readonly id_almacen: string,
    public readonly cantidad_g: number,
  ) {}

  static create(props: { [key: string]: any }): [string?, CreateInventarioLoteTostadoDto?] {

    const { id_lote_tostado, id_almacen, cantidad_g } = props;

    if (!id_lote_tostado) return ['id_lote_tostado es requerido', undefined];
    if (!id_almacen) return ['id_almacen es requerido', undefined];

    if (cantidad_g === undefined || cantidad_g === null) {
      return ['cantidad_g es requerida', undefined];
    }

    const nCantidad = typeof cantidad_g === 'string'
      ? Number(cantidad_g)
      : cantidad_g;

    if (typeof nCantidad !== 'number' || isNaN(nCantidad) || nCantidad < 0) {
      return ['cantidad_g debe ser un número >= 0', undefined];
    }

    return [
      undefined,
      new CreateInventarioLoteTostadoDto(
        String(id_lote_tostado),
        String(id_almacen),
        nCantidad
      )
    ];
  }
}
