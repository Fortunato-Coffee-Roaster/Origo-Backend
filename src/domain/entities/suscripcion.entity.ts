import { diasEntre, hoy } from "../utils/fechas";
import { SuscripcionCongelamientoEntity } from "./suscripcion-congelamiento.entity";
import { TipoSuscripcionEntity } from "./tipo-suscripcion.entity";

export const ESTADOS_SUSCRIPCION = ['ACTIVA', 'RENOVADA', 'FINALIZADA', 'CANCELADA'] as const;
export type EstadoSuscripcion = typeof ESTADOS_SUSCRIPCION[number];

export class SuscripcionEntity {

    // Calculados (se serializan en la respuesta).
    public congelada: boolean;
    public vencida: boolean;
    public dias_restantes: number;

    constructor(
        public id_suscripcion: string,
        public id_cliente: string,
        public id_tipo_suscripcion: string,
        public duracion_meses: number,
        public peso_bolsa_g: number,
        public cant_bolsas: number,
        public fecha_inicio: Date,
        public fecha_fin: Date,
        public estado: EstadoSuscripcion,
        public id_suscripcion_anterior: string | null,
        public comentario: string | null,
        public created_by: string,
        public created_at: Date,
        public updated_at: Date,
        public tipo: TipoSuscripcionEntity | null,
        public congelamientos: SuscripcionCongelamientoEntity[],
    ) {
        const abierto = this.congelamientoAbierto;

        this.congelada = abierto !== null;

        // Congelada: el tiempo no corre, los días se miden hasta la fecha de congelamiento.
        const referencia = abierto ? abierto.fecha_congelamiento : hoy();
        this.dias_restantes = diasEntre(referencia, this.fecha_fin);

        this.vencida = this.estado === 'ACTIVA' && !this.congelada && this.dias_restantes < 0;
    }

    get congelamientoAbierto(): SuscripcionCongelamientoEntity | null {
        return this.congelamientos.find(c => c.fecha_reactivacion === null) ?? null;
    }

    // Espera la fila de Prisma con include: { tipo: true, congelamientos: true }
    static fromObject(obj: { [key: string]: any }): SuscripcionEntity {
        const {
            id_suscripcion, id_cliente, id_tipo_suscripcion, duracion_meses, peso_bolsa_g,
            cant_bolsas, fecha_inicio, fecha_fin, estado, id_suscripcion_anterior,
            comentario, created_by, created_at, updated_at, tipo, congelamientos,
        } = obj;

        if (!id_suscripcion) throw new Error('id_suscripcion es requerido');
        if (!id_cliente) throw new Error('id_cliente es requerido');
        if (!id_tipo_suscripcion) throw new Error('id_tipo_suscripcion es requerido');
        if (!fecha_inicio) throw new Error('fecha_inicio es requerido');
        if (!fecha_fin) throw new Error('fecha_fin es requerido');
        if (!ESTADOS_SUSCRIPCION.includes(estado)) throw new Error('estado no es válido');
        if (!created_by) throw new Error('created_by es requerido');

        return new SuscripcionEntity(
            id_suscripcion,
            id_cliente,
            id_tipo_suscripcion,
            Number(duracion_meses),
            Number(peso_bolsa_g),
            Number(cant_bolsas),
            new Date(fecha_inicio),
            new Date(fecha_fin),
            estado,
            id_suscripcion_anterior ?? null,
            comentario ?? null,
            created_by,
            new Date(created_at),
            new Date(updated_at),
            tipo ? TipoSuscripcionEntity.fromObject(tipo) : null,
            Array.isArray(congelamientos)
                ? congelamientos.map((c: any) => SuscripcionCongelamientoEntity.fromObject(c))
                : [],
        );
    }
}
