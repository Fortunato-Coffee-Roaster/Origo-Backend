// '' / null / undefined → undefined ; cualquier otro valor → Number (puede dar NaN, se valida abajo)
const toOptionalInt = (v: any): number | undefined =>
    v === null || v === undefined || v === '' ? undefined : Number(v);

export class CreateLoteRapidoDto {
    private constructor(
        public readonly id_lote        : string,
        public readonly proveedor      : string,
        public readonly productor      : string,
        public readonly finca          : string,
        public readonly distrito      : string,
        public readonly departamento   : string,
        public readonly peso_g         : number,
        public readonly variedades     : string[],
        public readonly proceso        : string,
        public readonly tipo_lote      : string,
        public readonly clasificacion? : string,
        public readonly id_user?       : string,
        public readonly peso_tostado_g?: number,
        public readonly id_analisis?   : string,
        public readonly provincia?     : string,
        public readonly anio_cosecha?  : number,
        public readonly altura?        : number,
    ) {}

    static create(props: { [key: string]: any } ): [string?, CreateLoteRapidoDto?] {
        let {
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
            clasificacion,
            id_user,
            peso_tostado_g,
            id_analisis,
            provincia,
            anio_cosecha,
            altura,
        } = props;

        // if (!id_lote) return ['El id_lote es requerido', undefined];
        if  (!id_user) return ['El id_user es requerido', undefined]; 
        // if (!productor) return ['El productor es requerido', undefined];
        // if (!finca) return ['La finca es requerida', undefined];
        // if (!region) return ['La región es requerida', undefined];
        // if (!departamento) return ['El departamento es requerido', undefined];
        if (!peso_g || peso_g <= 0) return ['El peso (g) debe ser mayor a 0', undefined];
        if (!variedades) return ['Las variedades son requeridas', undefined];
        if (!proceso) return ['El proceso es requerido', undefined];

        const alturaNum = toOptionalInt(altura);
        if (alturaNum !== undefined && (!Number.isInteger(alturaNum) || alturaNum <= 0)) {
            return ['La altitud debe ser un número entero mayor a 0', undefined];
        }

        const anioNum = toOptionalInt(anio_cosecha);
        const anioMax = new Date().getFullYear() + 1;
        if (anioNum !== undefined && (!Number.isInteger(anioNum) || anioNum < 2000 || anioNum > anioMax)) {
            return [`El año de cosecha debe estar entre 2000 y ${anioMax}`, undefined];
        }

        return [undefined, new CreateLoteRapidoDto(
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
            clasificacion,
            id_user,
            peso_tostado_g,
            id_analisis,
            provincia?.trim() || undefined,
            anioNum,
            alturaNum,
        )];
    }
   
}