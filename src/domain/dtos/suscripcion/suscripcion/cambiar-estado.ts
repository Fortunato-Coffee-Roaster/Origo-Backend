// Se usa para finalizar y cancelar.
export class CambiarEstadoSuscripcionDto {

    private constructor(
        public readonly id_suscripcion: string,
        public readonly id_user: string, // usuario de la sesión
        public readonly comentario: string | null,
    ) {}

    static create(props: { [key: string]: any }): [string?, CambiarEstadoSuscripcionDto?] {
        const { id_suscripcion, id_user, comentario } = props;

        if (!id_suscripcion) return ['id_suscripcion es requerido', undefined];
        if (!id_user) return ['id_user es requerido', undefined];

        if (comentario !== undefined && comentario !== null && typeof comentario !== 'string')
            return ['comentario debe ser texto', undefined];

        return [undefined, new CambiarEstadoSuscripcionDto(
            id_suscripcion,
            id_user,
            comentario?.trim() || null,
        )];
    }
}
