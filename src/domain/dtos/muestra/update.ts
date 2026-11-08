// undefined → no se toca ; '' / null → se limpia (null) ; otro → Number (puede dar NaN, se valida abajo)
const toNullableInt = (v: any): number | null | undefined =>
  v === undefined ? undefined : v === null || v === '' ? null : Number(v);

export class UpdateMuestraDto {
  private constructor(
    public readonly proveedor           ?: string,
    public readonly nombre_muestra      ?: string,
    public readonly productor           ?: string,
    public readonly finca               ?: string,
    public readonly distrito            ?: string,
    public readonly departamento        ?: string,
    public readonly peso_g              ?: number,
    public readonly proceso             ?: string,
    public readonly variedades          ?: string,
    public readonly id_analisis         ?: string,
    public readonly provincia           ?: string | null,
    public readonly anio_cosecha        ?: number | null,
    public readonly altura              ?: number | null,
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {};
    if (this.proveedor) returnObj.proveedor = this.proveedor;
    if (this.nombre_muestra) returnObj.nombre_muestra = this.nombre_muestra;
    if (this.productor) returnObj.productor = this.productor;
    if (this.finca) returnObj.finca = this.finca;
    if (this.distrito) returnObj.distrito = this.distrito;   // antes escribía en "provincia" por error
    if (this.departamento) returnObj.departamento = this.departamento;
    if (this.peso_g) returnObj.peso_g = this.peso_g;
    if (this.proceso) returnObj.proceso = this.proceso;
    if (this.variedades) returnObj.variedades = this.variedades;
    if (this.id_analisis) returnObj.id_analisis = this.id_analisis;
    if (this.provincia !== undefined) returnObj.provincia = this.provincia;
    if (this.anio_cosecha !== undefined) returnObj.anio_cosecha = this.anio_cosecha;
    if (this.altura !== undefined) returnObj.altura = this.altura;

    return returnObj;
  }

  static update(props: { [key: string]: any }): [string?, UpdateMuestraDto?] {
  let {
      proveedor,
      nombre_muestra,
      productor,
      finca,
      distrito,
      departamento,
      peso_g,
      proceso,
      variedades,
      id_analisis,
      provincia,
      anio_cosecha,
      altura,
    } = props;

    const alturaNum = toNullableInt(altura);
    if (typeof alturaNum === 'number' && (!Number.isInteger(alturaNum) || alturaNum <= 0)) {
      return ['La altitud debe ser un número entero mayor a 0', undefined];
    }

    const anioNum = toNullableInt(anio_cosecha);
    const anioMax = new Date().getFullYear() + 1;
    if (typeof anioNum === 'number' && (!Number.isInteger(anioNum) || anioNum < 2000 || anioNum > anioMax)) {
      return [`El año de cosecha debe estar entre 2000 y ${anioMax}`, undefined];
    }

    // provincia: undefined = no se toca, '' o null = se limpia
    const provinciaFinal = provincia === undefined
      ? undefined
      : (typeof provincia === 'string' && provincia.trim()) ? provincia.trim() : null;

    return [
      undefined,
      new UpdateMuestraDto(
        proveedor,
        nombre_muestra,
        productor,
        finca,
        distrito,
        departamento,
        peso_g,
        proceso,
        variedades,
        id_analisis,
        provinciaFinal,
        anioNum,
        alturaNum,
      )
    ];
  }
}