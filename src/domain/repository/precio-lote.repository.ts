import { FiltrosListaPreciosDto } from "../dtos/lotes/precio-lote/filtros";
import { UpsertPrecioLoteDto } from "../dtos/lotes/precio-lote/upsert";
import { LotePrecioListadoEntity } from "../entities/lote-precio-listado.entity";
import { PrecioLoteEntity } from "../entities/precio-lote.entity";

export abstract class PrecioLoteRepository {

    abstract getPrecioByLote(id_lote: string): Promise<PrecioLoteEntity | null>;

    abstract upsertPrecio(dto: UpsertPrecioLoteDto): Promise<PrecioLoteEntity>;

    abstract getListadoPrecios(filtros: FiltrosListaPreciosDto): Promise<LotePrecioListadoEntity[]>;
}
