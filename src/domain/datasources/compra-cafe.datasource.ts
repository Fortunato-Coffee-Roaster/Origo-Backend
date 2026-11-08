import { CreateCompraCafeDto } from "../dtos/lotes/compra-cafe/create";
import { FiltrosComprasCafeDto } from "../dtos/lotes/compra-cafe/filtros";
import { CompraCafeEntity, CostoKgLote } from "../entities/compra-cafe.entity";

export abstract class CompraCafeDataSource {

    // Solo inserta la compra (el inventario y el movimiento los maneja quien llama).
    abstract createCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity>;

    // Compra + upsert de InventarioLote + MovimientoAlmacen INGRESO, en una transacción.
    abstract registrarCompra(dto: CreateCompraCafeDto): Promise<CompraCafeEntity>;

    abstract getComprasByLote(id_lote: string): Promise<CompraCafeEntity[]>;

    abstract getCompras(filtros: FiltrosComprasCafeDto): Promise<CompraCafeEntity[]>;

    abstract getCostosKg(id_lotes: string[]): Promise<CostoKgLote[]>;
}
