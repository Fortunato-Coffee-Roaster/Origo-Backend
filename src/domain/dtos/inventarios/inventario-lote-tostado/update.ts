export class UpdateInventarioLoteTostadoDto {

  private constructor(
    public readonly cantidad_g?: number,
  ) {}

  get values() {
    const out: { [key: string]: any } = {};
    if (this.cantidad_g !== undefined) {
      out.cantidad_g = this.cantidad_g;
      out.fecha_editado = new Date();
    }
    return out;
  }

  static update(props: { [key: string]: any }): [string?, UpdateInventarioLoteTostadoDto?] {

    const { cantidad_g } = props;

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
      new UpdateInventarioLoteTostadoDto(nCantidad)
    ];
  }
}
