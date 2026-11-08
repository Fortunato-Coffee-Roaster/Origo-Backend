import { FiltrosOrigenDto } from "../../dtos/origen/filtros";
import { OrigenEntity } from "../../entities/origen.entity";
import { OrigenRepository } from "../../repository/origen.repository";

export interface GetOrigenesUseCase {
    execute(filtros: FiltrosOrigenDto): Promise<OrigenEntity[]>;
}

export class GetOrigenes implements GetOrigenesUseCase {

    constructor(
        private readonly origenRepository: OrigenRepository,
    ) {}

    async execute(filtros: FiltrosOrigenDto): Promise<OrigenEntity[]> {
        return this.origenRepository.getOrigenes(filtros);
    }
}
