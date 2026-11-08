import { PrecioLoteEntity } from "../../entities/precio-lote.entity";
import { LoteRepository } from "../../repository/lote.repository";
import { PrecioLoteRepository } from "../../repository/precio-lote.repository";

export interface GetPrecioLoteUseCase {
    execute(id_lote: string): Promise<PrecioLoteEntity | null>;
}

// Devuelve null si el lote existe pero todavía no tiene precio.
export class GetPrecioLote implements GetPrecioLoteUseCase {

    constructor(
        private readonly precioLoteRepository: PrecioLoteRepository,
        private readonly loteRepository: LoteRepository,
    ) {}

    async execute(id_lote: string): Promise<PrecioLoteEntity | null> {
        const lote = await this.loteRepository.getLoteById(id_lote);
        if (!lote) throw new Error('Lote no encontrado');

        return this.precioLoteRepository.getPrecioByLote(id_lote);
    }
}
