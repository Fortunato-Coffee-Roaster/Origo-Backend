export class SuscripcionCongelamientoEntity {

    constructor(
        public id_congelamiento: string,
        public id_suscripcion: string,
        public fecha_congelamiento: Date,
        public fecha_reactivacion: Date | null, // null = sigue congelada
        public dias: number | null,             // se llena al reactivar
        public comentario: string | null,
        public congelado_por: string,
        public reactivado_por: string | null,
        public created_at: Date,
    ) {}

    static fromObject(obj: { [key: string]: any }): SuscripcionCongelamientoEntity {
        const {
            id_congelamiento, id_suscripcion, fecha_congelamiento, fecha_reactivacion,
            dias, comentario, congelado_por, reactivado_por, created_at,
        } = obj;

        if (!id_congelamiento) throw new Error('id_congelamiento es requerido');
        if (!id_suscripcion) throw new Error('id_suscripcion es requerido');
        if (!fecha_congelamiento) throw new Error('fecha_congelamiento es requerido');
        if (!congelado_por) throw new Error('congelado_por es requerido');
        if (!created_at) throw new Error('created_at es requerido');

        return new SuscripcionCongelamientoEntity(
            id_congelamiento,
            id_suscripcion,
            new Date(fecha_congelamiento),
            fecha_reactivacion ? new Date(fecha_reactivacion) : null,
            dias ?? null,
            comentario ?? null,
            congelado_por,
            reactivado_por ?? null,
            new Date(created_at),
        );
    }
}
