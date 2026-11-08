import { InventarioMuestraEntity } from "./inventario-muestra.entity";

const toOptionalNumber = (v: any): number | undefined =>
    v === null || v === undefined || v === '' ? undefined : Number(v);

export class MuestraEntity {
    constructor(
        public id_muestra: string,
        public owned_by_store: boolean, 
        public nombre_muestra: string,
        public proveedor: string,
        public productor: string,
        public finca: string,
        public distrito: string,
        public departamento: string,
        public peso_g: number,
        public variedades: string,
        public proceso: string,
        public fecha_registro: Date,
        public completado: boolean,
        public eliminado: boolean,
        public id_user?: string,
        public id_analisis?: string,
        public provincia?: string,
        public anio_cosecha?: number,
        public altura?: number,
    ) { }

    public static fromObject(obj: { [key: string]: any }): MuestraEntity {
        const {
            id_muestra,
            owned_by_store,
            nombre_muestra,
            proveedor,
            productor,
            finca,
            distrito,
            departamento,
            peso_g,
            variedades,
            proceso,
            fecha_registro,
            completado = false,
            eliminado = false,
            id_user,
            id_analisis,
            provincia,
            anio_cosecha,
            altura,
        } = obj;

        if (peso_g === undefined || peso_g === null) throw new Error('peso_g property is required');
        if (!variedades) throw new Error('variedades property is required');
        if (!proceso) throw new Error('proceso property is required');

        const newFechaRegistro = new Date(fecha_registro);
        if (isNaN(newFechaRegistro.getTime())) throw new Error('fecha_registro no es válida');

        return new MuestraEntity(
            id_muestra,
            !!owned_by_store,
            nombre_muestra,
            proveedor,
            productor,
            finca,
            distrito,
            departamento,
            peso_g,
            Array.isArray(variedades) ? variedades.join(', ') : variedades,
            proceso,
            newFechaRegistro,
            completado,
            eliminado,
            id_user,
            id_analisis,
            provincia ?? undefined,
            toOptionalNumber(anio_cosecha),
            toOptionalNumber(altura),
        );
    }
}

export class MuestraConInventarioEntity {
    constructor(
        public id_muestra: string,
        public owned_by_store: boolean,
        public nombre_muestra: string,
        public proveedor: string,
        public productor: string,
        public finca: string,
        public distrito: string,
        public departamento: string,
        public peso_g: number,
        public variedades: string,
        public proceso: string,
        public fecha_registro: Date,
        public completado: boolean,
        public eliminado: boolean,
        public inventarioMuestras: InventarioMuestraEntity[],
        public id_user?: string,
        public id_analisis?: string,
        public provincia?: string,
        public anio_cosecha?: number,
        public altura?: number,
    ) { }

    public static fromObject(obj: { [key: string]: any }): MuestraConInventarioEntity {
        const muestra = MuestraEntity.fromObject(obj);
        const inventarioMuestras = (obj.inventarioMuestras || []).map(
            (inv: any) => InventarioMuestraEntity.fromObject(inv)
        );

        return new MuestraConInventarioEntity(
            muestra.id_muestra,
            muestra.owned_by_store,
            muestra.nombre_muestra,
            muestra.proveedor,
            muestra.productor,
            muestra.finca,
            muestra.distrito,
            muestra.departamento,
            muestra.peso_g,
            muestra.variedades,
            muestra.proceso,
            muestra.fecha_registro,
            muestra.completado,
            muestra.eliminado,
            inventarioMuestras,
            muestra.id_user,
            muestra.id_analisis,
            muestra.provincia,
            muestra.anio_cosecha,
            muestra.altura,
        );
    }
}