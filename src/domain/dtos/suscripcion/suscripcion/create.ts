import { hoy, parseFecha } from "../../../utils/fechas";

export class CreateSuscripcionDto {

    private constructor(
        public readonly id_cliente: string,
        public readonly id_tipo_suscripcion: string,
        public readonly fecha_inicio: Date,
        public readonly created_by: string, // usuario de la sesión
        public readonly comentario: string | null,
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateSuscripcionDto?] {
        const { id_cliente, id_tipo_suscripcion, fecha_inicio, created_by, comentario } = props;

        if (!id_cliente) return ['id_cliente es requerido', undefined];
        if (!id_tipo_suscripcion) return ['id_tipo_suscripcion es requerido', undefined];
        if (!created_by) return ['created_by es requerido', undefined];

        const fechaInicio = parseFecha(fecha_inicio);
        if (fechaInicio === undefined) return ['fecha_inicio no es válida', undefined];

        if (comentario !== undefined && comentario !== null && typeof comentario !== 'string')
            return ['comentario debe ser texto', undefined];

        return [undefined, new CreateSuscripcionDto(
            id_cliente,
            id_tipo_suscripcion,
            fechaInicio ?? hoy(),
            created_by,
            comentario?.trim() || null,
        )];
    }
}
