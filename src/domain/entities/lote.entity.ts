const toOptionalNumber = (v: any): number | undefined =>
    v === null || v === undefined || v === '' ? undefined : Number(v);

export class LoteEntity {
    constructor(
        public id_lote: string,
        public proveedor: string,
        public productor: string,
        public finca: string,
        public distrito: string,
        public departamento: string,
        public peso_g: number,
        public variedades: string[],
        public proceso: string,
        public tipo_lote: string,
        public fecha_registro: Date,
        public eliminado: boolean,
        public owned_by_store: boolean,
        public clasificacion?: string,
        public costo?: number,
        public altura?: number,
        public id_user?: string,
        public id_analisis?: string,
        public peso_tostado_g?: number,
        public precio_1?: number,
        public escala_2?: number,
        public escala_3?: number,
        public provincia?: string,
        public anio_cosecha?: number,
    ) { }

    public static fromObject(obj: { [key: string]: any }): LoteEntity {
        const {
            id_lote,
            proveedor,
            productor,
            finca,
            distrito,
            departamento,
            peso_g,
            variedades,
            proceso,
            tipo_lote,
            eliminado,
            owned_by_store,
            clasificacion,
            costo,
            altura,
            id_user,
            id_analisis,
            peso_tostado_g,
            fecha_registro,
            precio_1, escala_2, escala_3,
            provincia, anio_cosecha,
        } = obj;

        if (!id_lote) throw new Error('id_lote property is required');
        if (!variedades) throw new Error('variedades property is required');
        if (!proceso) throw new Error('proceso property is required');

        const newFechaRegistro = new Date(fecha_registro);
        if (isNaN(newFechaRegistro.getTime())) {
            throw new Error('fecha_registro no es válida');
        }

        return new LoteEntity(
            id_lote,
            proveedor,
            productor,
            finca,
            distrito,
            departamento,
            peso_g,
            variedades,
            proceso,
            tipo_lote,
            newFechaRegistro,
            eliminado,
            owned_by_store ?? false,
            clasificacion,
            costo,
            altura,
            id_user,
            id_analisis,
            peso_tostado_g,
            precio_1 ?? undefined, escala_2 ?? undefined, escala_3 ?? undefined,
            provincia ?? undefined, anio_cosecha ?? undefined,
        );
    }
}


export interface InventarioLoteMini {
  id_inventario: string;
  id_lote: string;
  id_almacen: string;
  cantidad_g: number;
  cantidad_tostado_g?: number;
  fecha_registro: Date;
  fecha_editado?: Date | null;
  almacen?: {
    id_almacen: string;
    nombre: string;
  } | null;
}

export class LoteConInventarioEntity {
  constructor(
    public id_lote: string,
    public proveedor: string,
    public productor: string,
    public finca: string,
    public distrito: string,
    public departamento: string,
    public peso_g: number,
    public variedades: string[],
    public proceso: string,
    public tipo_lote: string,
    public fecha_registro: Date,
    public eliminado: boolean,
    public owned_by_store: boolean,

    public inventarioLotes: InventarioLoteMini[] = [],

    public clasificacion?: string,
    public costo?: number,
    public altura?: number,
    public id_user?: string,
    public id_analisis?: string,
    public peso_tostado_g?: number,
    public precio_1?: number,
    public escala_2?: number,
    public escala_3?: number,
    public provincia?: string,
    public anio_cosecha?: number,
  ) {}

  static fromObject(obj: { [key: string]: any }): LoteConInventarioEntity {
    const {
      id_lote,
      proveedor,
      productor,
      finca,
      distrito,
      departamento,
      peso_g,
      variedades,
      proceso,
      tipo_lote,
      eliminado,
      owned_by_store,
      clasificacion,
      costo,
      altura,
      id_user,
      id_analisis,
      peso_tostado_g,
      fecha_registro,
      inventarioLotes,
      precio_1, escala_2, escala_3,
      provincia, anio_cosecha,
    } = obj;

    if (!id_lote) throw new Error('id_lote property is required');
    if (!variedades) throw new Error('variedades property is required');
    if (!proceso) throw new Error('proceso property is required');

    const newFechaRegistro = new Date(fecha_registro);
    if (isNaN(newFechaRegistro.getTime())) throw new Error('fecha_registro no es válida');

    const invMapped: InventarioLoteMini[] = Array.isArray(inventarioLotes)
      ? inventarioLotes.map((i: any) => ({
          id_inventario: i.id_inventario,
          id_lote: i.id_lote,
          id_almacen: i.id_almacen,
          cantidad_g: Number(i.cantidad_g ?? 0),
          cantidad_tostado_g: i.cantidad_tostado_g ? Number(i.cantidad_tostado_g) : undefined,
          fecha_registro: new Date(i.fecha_registro),
          fecha_editado: i.fecha_editado ? new Date(i.fecha_editado) : null,
          almacen: i.almacen
            ? { id_almacen: i.almacen.id_almacen, nombre: i.almacen.nombre }
            : null,
        }))
      : [];

    return new LoteConInventarioEntity(
      id_lote,
      proveedor,
      productor,
      finca,
      distrito,
      departamento,
      peso_g,
      variedades,
      proceso,
      tipo_lote,
      newFechaRegistro,
      eliminado,
      owned_by_store ?? false,
      invMapped,
      clasificacion,
      costo,
      altura,
      id_user,
      id_analisis,
      peso_tostado_g,
      precio_1 ?? undefined, escala_2 ?? undefined, escala_3 ?? undefined,
      provincia ?? undefined, anio_cosecha ?? undefined,
    );
  }
}