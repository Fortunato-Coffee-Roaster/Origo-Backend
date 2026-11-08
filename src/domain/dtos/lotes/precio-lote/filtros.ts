// Filtros de GET /lote/precios (query string).
export class FiltrosListaPreciosDto {

    private constructor(
        public readonly clasificacion?: string,
        public readonly solo_con_stock?: boolean,
    ) {}

    static create(props: { [key: string]: any }): [string?, FiltrosListaPreciosDto?] {
        const { clasificacion, solo_con_stock } = props;

        if (clasificacion !== undefined && typeof clasificacion !== 'string')
            return ['clasificacion debe ser texto', undefined];

        let soloConStock: boolean | undefined;
        if (solo_con_stock !== undefined && solo_con_stock !== '') {
            if (solo_con_stock === true || solo_con_stock === 'true') soloConStock = true;
            else if (solo_con_stock === false || solo_con_stock === 'false') soloConStock = false;
            else return ['solo_con_stock debe ser true o false', undefined];
        }

        return [undefined, new FiltrosListaPreciosDto(
            clasificacion?.trim() || undefined,
            soloConStock,
        )];
    }
}
