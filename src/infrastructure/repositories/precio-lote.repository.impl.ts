import { PrecioLoteDataSource } from "../../domain/datasources/precio-lote.datasource";
import { FiltrosListaPreciosDto } from "../../domain/dtos/lotes/precio-lote/filtros";
import { UpsertPrecioLoteDto } from "../../domain/dtos/lotes/precio-lote/upsert";
import { LotePrecioListadoEntity } from "../../domain/entities/lote-precio-listado.entity";
import { PrecioLoteEntity } from "../../domain/entities/precio-lote.entity";
import { PrecioLoteRepository } from "../../domain/repository/precio-lote.repository";

export class PrecioLoteRepositoryImpl implements PrecioLoteRepository {

    constructor(
        private readonly datasource: PrecioLoteDataSource
    ) {}

    getPrecioByLote(id_lote: string): Promise<PrecioLoteEntity | null> {
        return this.datasource.getPrecioByLote(id_lote);
    }

    upsertPrecio(dto: UpsertPrecioLoteDto): Promise<PrecioLoteEntity> {
        return this.datasource.upsertPrecio(dto);
    }

    getListadoPrecios(filtros: FiltrosListaPreciosDto): Promise<LotePrecioListadoEntity[]> {
        return this.datasource.getListadoPrecios(filtros);
    }
}
