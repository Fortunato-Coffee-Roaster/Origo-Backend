import { UpsertPrecioLoteDto } from "../../dtos/lotes/precio-lote/upsert";
import { PrecioLoteEntity } from "../../entities/precio-lote.entity";
import { LoteRepository } from "../../repository/lote.repository";
import { PrecioLoteRepository } from "../../repository/precio-lote.repository";
import { TipoUser } from "../../../enums/tipo-user.enum";

export interface UpsertPrecioLoteUseCase {
    execute(dto: UpsertPrecioLoteDto): Promise<PrecioLoteEntity>;
}

export class UpsertPrecioLote implements UpsertPrecioLoteUseCase {

    constructor(
        private readonly precioLoteRepository: PrecioLoteRepository,
        private readonly loteRepository: LoteRepository,
    ) {}

    async execute(dto: UpsertPrecioLoteDto): Promise<PrecioLoteEntity> {
        // Además del permiso costeo.lotes-precios.update, solo un ADMIN puede fijar precios.
        if (dto.tipo_user !== TipoUser.ADMIN) throw new Error('Solo un usuario ADMIN puede editar precios');

        const lote = await this.loteRepository.getLoteById(dto.id_lote);
        if (!lote) throw new Error('Lote no encontrado');
        if (lote.eliminado) throw new Error('El lote está eliminado');
        if (!lote.owned_by_store) throw new Error('Solo se puede poner precio a lotes de la tienda');

        return this.precioLoteRepository.upsertPrecio(dto);
    }
}
