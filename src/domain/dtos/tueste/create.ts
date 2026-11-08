export class CreateTuesteDto {
    private constructor(
        public readonly id_lote: string,
        public readonly num_batch: number,
        public readonly fecha_tueste: Date,
        public readonly tostadora: string,
        public readonly densidad: number,
        public readonly humedad: number,
        public readonly peso_entrada_g: number,
        public readonly id_pedido: string,
        public readonly owned_by_store: boolean,
        public readonly id_cliente?: string,
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateTuesteDto?] {
        const {
            id_lote, num_batch, fecha_tueste, tostadora, id_cliente,
            densidad, humedad, peso_entrada_g, id_pedido, owned_by_store,
        } = props;

        if (!id_lote) return ['ID de lote es requerido', undefined];
        if (!num_batch || num_batch <= 0) return ['Número de batch debe ser mayor a 0', undefined];
        if (!id_pedido) return ['ID de pedido es requerido', undefined];
        if (!tostadora) return ['Tostadora es requerida', undefined];
        if (!peso_entrada_g) return ['Peso de entrada es requerido', undefined];

        const fechaParsed = new Date(fecha_tueste);
        if (fechaParsed.toString() === 'Invalid Date') return ['Fecha de tueste no es válida', undefined];

        const esOwnedByStore = !!owned_by_store;

        // Nunca ambos, nunca ninguno — siempre se especifica explícitamente.
        if (esOwnedByStore && id_cliente) {
            return ['Un tueste no puede ser de tienda y de cliente al mismo tiempo', undefined];
        }
        if (!esOwnedByStore && !id_cliente) {
            return ['Debes indicar si el tueste es de tienda (owned_by_store) o de un cliente (id_cliente)', undefined];
        }

        return [undefined,
            new CreateTuesteDto(
                id_lote,
                num_batch,
                fecha_tueste,
                tostadora,
                densidad,
                humedad,
                peso_entrada_g,
                id_pedido,
                esOwnedByStore,
                esOwnedByStore ? undefined : id_cliente,
        )];
    }
}