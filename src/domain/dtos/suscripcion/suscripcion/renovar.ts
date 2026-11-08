export class RenovarSuscripcionDto {

    private constructor(
        public readonly id_suscripcion: string,
        public readonly created_by: string,           // usuario de la sesión
        public readonly id_tipo_suscripcion?: string, // sin valor → mismo plan
        public readonly comentario?: string | null,
    ) {}

    static create(props: { [key: string]: any }): [string?, RenovarSuscripcionDto?] {
        const { id_suscripcion, created_by, id_tipo_suscripcion, comentario } = props;

        if (!id_suscripcion) return ['id_suscripcion es requerido', undefined];
        if (!created_by) return ['created_by es requerido', undefined];

        if (comentario !== undefined && comentario !== null && typeof comentario !== 'string')
            return ['comentario debe ser texto', undefined];

        return [undefined, new RenovarSuscripcionDto(
            id_suscripcion,
            created_by,
            id_tipo_suscripcion || undefined,
            comentario?.trim() || null,
        )];
    }
}
