import { FiltrosComprasCafeDto } from "../../dtos/lotes/compra-cafe/filtros";
import { CompraCafeEntity } from "../../entities/compra-cafe.entity";
import { CompraCafeRepository } from "../../repository/compra-cafe.repository";

export interface GetComprasUseCase {
    execute(filtros: FiltrosComprasCafeDto): Promise<CompraCafeEntity[]>;
}

export class GetCompras implements GetComprasUseCase {

    constructor(
        private readonly compraCafeRepository: CompraCafeRepository,
    ) {}

    execute(filtros: FiltrosComprasCafeDto): Promise<CompraCafeEntity[]> {
        return this.compraCafeRepository.getCompras(filtros);
    }
}
