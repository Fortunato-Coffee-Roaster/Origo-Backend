import { hoy, parseFecha } from "../../../utils/fechas";

export class CongelarSuscripcionDto {

    private constructor(
        public readonly id_suscripcion: string,
        public readonly congelado_por: string, // usuario de la sesión
        public readonly fecha_congelamiento: Date,
        public readonly comentario: string | null,
    ) {}

    static create(props: { [key: string]: any }): [string?, CongelarSuscripcionDto?] {
        const { id_suscripcion, congelado_por, fecha_congelamiento, comentario } = props;

        if (!id_suscripcion) return ['id_suscripcion es requerido', undefined];
        if (!congelado_por) return ['congelado_por es requerido', undefined];

        const fecha = parseFecha(fecha_congelamiento);
        if (fecha === undefined) return ['fecha_congelamiento no es válida', undefined];

        if (comentario !== undefined && comentario !== null && typeof comentario !== 'string')
            return ['comentario debe ser texto', undefined];

        return [undefined, new CongelarSuscripcionDto(
            id_suscripcion,
            congelado_por,
            fecha ?? hoy(),
            comentario?.trim() || null,
        )];
    }
}
