import { PedidoEntity } from "../../entities/pedido.entity";
import { LoteRepository } from "../../repository/lote.repository";
import { PedidoRepository } from "../../repository/pedido.repository";
import { UserRepository } from "../../repository/user.repository";

export interface GetPedidosByEstadoUseCase {
    execute(estado: string): Promise<PedidoEntity[]>;
}

export class GetPedidosByEstado implements GetPedidosByEstadoUseCase {
    constructor(
        private readonly pedidoRepository: PedidoRepository,
        private readonly loteRepository: LoteRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async execute(estado: string): Promise<any[]> {
        const pedidos = await this.pedidoRepository.getPedidosByEstado(estado);

        return Promise.all(
            pedidos.map(async (pedido) => {
                let estadoFacturacion: 'ES_NUESTRO' | 'FACTURADO' | 'NO_FACTURADO';

                if (pedido.id_lote) {
                    const lote = await this.loteRepository.getLoteById(pedido.id_lote);
                    // "Es nuestro" = el lote es de la tienda. Antes se miraba si el
                    // dueño era admin; ahora la tienda se identifica por owned_by_store.
                    if (lote?.owned_by_store) {
                        estadoFacturacion = 'ES_NUESTRO';
                        return { ...pedido, estadoFacturacion };
                    }
                }

                estadoFacturacion = pedido.facturado ? 'FACTURADO' : 'NO_FACTURADO';
                return { ...pedido, estadoFacturacion };
            })
        );
    }

}
