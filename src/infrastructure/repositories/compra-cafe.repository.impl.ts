import { CompraCafeDataSource } from "../../domain/datasources/compra-cafe.datasource";
import { CreateCompraCafeDto } from "../../domain/dtos/lotes/compra-cafe/create";
import { FiltrosComprasCafeDto } from "../../domain/dtos/lotes/compra-cafe/filtros";
import { CompraCafeEntity, CostoKgLote } from "../../domain/entities/compra-cafe.entity";
import { CompraCafeRepository } from "../../domain/repository/compra-cafe.repository";

export class CompraCafeRepositoryImpl implements CompraCafeRepository {

    constructor(
        private readonly datasource: CompraCafeDataSource
    ) {}

    createCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity> {
        return this.datasource.createCompra(dto);
    }

    registrarCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity> {
        return this.datasource.registrarCompra(dto);
    }

    getComprasByLote(id_lote: string): Promise<CompraCafeEntity[]> {
        return this.datasource.getComprasByLote(id_lote);
    }

    getCompras(filtros: FiltrosComprasCafeDto): Promise<CompraCafeEntity[]> {
        return this.datasource.getCompras(filtros);
    }

    getCostosKg(id_lotes: string[]): Promise<CostoKgLote[]> {
        return this.datasource.getCostosKg(id_lotes);
    }
}
