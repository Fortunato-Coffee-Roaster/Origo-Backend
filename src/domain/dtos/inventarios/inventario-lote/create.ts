export class CreateInventarioLoteDto {
  private constructor(
    public readonly id_lote: string,
    public readonly id_almacen: string,
    public readonly cantidad_g: number,
    public readonly cantidad_tostado_g?: number,
  ) {}

  static create(props: { [key: string]: any }): [string?, CreateInventarioLoteDto?] {
    const { id_lote, id_almacen, cantidad_g, cantidad_tostado_g } = props;

    if (!id_lote) return ['id_lote es requerido', undefined];
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

    let nCantidadTostado: number | undefined;
    if (cantidad_tostado_g !== undefined && cantidad_tostado_g !== null) {
      nCantidadTostado = typeof cantidad_tostado_g === 'string'
        ? Number(cantidad_tostado_g)
        : cantidad_tostado_g;

      if (
        typeof nCantidadTostado !== 'number' ||
        isNaN(nCantidadTostado) ||
        nCantidadTostado < 0
      ) {
        return ['cantidad_tostado_g debe ser un número >= 0', undefined];
      }
    }

    return [
      undefined,
      new CreateInventarioLoteDto(
        String(id_lote),
        String(id_almacen),
        nCantidad,
        nCantidadTostado
      )
    ];
  }
}