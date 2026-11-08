import { OrigenEntity } from "../../entities/origen.entity";
import { OrigenRepository } from "../../repository/origen.repository";

export interface GetOrigenUseCase {
    execute(id: string): Promise<OrigenEntity>;
}

export class GetOrigen implements GetOrigenUseCase {

    constructor(
        private readonly origenRepository: OrigenRepository,
    ) {}

    async execute(id: string): Promise<OrigenEntity> {
        const origen = await this.origenRepository.getOrigenById(id);
        if (!origen) throw new Error('Origen no encontrado');
        return origen;
    }
}
