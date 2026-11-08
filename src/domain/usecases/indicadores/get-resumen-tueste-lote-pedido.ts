import { PedidoRepository } from '../../repository/pedido.repository';
import { TuesteRepository } from '../../repository/tueste.repository';

export interface ResumenTuesteLotePedido {
  id_pedido: string;
  id_tueste: string;
  id_lote: string;
  fecha_tueste: string;
  peso: number;
  comentario: string;
}

export interface GetResumenTuesteLotePedidoUseCase {
  execute(): Promise<ResumenTuesteLotePedido[]>;
}

export class GetResumenTuesteLotePedido implements GetResumenTuesteLotePedidoUseCase {
  constructor(
    private readonly tuesteRepository: TuesteRepository,
    private readonly pedidoRepository: PedidoRepository,
  ) { }

  async execute(): Promise<ResumenTuesteLotePedido[]> {
    const tuestes = await this.tuesteRepository.getAllTuestes();
    if (!tuestes) return [];

    const resumen: ResumenTuesteLotePedido[] = [];

    for (const tueste of tuestes) {
      const pedido = await this.pedidoRepository.getPedidoById(tueste.id_pedido);
      if (!pedido) continue; // el `!` original crasheaba si el pedido ya no existía

      resumen.push({
        id_pedido: pedido.id_pedido,
        id_tueste: tueste.id_tueste,
        id_lote: pedido.id_lote ?? '',
        fecha_tueste: tueste.fecha_tueste.toLocaleDateString('es-ES'),
        peso: tueste.peso_entrada_g,
        comentario: pedido.comentario ?? '',
      });
    }

    return resumen;
  }
}