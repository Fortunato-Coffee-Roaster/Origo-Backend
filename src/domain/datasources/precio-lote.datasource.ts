import { FiltrosListaPreciosDto } from "../dtos/lotes/precio-lote/filtros";
import { UpsertPrecioLoteDto } from "../dtos/lotes/precio-lote/upsert";
import { LotePrecioListadoEntity } from "../entities/lote-precio-listado.entity";
import { PrecioLoteEntity } from "../entities/precio-lote.entity";

export abstract class PrecioLoteDataSource {

    abstract getPrecioByLote(id_lote: string): Promise<PrecioLoteEntity | null>;

    // Crea o actualiza el precio y registra Historial (PRECIO_LOTE / CREATE o UPDATE)
    // en la misma transacción.
    abstract upsertPrecio(dto: UpsertPrecioLoteDto): Promise<PrecioLoteEntity>;

    // Lotes verdes de la tienda, no eliminados, con su precio (o null) y su stock.
    abstract getListadoPrecios(filtros: FiltrosListaPreciosDto): Promise<LotePrecioListadoEntity[]>;
}
