// Filtros de GET /origen (query string). Comparación sin distinguir mayúsculas.
export class FiltrosOrigenDto {

    private constructor(
        public readonly departamento?: string,
        public readonly provincia?: string,
    ) {}

    static create(props: { [key: string]: any }): [string?, FiltrosOrigenDto?] {
        const { departamento, provincia } = props;

        if (departamento !== undefined && typeof departamento !== 'string') return ['departamento debe ser texto', undefined];
        if (provincia !== undefined && typeof provincia !== 'string') return ['provincia debe ser texto', undefined];

        return [undefined, new FiltrosOrigenDto(
            departamento?.trim() || undefined,
            provincia?.trim() || undefined,
        )];
    }
}
