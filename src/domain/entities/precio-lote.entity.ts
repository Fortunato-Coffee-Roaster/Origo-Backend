// Precios por kg de un lote de la tienda (1:1 con Lote).
export class PrecioLoteEntity {

    constructor(
        public id_lote: string,
        public precio_sugerido_kg: number | null,
        public precio_escala_1_kg: number,
        public precio_escala_2_kg: number,
        public precio_escala_3_kg: number,
        public updated_at: Date,
    ) {}

    static fromObject(obj: { [key: string]: any }): PrecioLoteEntity {
        const {
            id_lote, precio_sugerido_kg, precio_escala_1_kg,
            precio_escala_2_kg, precio_escala_3_kg, updated_at,
        } = obj;

        if (!id_lote) throw new Error('id_lote es requerido');
        if (precio_escala_1_kg === undefined || precio_escala_1_kg === null) throw new Error('precio_escala_1_kg es requerido');
        if (precio_escala_2_kg === undefined || precio_escala_2_kg === null) throw new Error('precio_escala_2_kg es requerido');
        if (precio_escala_3_kg === undefined || precio_escala_3_kg === null) throw new Error('precio_escala_3_kg es requerido');
        if (!updated_at) throw new Error('updated_at es requerido');

        return new PrecioLoteEntity(
            id_lote,
            precio_sugerido_kg ?? null,
            Number(precio_escala_1_kg),
            Number(precio_escala_2_kg),
            Number(precio_escala_3_kg),
            new Date(updated_at),
        );
    }
}
