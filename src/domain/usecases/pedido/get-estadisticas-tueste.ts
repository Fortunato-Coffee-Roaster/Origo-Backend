import { PedidoRepository } from "../../repository/pedido.repository";
import { TuesteRepository } from "../../repository/tueste.repository";

const FORTUNATO_ID = '25eba595-1556-4a90-a3c7-27edc759a127';

export interface EstadisticasTueste {
  promedioBatchPorDiaTostado: number;
  kilosTostadosCandela: number;
  batchTostadosCandela: number;
  promedioBatchPorDiaTotales: number;
  promedioBatchPorPedido: number;
  pesoPromedioPorBatch: number;
  batchFortunato: number;
  batchTerceros: number;
}

export interface GetEstadisticasTuesteUseCase {
  execute(desde: Date, hasta: Date): Promise<EstadisticasTueste>;
}

export class GetEstadisticasTueste implements GetEstadisticasTuesteUseCase {
  constructor(
    private readonly tuesteRepository: TuesteRepository,
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async execute(desde: Date, hasta: Date): Promise<EstadisticasTueste> {
    const tuestes = await this.tuesteRepository.getTuestesByRango(desde, hasta);
    const pedidos = await this.pedidoRepository.getPedidosByRango(desde, hasta);

    // Mapa pedido -> id_user
    const pedidoMap = new Map(pedidos.map(p => [p.id_pedido, p.id_user]));

    // 1. Promedio de batch por día tostado (días con tueste)
    const porDia = new Map<string, number>();
    for (const t of tuestes) {
      const dia = t.fecha_tueste.toISOString().split('T')[0];
      porDia.set(dia, (porDia.get(dia) ?? 0) + 1);
    }
    const promedioBatchPorDiaTostado = porDia.size > 0
      ? [...porDia.values()].reduce((a, b) => a + b, 0) / porDia.size
      : 0;

    // 2. Kilos tostados en Candela
    const candela = tuestes.filter(t => t.tostadora === 'Candela');
    const kilosTostadosCandela = candela.reduce((sum, t) => sum + t.peso_entrada_g, 0);

    // 3. Batch tostados en Candela
    const batchTostadosCandela = candela.length;

    // 4. Promedio de batch por día totales (días del rango)
    const diasRango = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const promedioBatchPorDiaTotales = diasRango > 0 ? tuestes.length / diasRango : 0;

    // 5. Promedio de batch por pedido
    const porPedido = new Map<string, number>();
    for (const t of tuestes) {
      porPedido.set(t.id_pedido, (porPedido.get(t.id_pedido) ?? 0) + 1);
    }
    const promedioBatchPorPedido = porPedido.size > 0
      ? [...porPedido.values()].reduce((a, b) => a + b, 0) / porPedido.size
      : 0;

    // 6. Peso promedio por batch
    const pesoPromedioPorBatch = tuestes.length > 0
      ? tuestes.reduce((sum, t) => sum + t.peso_entrada_g, 0) / tuestes.length
      : 0;

    // 7 y 8. Batch Fortunato vs terceros
    let batchFortunato = 0;
    let batchTerceros = 0;
    for (const t of tuestes) {
      const idUser = pedidoMap.get(t.id_pedido);
      if (idUser === FORTUNATO_ID) {
        batchFortunato++;
      } else {
        batchTerceros++;
      }
    }

    return {
      promedioBatchPorDiaTostado,
      kilosTostadosCandela,
      batchTostadosCandela,
      promedioBatchPorDiaTotales,
      promedioBatchPorPedido,
      pesoPromedioPorBatch,
      batchFortunato,
      batchTerceros,
    };
  }
}