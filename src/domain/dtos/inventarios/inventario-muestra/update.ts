export class UpdateInventarioMuestraDto {

  private constructor(
    public readonly peso_g?: number,
  ) {}

  get values() {
    const out: { [key: string]: any } = {};
    if (this.peso_g !== undefined) {
      out.peso_g = this.peso_g;
      out.fecha_editado = new Date();
    }
    return out;
  }

  static update(props: { [key: string]: any }): [string?, UpdateInventarioMuestraDto?] {

    const { peso_g } = props;

    if (peso_g === undefined || peso_g === null) {
      return ['peso_g es requerido', undefined];
    }

    const nPeso = typeof peso_g === 'string'
      ? Number(peso_g)
      : peso_g;

    if (typeof nPeso !== 'number' || isNaN(nPeso) || nPeso < 0) {
      return ['peso_g debe ser un número >= 0', undefined];
    }

    return [
      undefined,
      new UpdateInventarioMuestraDto(nPeso)
    ];
  }
}
