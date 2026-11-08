export class CreatePedidoDto {
    private constructor(
        public readonly tipo_pedido: string,
        public readonly cantidad: number,
        public readonly owned_by_store: boolean,
        public readonly id_user?: string,
        public readonly comentario?: string,
        public readonly facturado?: boolean,
        public readonly id_lote?: string,
        public readonly id_nuevoLote?: string,
        public readonly id_nuevoLote_tostado?: string,
        public readonly id_almacen?: string,
        public readonly pesos_g?: number[],
        public readonly tostadora?: string,
        public readonly fecha_tueste?: Date,
        public readonly id_lote_tostado?: string,
        public readonly id_producto?: string,
        public readonly creado_por_id?: string,
    ) { }

    static create(props: { [key: string]: any }): [string?, CreatePedidoDto?] {
        const {
            tipo_pedido,
            cantidad,
            id_user,
            owned_by_store,
            comentario,
            facturado,
            id_lote,
            id_nuevoLote,
            id_nuevoLote_tostado,
            id_almacen,
            pesos_g,
            tostadora,
            fecha_tueste,
            id_lote_tostado,
            id_producto,
            creado_por_id,
        } = props;

        if (!tipo_pedido) return ['El tipo de pedido es requerido', undefined];
        if (!cantidad) return ['La cantidad es requerida', undefined];

        // Solo "Orden Tueste" y "Maquila" pueden ser de tienda (sin cliente).
        // Todos los demás tipos siguen exigiendo id_user siempre.
        const esOwnedByStore = !!owned_by_store;
        const puedeSerDeTienda = ['Orden Tueste', 'Maquila'].includes(tipo_pedido);

        if (esOwnedByStore && !puedeSerDeTienda) {
            return [`El tipo de pedido "${tipo_pedido}" no puede ser de tienda, requiere un cliente`, undefined];
        }

        // Nunca ambos, nunca ninguno — siempre se especifica explícitamente.
        if (esOwnedByStore && id_user) {
            return ['Un pedido no puede ser de tienda y de cliente al mismo tiempo', undefined];
        }

        if (!esOwnedByStore && !id_user) {
            return ['El ID del usuario es requerido', undefined];
        }

        if (['Venta Verde', 'Tostado Verde', 'Orden Tueste'].includes(tipo_pedido) && !id_lote)
            return ['El ID del lote es requerido para este tipo de pedido', undefined];

        if (['Venta Verde', 'Tostado Verde', 'Orden Tueste'].includes(tipo_pedido) && !id_almacen)
            return ['El ID del almacén es requerido para este tipo de pedido', undefined];

        const fechaTuesteDate = fecha_tueste ? new Date(fecha_tueste) : undefined;

        const dto = new CreatePedidoDto(
            tipo_pedido,
            cantidad,
            esOwnedByStore,
            esOwnedByStore ? undefined : id_user,
            comentario,
            facturado,
            id_lote,
            id_nuevoLote,
            id_nuevoLote_tostado,
            id_almacen,
            pesos_g,
            tostadora,
            fechaTuesteDate,
            id_lote_tostado,
            id_producto,
            creado_por_id,
        );

        const filteredDto = Object.fromEntries(
            Object.entries(dto).filter(([_, v]) => v !== undefined)
        ) as CreatePedidoDto;

        return [undefined, filteredDto];
    }
}