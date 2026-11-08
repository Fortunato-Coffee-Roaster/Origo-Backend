export class CreateInventarioMuestraDto {

  private constructor(
    public readonly id_muestra: string,
    public readonly id_almacen: string,
    public readonly peso_g: number,
  ) {}

  static create(props: { [key: string]: any }): [string?, CreateInventarioMuestraDto?] {

    const { id_muestra, id_almacen, peso_g } = props;

    if (!id_muestra) return ['id_muestra es requerido', undefined];
    if (!id_almacen) return ['id_almacen es requerido', undefined];

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
      new CreateInventarioMuestraDto(
        String(id_muestra),
        String(id_almacen),
        nPeso
      )
    ];
  }
}
