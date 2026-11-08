import { CreateCompraCafeDto } from "../dtos/lotes/compra-cafe/create";
import { FiltrosComprasCafeDto } from "../dtos/lotes/compra-cafe/filtros";
import { CompraCafeEntity, CostoKgLote } from "../entities/compra-cafe.entity";

export abstract class CompraCafeRepository {

    abstract createCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity>;

    abstract registrarCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity>;

    abstract getComprasByLote(id_lote: string): Promise<CompraCafeEntity[]>;

    abstract getCompras(filtros: FiltrosComprasCafeDto): Promise<CompraCafeEntity[]>;

    abstract getCostosKg(id_lotes: string[]): Promise<CostoKgLote[]>;
}
