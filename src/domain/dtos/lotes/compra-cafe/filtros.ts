const fechaOpcional = (v: any): Date | undefined | null => {
    if (v === undefined || v === null || v === '') return undefined;
    const fecha = new Date(String(v));
    return isNaN(fecha.getTime()) ? null : fecha;
};

export class FiltrosComprasCafeDto {

    private constructor(
        public readonly from?: Date,
        public readonly to?: Date,
    ) {}

    static create(props: { [key: string]: any }): [string?, FiltrosComprasCafeDto?] {
        const from = fechaOpcional(props.from);
        const to = fechaOpcional(props.to);

        if (from === null) return ['from no es una fecha válida', undefined];
        if (to === null) return ['to no es una fecha válida', undefined];
        if (from && to && from > to) return ['from no puede ser mayor que to', undefined];

        return [undefined, new FiltrosComprasCafeDto(from, to)];
    }
}
