// Número > 0 o undefined si no vino. NaN se reporta como inválido.
const aNumero = (v: any): number | undefined =>
    v === undefined || v === null || v === '' ? undefined : Number(v);

export class UpsertPrecioLoteDto {

    private constructor(
        public readonly id_lote: string,
        public readonly id_user: string,   // usuario de la sesión, para el Historial
        public readonly tipo_user: string, // tipo del usuario de la sesión (solo ADMIN puede editar)
        public readonly precio_sugerido_kg: number | null,
        public readonly precio_escala_1_kg: number,
        public readonly precio_escala_2_kg: number,
        public readonly precio_escala_3_kg: number,
    ) {}

    // Columnas de la tabla PrecioLote (sin id_lote).
    get values() {
        return {
            precio_sugerido_kg: this.precio_sugerido_kg,
            precio_escala_1_kg: this.precio_escala_1_kg,
            precio_escala_2_kg: this.precio_escala_2_kg,
            precio_escala_3_kg: this.precio_escala_3_kg,
        };
    }

    static create(props: { [key: string]: any }): [string?, UpsertPrecioLoteDto?] {
        const {
            id_lote, id_user, tipo_user,
            precio_sugerido_kg, precio_escala_1_kg, precio_escala_2_kg, precio_escala_3_kg,
        } = props;

        if (!id_lote) return ['id_lote es requerido', undefined];
        if (!id_user) return ['id_user es requerido', undefined];
        if (!tipo_user) return ['tipo_user es requerido', undefined];

        const sugerido = aNumero(precio_sugerido_kg);
        const escala1 = aNumero(precio_escala_1_kg);
        const escala2 = aNumero(precio_escala_2_kg);
        const escala3 = aNumero(precio_escala_3_kg);

        if (escala1 === undefined) return ['precio_escala_1_kg es requerido', undefined];
        if (escala2 === undefined) return ['precio_escala_2_kg es requerido', undefined];
        if (escala3 === undefined) return ['precio_escala_3_kg es requerido', undefined];

        const precios: [string, number | undefined][] = [
            ['precio_sugerido_kg', sugerido],
            ['precio_escala_1_kg', escala1],
            ['precio_escala_2_kg', escala2],
            ['precio_escala_3_kg', escala3],
        ];
        for (const [nombre, valor] of precios) {
            if (valor !== undefined && (isNaN(valor) || valor <= 0)) {
                return [`${nombre} debe ser un número mayor a 0`, undefined];
            }
        }

        // Misma regla que el CHECK de la BD: sugerido ≥ escala_1 ≥ escala_2 ≥ escala_3 > 0.
        if (escala1 < escala2) return ['precio_escala_1_kg debe ser mayor o igual a precio_escala_2_kg', undefined];
        if (escala2 < escala3) return ['precio_escala_2_kg debe ser mayor o igual a precio_escala_3_kg', undefined];
        if (sugerido !== undefined && sugerido < escala1)
            return ['precio_sugerido_kg debe ser mayor o igual a precio_escala_1_kg', undefined];

        return [undefined, new UpsertPrecioLoteDto(
            id_lote,
            id_user,
            tipo_user,
            sugerido ?? null,
            escala1,
            escala2,
            escala3,
        )];
    }
}
