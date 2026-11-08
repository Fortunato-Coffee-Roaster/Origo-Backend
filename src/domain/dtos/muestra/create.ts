// '' / null / undefined → undefined ; cualquier otro valor → Number (puede dar NaN, se valida abajo)
const toOptionalInt = (v: any): number | undefined =>
    v === null || v === undefined || v === '' ? undefined : Number(v);

export class CreateMuestraDto {
    private constructor(
        public readonly id_muestra: string,
        public readonly owned_by_store: boolean,
        public readonly proveedor: string,
        public readonly nombre_muestra: string,
        public readonly productor: string,
        public readonly finca: string,
        public readonly distrito: string,
        public readonly departamento: string,
        public readonly peso_g: number,
        public readonly variedades: string[],
        public readonly proceso: string,
        public readonly id_user?: string,
        public readonly id_analisis?: string,
        public readonly provincia?: string,
        public readonly anio_cosecha?: number,
        public readonly altura?: number,
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateMuestraDto?] {
        let {
            id_muestra, owned_by_store, proveedor, nombre_muestra, productor,
            finca, distrito, departamento, peso_g, variedades, proceso, id_user, id_analisis,
            provincia, anio_cosecha, altura,
        } = props;

        if (!productor) return ['El productor es requerido', undefined];
        if (!finca) return ['La finca es requerida', undefined];
        if (!distrito) return ['El distrito es requerido', undefined];
        if (!departamento) return ['El departamento es requerido', undefined];
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

        // Nunca ambos, nunca ninguno — siempre se especifica explícitamente.
        if (esOwnedByStore && id_user) {
            return ['Una muestra no puede ser de tienda y de cliente al mismo tiempo', undefined];
        }
        if (!esOwnedByStore && !id_user) {
            return ['Debes indicar si la muestra es de tienda (owned_by_store) o de un cliente (id_user)', undefined];
        }

        return [undefined, new CreateMuestraDto(
            id_muestra,
            esOwnedByStore,
            proveedor,
            nombre_muestra,
            productor,
            finca,
            distrito,
            departamento,
            peso_g,
            variedades,
            proceso,
            esOwnedByStore ? undefined : id_user,
            id_analisis,
            provincia?.trim() || undefined,
            anioNum,
            alturaNum,
        )];
    }
}