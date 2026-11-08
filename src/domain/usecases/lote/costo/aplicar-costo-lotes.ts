import { LoteConInventarioEntity, LoteEntity } from "../../../entities/lote.entity";
import { CompraCafeRepository } from "../../../repository/compra-cafe.repository";

type LoteConCosto = LoteEntity | LoteConInventarioEntity;

export interface AplicarCostoLotesUseCase {
    execute<T extends LoteConCosto | LoteConCosto[] | null>(lotes: T, puedeVerCosto: boolean): Promise<T>;
}

// Visibilidad del costo en las respuestas de lote (permiso costeo.lotes-costo.read).
// Sin permiso: se quitan costo y costo_kg.
// Con permiso: costo_kg = promedio ponderado por cantidad_g de sus CompraCafe
// (costo_compra_kg + costo_adicional_kg); si el lote no tiene compras, se usa Lote.costo.
export class AplicarCostoLotes implements AplicarCostoLotesUseCase {

    constructor(
        private readonly compraCafeRepository: CompraCafeRepository,
    ) {}

    async execute<T extends LoteConCosto | LoteConCosto[] | null>(lotes: T, puedeVerCosto: boolean): Promise<T> {
        if (!lotes) return lotes;
        const lista: LoteConCosto[] = Array.isArray(lotes) ? lotes : [lotes as LoteConCosto];

        if (!puedeVerCosto) {
            for (const lote of lista) {
                delete lote.costo;
                delete lote.costo_kg;
            }
            return lotes;
        }

        const costos = await this.compraCafeRepository.getCostosKg(lista.map(l => l.id_lote));
        const porLote = new Map(costos.map(c => [c.id_lote, c.costo_kg]));

        for (const lote of lista) {
            lote.costo_kg = porLote.get(lote.id_lote) ?? lote.costo ?? null;
        }
        return lotes;
    }
}
