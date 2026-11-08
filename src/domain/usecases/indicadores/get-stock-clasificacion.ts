import { GetLoteInventario } from '../lote/lote/get-lote-inventario';

export interface StockVerdeResult {
  clasificacion: Record<string, number>; // SOLO café de tienda (owned_by_store), por grado
  resumen: {
    total: number;    // tienda + clientes
    tienda: number;
    clientes: number;
  };
}

export interface GetStockClasificacionUseCase {
  execute(): Promise<StockVerdeResult>;
}

export class GetStockClasificacion implements GetStockClasificacionUseCase {
  constructor(
    private readonly getLoteInventario: GetLoteInventario,
  ) { }

  async execute(): Promise<StockVerdeResult> {
    const lotes = await this.getLoteInventario.execute(false); // false = no incluir eliminados

    const clasificacion: Record<string, number> = {};
    let total = 0;
    let tienda = 0;
    let clientes = 0;

    for (const lote of lotes) {
      if (lote.tipo_lote !== 'Lote Verde') continue; // solo café verde
      if (lote.eliminado) continue;

      // cantidad_g está en GRAMOS -> convertir a kg
      const kg = (lote.inventarioLotes ?? [])
        .reduce((sum, inv) => sum + (inv.cantidad_g ?? 0), 0) / 1000;

      if (kg <= 0) continue; // sin stock actual, no aporta

      total += kg;

      if (lote.owned_by_store) {
        tienda += kg;

        // La clasificación por grado (Selecto/Especial/etc.) solo aplica al café propio
        const raw = (lote.clasificacion ?? '').trim();
        const clave = raw
          ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
          : 'Sin clasificar';
        clasificacion[clave] = (clasificacion[clave] ?? 0) + kg;
      } else {
        clientes += kg;
      }
    }

    return {
      clasificacion,
      resumen: { total, tienda, clientes },
    };
  }
}