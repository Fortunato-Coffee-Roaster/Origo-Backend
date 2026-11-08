const textoOpcional = (v: any): string | null =>
    v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim();

export class CreateProveedorDto {

    private constructor(
        public readonly nombre: string,
        public readonly documento: string | null,
        public readonly telefono: string | null,
        public readonly activo: boolean,
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateProveedorDto?] {
        const { nombre, documento, telefono, activo } = props;

        if (!nombre || !String(nombre).trim()) return ['nombre es requerido', undefined];
        if (activo !== undefined && typeof activo !== 'boolean') return ['activo debe ser booleano', undefined];

        return [undefined, new CreateProveedorDto(
            String(nombre).trim(),
            textoOpcional(documento),
            textoOpcional(telefono),
            activo ?? true,
        )];
    }
}
