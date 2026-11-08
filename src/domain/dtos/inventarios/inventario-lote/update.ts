export class UpdateInventarioLoteDto {

  private constructor(
    public readonly cantidad_g?: number,
    public readonly cantidad_tostado_g?: number
  ) {}

  get values() {
    const out: { [key: string]: any } = {};
    if (this.cantidad_g !== undefined) {out.cantidad_g = this.cantidad_g;}
    if (this.cantidad_tostado_g !== undefined) {out.cantidad_tostado_g = this.cantidad_tostado_g;}
    out.fecha_editado = new Date();
    return out;
  }

  static update(props: { [key: string]: any }): [string?, UpdateInventarioLoteDto?] {

    const { cantidad_g, cantidad_tostado_g } = props;

    if (cantidad_g === undefined || cantidad_g === null) {
      return ['cantidad_g es requerida', undefined];
    }


    return [
      undefined,
      new UpdateInventarioLoteDto(
        cantidad_g, 
        cantidad_tostado_g
      )
    ];
  }
}
