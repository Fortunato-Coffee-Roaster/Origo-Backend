import { CompraCafeEntity } from "../../entities/compra-cafe.entity";
import { CompraCafeRepository } from "../../repository/compra-cafe.repository";
import { LoteRepository } from "../../repository/lote.repository";

export interface GetComprasLoteUseCase {
    execute(id_lote: string): Promise<CompraCafeEntity[]>;
}

export class GetComprasLote implements GetComprasLoteUseCase {

    constructor(
        private readonly compraCafeRepository: CompraCafeRepository,
        private readonly loteRepository: LoteRepository,
    ) {}

    async execute(id_lote: string): Promise<CompraCafeEntity[]> {
        const lote = await this.loteRepository.getLoteById(id_lote);
        if (!lote) throw new Error('Lote no encontrado');
        return this.compraCafeRepository.getComprasByLote(id_lote);
    }
}
