import { LoteEntity } from "./lote.entity";

export class PedidoEntity {
    constructor(
        public id_pedido: string,
        public fecha_registro: Date,
        public tipo_pedido: string,
        public cantidad: number,
        public estado_pedido: string,
        public owned_by_store: boolean,
        public eliminado: boolean,
        public id_user?: string,
        public facturado?: boolean,
        public id_lote?: string,
        public id_nuevoLote?: string,
        public id_nuevoLote_tostado?: string,
        public id_almacen?: string,
        public comentario?: string,
        public pesos_g?: number[],
        public fecha_tueste?: Date,
        public tostadora?: string,
        public id_lote_tostado?: string,
        public id_producto?: string,
        public creado_por_id?: string,
        public completado_por_id?: string,
        public fecha_completado?: Date,
        public id_lote_destino?: string | null,
        public usuario_nombre?: string | null,
    ) { }

    static fromObject(obj: { [key: string]: any }): PedidoEntity {
        const {
            id_pedido, fecha_registro, tipo_pedido, cantidad, estado_pedido,
            id_user, owned_by_store, eliminado, facturado, id_lote, id_nuevoLote,
            id_nuevoLote_tostado, id_almacen, comentario, pesos_g, fecha_tueste,
            tostadora, id_lote_tostado, id_producto, creado_por_id,
            completado_por_id, fecha_completado, id_lote_destino, usuario_nombre
        } = obj;

        if (!tipo_pedido) throw new Error('tipo_pedido is required');
        if (!cantidad) throw new Error('cantidad is required');
        // id_user ya no es siempre requerido — puede ser undefined si owned_by_store es true
        if (!owned_by_store && !id_user) throw new Error('id_user is required cuando el pedido no es de tienda');

        if (fecha_registro && isNaN(new Date(fecha_registro).getTime()))
            throw new Error('fecha_registro is invalid');
        if (fecha_tueste && isNaN(new Date(fecha_tueste).getTime()))
            throw new Error('fecha_tueste is invalid');
        if (fecha_completado && isNaN(new Date(fecha_completado).getTime()))
            throw new Error('fecha_completado is invalid');

        return new PedidoEntity(
            id_pedido, fecha_registro, tipo_pedido, cantidad, estado_pedido,
            !!owned_by_store, eliminado, id_user, facturado, id_lote, id_nuevoLote,
            id_nuevoLote_tostado, id_almacen, comentario, pesos_g, fecha_tueste,
            tostadora, id_lote_tostado, id_producto, creado_por_id,
            completado_por_id, fecha_completado, id_lote_destino, usuario_nombre
        );
    }
}

export class PedidoConLoteEntity extends PedidoEntity {
    constructor(
        pedido: PedidoEntity,
        public lote?: LoteEntity | null,
    ) {
        super(
            pedido.id_pedido, pedido.fecha_registro, pedido.tipo_pedido,
            pedido.cantidad, pedido.estado_pedido, pedido.owned_by_store,
            pedido.eliminado, pedido.id_user, pedido.facturado, pedido.id_lote,
            pedido.id_nuevoLote, pedido.id_nuevoLote_tostado, pedido.id_almacen,
            pedido.comentario, pedido.pesos_g, pedido.fecha_tueste, pedido.tostadora,
            pedido.id_lote_tostado, pedido.id_producto, pedido.creado_por_id,
            pedido.completado_por_id, pedido.fecha_completado, pedido.id_lote_destino,
            pedido.usuario_nombre
        );
    }

    static fromObject(obj: { [key: string]: any }): PedidoConLoteEntity {
        const pedido = PedidoEntity.fromObject(obj);
        const lote = obj.lote ? LoteEntity.fromObject(obj.lote) : null;
        return new PedidoConLoteEntity(pedido, lote);
    }
}