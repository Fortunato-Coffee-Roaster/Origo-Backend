import { FiltrosListaPreciosDto } from "../../dtos/lotes/precio-lote/filtros";
import { LotePrecioListadoEntity } from "../../entities/lote-precio-listado.entity";
import { PrecioLoteRepository } from "../../repository/precio-lote.repository";

export interface GetListaPreciosUseCase {
    execute(filtros: FiltrosListaPreciosDto): Promise<LotePrecioListadoEntity[]>;
}

export class GetListaPrecios implements GetListaPreciosUseCase {

    constructor(
        private readonly precioLoteRepository: PrecioLoteRepository,
    ) {}

    async execute(filtros: FiltrosListaPreciosDto): Promise<LotePrecioListadoEntity[]> {
        const lotes = await this.precioLoteRepository.getListadoPrecios(filtros);

        // stock_g es un calculado de la entity: se filtra aquí, no en la BD.
        if (filtros.solo_con_stock === true) return lotes.filter(l => l.stock_g > 0);
        if (filtros.solo_con_stock === false) return lotes.filter(l => l.stock_g <= 0);
        return lotes;
    }
}
