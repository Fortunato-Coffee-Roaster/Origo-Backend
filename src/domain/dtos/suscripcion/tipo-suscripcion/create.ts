const esEnteroPositivo = (valor: unknown): boolean =>
    Number.isInteger(Number(valor)) && Number(valor) > 0;

export class CreateTipoSuscripcionDto {

    private constructor(
        public readonly nombre: string,
        public readonly cantidad_meses: number,
        public readonly peso_bolsa_g: number,
        public readonly cant_bolsas: number,
        public readonly activo: boolean,
        public readonly id_user: string, // usuario de la sesión, para el Historial
    ) {}

    // Columnas de la tabla TipoSuscripcion (sin id_user).
    get values() {
        return {
            nombre: this.nombre,
            cantidad_meses: this.cantidad_meses,
            peso_bolsa_g: this.peso_bolsa_g,
            cant_bolsas: this.cant_bolsas,
            activo: this.activo,
        };
    }

    static create(props: { [key: string]: any }): [string?, CreateTipoSuscripcionDto?] {
        const { nombre, cantidad_meses, peso_bolsa_g, cant_bolsas, activo, id_user } = props;

        if (!id_user) return ['id_user es requerido', undefined];
        if (!nombre || !String(nombre).trim()) return ['nombre es requerido', undefined];
        if (!esEnteroPositivo(cantidad_meses)) return ['cantidad_meses debe ser un entero mayor a 0', undefined];
        if (!esEnteroPositivo(peso_bolsa_g)) return ['peso_bolsa_g debe ser un entero mayor a 0 (gramos)', undefined];
        if (!esEnteroPositivo(cant_bolsas)) return ['cant_bolsas debe ser un entero mayor a 0', undefined];
        if (activo !== undefined && typeof activo !== 'boolean') return ['activo debe ser booleano', undefined];

        return [undefined, new CreateTipoSuscripcionDto(
            String(nombre).trim(),
            Number(cantidad_meses),
            Number(peso_bolsa_g),
            Number(cant_bolsas),
            activo ?? true,
            id_user,
        )];
    }
}
