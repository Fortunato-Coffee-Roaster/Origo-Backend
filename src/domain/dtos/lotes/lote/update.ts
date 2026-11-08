const toNullableInt = (v: any): number | null | undefined =>
    v === undefined ? undefined : v === null || v === '' ? null : Number(v);

export class UpdateLoteDto {
    private constructor(
        public readonly id_proveedor?: string | null,
        public readonly productor?: string,
        public readonly finca?: string,
        public readonly id_origen?: string,
        public readonly peso_g?: number,
        public readonly variedades?: string[],
        public readonly proceso?: string,
        public readonly tipo_lote?: string,
        public readonly clasificacion?: string,
        public readonly costo?: number,
        public readonly altura?: number | null,
        public readonly id_user?: string,
        public readonly id_analisis?: string,
        public readonly peso_tostado_g?: number,
        public readonly anio_cosecha?: number | null,
    ) { }

    get values() {
        const returnObj: { [key: string]: any } = {};
        if (this.productor) returnObj.productor = this.productor;
        if (this.finca) returnObj.finca = this.finca;
        if (this.id_origen) returnObj.id_origen = this.id_origen;
        if (this.id_proveedor !== undefined) returnObj.id_proveedor = this.id_proveedor;
        if (this.variedades) returnObj.variedades = this.variedades;
        if (this.proceso) returnObj.proceso = this.proceso;
        if (this.tipo_lote) returnObj.tipo_lote = this.tipo_lote;
        if (this.id_analisis) returnObj.id_analisis = this.id_analisis;
        if (this.peso_g !== undefined) returnObj.peso_g = this.peso_g;
        if (this.peso_tostado_g !== undefined) returnObj.peso_tostado_g = this.peso_tostado_g;
        if (this.clasificacion) returnObj.clasificacion = this.clasificacion;
        if (this.costo !== undefined) returnObj.costo = this.costo;
        if (this.altura !== undefined) returnObj.altura = this.altura;
        if (this.anio_cosecha !== undefined) returnObj.anio_cosecha = this.anio_cosecha;

        return returnObj;
    }


    static update(props: { [key: string]: any }): [string?, UpdateLoteDto?] {
        let {
            id_proveedor,
            productor,
            finca,
            id_origen,
            peso_g,
            variedades,
            proceso,
            tipo_lote,
            clasificacion,
            costo,
            altura,
            id_user,
            id_analisis,
            peso_tostado_g,
            anio_cosecha,
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

        if (id_origen !== undefined && !id_origen) return ['El origen (id_origen) no puede quedar vacío', undefined];
        // id_proveedor: undefined = no se toca, '' o null = se quita el proveedor
        const idProveedorFinal = id_proveedor === undefined ? undefined : (id_proveedor || null);

        return [undefined,
            new UpdateLoteDto(
                idProveedorFinal,
                productor,
                finca,
                id_origen,
                peso_g,
                variedades,
                proceso,
                tipo_lote,
                clasificacion,
                costo,
                alturaNum,
                id_user,
                id_analisis,
                peso_tostado_g,
                anioNum,
            )];
    }
}