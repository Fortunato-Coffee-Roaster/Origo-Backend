import { LoteTostadoRepository } from "../../../repository/loteTostado.repository";
import { TuesteRepository } from '../../../repository/tueste.repository';
import { PedidoRepository } from '../../../repository/pedido.repository';
import { FichaTueste } from "../../../entities/ficha-tueste.entity";

export interface FichaTuesteUseCase {
    execute(id: string): Promise<FichaTueste | null>;
}

export class GetFichaTueste implements FichaTuesteUseCase {
    constructor(
        private readonly loteTostadoRepository: LoteTostadoRepository,
        private readonly tuesteRepository: TuesteRepository,
        private readonly pedidoRepository: PedidoRepository
    ) { }

    async execute(id: string): Promise<FichaTueste | null> {
        const loteTostado = await this.loteTostadoRepository.getLoteTostadoById(id);
        const tuestes = await this.tuesteRepository.getTostadosByLoteTostado(id);

        if (!loteTostado || tuestes.length === 0) return null;

        const count = tuestes.length;

        const humedad = tuestes.reduce((t, r) => t + (r.humedad ?? 0), 0) / count;
        const densidad = tuestes.reduce((t, r) => t + (r.densidad ?? 0), 0) / count;
        const caramelizacion = tuestes.reduce((t, r) => t + (r.porcentaje_caramelizacion ?? 0), 0) / count;
        const desarrollo = tuestes.reduce((t, r) => t + (r.desarrollo ?? 0), 0) / count;
        const temp_desarrollo = tuestes.reduce((t, r) => t + (r.grados_desarrollo ?? 0), 0) / count;
        const agtrom = tuestes.reduce((t, r) => t + (r.agtrom_comercial ?? 0), 0) / count;
        const agtrom_gourmet = tuestes.reduce((t, r) => t + (r.agtrom_gourmet ?? 0), 0) / count;
        const tiempo = tuestes.reduce((t, r) => t + (r.tiempo_total ?? 0), 0) / count;

        const pesoEntradaTotal = tuestes.reduce((t, r) => t + (r.peso_entrada_g ?? 0), 0);
        const pesoSalidaTotal = tuestes.reduce((t, r) => t + (r.peso_salida_g ?? 0), 0);
        const merma = pesoEntradaTotal > 0
            ? parseFloat((((pesoEntradaTotal - pesoSalidaTotal) / pesoEntradaTotal) * 100).toFixed(2))
            : 0;
        const merma_gr = pesoEntradaTotal - pesoSalidaTotal;
        const tueste = loteTostado.perfil_tostado;
        const id_lote_tostado = loteTostado.id_lote_tostado;
        const id_lote = loteTostado.id_lote;

        return new FichaTueste(
            id_lote, humedad, densidad, caramelizacion, desarrollo,
            temp_desarrollo, agtrom, agtrom_gourmet, tiempo, tueste,
            id_lote_tostado, pesoSalidaTotal, merma, merma_gr  
        );
    }
}