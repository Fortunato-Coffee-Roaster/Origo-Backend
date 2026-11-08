const toOptionalInt = (v: any): number | undefined =>
    v === null || v === undefined || v === '' ? undefined : Number(v);

export class CreateLoteDto {
    private constructor(
        public readonly id_lote: string,
        public readonly productor: string,
        public readonly finca: string,
        public readonly id_origen: string,
        public readonly peso_g: number,
        public readonly variedades: string[],
        public readonly proceso: string,
        public readonly tipo_lote: string,
        public readonly owned_by_store: boolean,
        public readonly clasificacion?: string,
        public readonly costo?: number,
        public readonly altura?: number,
        public readonly id_user?: string,
        public readonly peso_tostado_g?: number,
        public readonly id_proveedor?: string,
        public readonly anio_cosecha?: number,
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateLoteDto?] {
        let {
            id_lote, id_proveedor, productor, finca, id_origen, peso_g,
            variedades, proceso, tipo_lote, owned_by_store, clasificacion,
            costo, altura, id_user, peso_tostado_g, anio_cosecha,
        } = props;

        if (!productor) return ['El productor es requerido', undefined];
        if (!finca) return ['La finca es requerida', undefined];
        if (!id_origen) return ['El origen (id_origen) es requerido', undefined];
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

        const esOwnedByStore = !!owned_by_store;

        if (esOwnedByStore && id_user) {
            return ['Un lote no puede ser de tienda y de cliente al mismo tiempo', undefined];
        }
        if (!esOwnedByStore && !id_user) {
            return ['Debes indicar si el lote es de tienda (owned_by_store) o de un cliente (id_user)', undefined];
        }

        return [undefined, new CreateLoteDto(
            id_lote, productor, finca, id_origen, peso_g, variedades,
            proceso, tipo_lote, esOwnedByStore, clasificacion, costo, alturaNum,
            esOwnedByStore ? undefined : id_user, peso_tostado_g, id_proveedor || undefined,
            anioNum,
        )];
    }

}