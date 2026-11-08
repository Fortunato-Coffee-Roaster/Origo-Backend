import { hoy, parseFecha } from "../../../utils/fechas";

export class ReactivarSuscripcionDto {

    private constructor(
        public readonly id_suscripcion: string,
        public readonly reactivado_por: string, // usuario de la sesión
        public readonly fecha_reactivacion: Date,
        public readonly comentario: string | null,
    ) {}

    static create(props: { [key: string]: any }): [string?, ReactivarSuscripcionDto?] {
        const { id_suscripcion, reactivado_por, fecha_reactivacion, comentario } = props;

        if (!id_suscripcion) return ['id_suscripcion es requerido', undefined];
        if (!reactivado_por) return ['reactivado_por es requerido', undefined];

        const fecha = parseFecha(fecha_reactivacion);
        if (fecha === undefined) return ['fecha_reactivacion no es válida', undefined];

        if (comentario !== undefined && comentario !== null && typeof comentario !== 'string')
            return ['comentario debe ser texto', undefined];

        return [undefined, new ReactivarSuscripcionDto(
            id_suscripcion,
            reactivado_por,
            fecha ?? hoy(),
            comentario?.trim() || null,
        )];
    }
}
