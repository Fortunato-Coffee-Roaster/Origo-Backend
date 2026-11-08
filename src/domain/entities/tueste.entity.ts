export class TuesteEntity {
    constructor(
        public id_tueste: string,
        public num_batch: number,
        public id_lote: string,
        public tostadora: string,
        public id_pedido: string,
        public densidad: number,
        public humedad: number,
        public peso_entrada_g: number,
        public fecha_tueste: Date,
        public estado_tueste: string,
        public owned_by_store: boolean,
        public id_cliente?: string,
        public temperatura_entrada?: number,
        public llama_inicial?: number,
        public aire_inicial?: number,
        public punto_no_retorno?: number,
        public tiempo_despues_crack?: number,
        public temperatura_crack?: number,
        public temperatura_salida?: number,
        public tiempo_total?: number,
        public porcentaje_caramelizacion?: number,
        public desarrollo?: number,
        public grados_desarrollo?: number,
        public peso_salida_g?: number,
        public merma_porcentaje?: number,
        public agtrom_comercial?: number,
        public agtrom_gourmet?: number,
        public id_lote_tostado?: number,
        public eliminado?: number,
    ) {}

    static fromObject(obj: { [key: string]: any }): TuesteEntity {
        const {
            id_tueste, num_batch, id_lote, tostadora, id_cliente, id_pedido,
            owned_by_store, densidad, humedad, peso_entrada_g, fecha_tueste, estado_tueste,
            temperatura_entrada, llama_inicial, aire_inicial, punto_no_retorno,
            tiempo_despues_crack, temperatura_crack, temperatura_salida, tiempo_total,
            porcentaje_caramelizacion, desarrollo, grados_desarrollo, peso_salida_g,
            merma_porcentaje, agtrom_comercial, agtrom_gourmet, id_lote_tostado, eliminado
        } = obj;

        if (!id_tueste) throw new Error('El ID del tueste es requerido');
        if (!id_lote) throw new Error('El ID del lote es requerido');
        if (!num_batch || num_batch <= 0) throw new Error('El número de batch debe ser mayor a 0');
        if (!fecha_tueste) throw new Error('La fecha del tueste es requerida');
        if (!tostadora) throw new Error('La tostadora es requerida');
        if (!peso_entrada_g) throw new Error('El peso de entrada es requerido');
        if (!id_pedido) throw new Error('El ID del pedido es requerido');

        return new TuesteEntity(
            id_tueste, num_batch, id_lote, tostadora, id_pedido,
            densidad, humedad, peso_entrada_g, fecha_tueste, estado_tueste,
            owned_by_store ?? false, id_cliente,
            temperatura_entrada, llama_inicial, aire_inicial, punto_no_retorno,
            tiempo_despues_crack, temperatura_crack, temperatura_salida, tiempo_total,
            porcentaje_caramelizacion, desarrollo, grados_desarrollo, peso_salida_g,
            merma_porcentaje, agtrom_comercial, agtrom_gourmet, id_lote_tostado, eliminado
        );
    }
}