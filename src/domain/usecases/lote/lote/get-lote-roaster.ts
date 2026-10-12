import { LoteRepository } from '../../../repository/lote.repository';
import { LoteEntity } from "../../../entities/lote.entity";
import { UserRepository } from '../../../repository/user.repository';



export interface GetLoteRoasterUseCase {
    execute( ): Promise<LoteEntity[]>;
}

export class GetLoteRoaster implements GetLoteRoasterUseCase {
    constructor(
        private readonly loteRepository: LoteRepository,
        private readonly userRepository: UserRepository
    ){}

    // Lotes de la tienda. Antes se buscaba al dueño y se miraba si era admin;
    // un lote ya no puede pertenecer a un usuario interno, así que la tienda
    // se identifica por owned_by_store.
    async execute(  ): Promise<LoteEntity[]> {
        const lotes = await this.loteRepository.getLotes();
        return lotes.filter(lote => lote.owned_by_store);
    }
}