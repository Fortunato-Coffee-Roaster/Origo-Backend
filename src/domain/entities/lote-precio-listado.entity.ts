import { OrigenEntity } from "./origen.entity";
import { PrecioLoteEntity } from "./precio-lote.entity";
import { ProveedorResumen } from "./proveedor.entity";

// Fila de la lista de precios (GET /lote/precios).
// Forma propia: no es un LoteEntity (no expone costo ni datos de cliente) y
// incluye lotes sin precio (precio = null) para saber cuáles faltan cargar.
export class LotePrecioListadoEntity {

    constructor(
        public id_lote: string,
        public tipo_lote: string,
        public clasificacion: string | null,
        public origen: OrigenEntity | null,
        public proveedor: ProveedorResumen | null,
        public stock_g: number,
        public precio: PrecioLoteEntity | null,
    ) {}

    // Espera la fila de Prisma con include: { origen, proveedor, precio, inventarioLotes }
    static fromObject(obj: { [key: string]: any }): LotePrecioListadoEntity {
        const { id_lote, tipo_lote, clasificacion, origen, proveedor, precio, inventarioLotes } = obj;

        if (!id_lote) throw new Error('id_lote es requerido');

        // Stock total del lote en todos los almacenes, en gramos.
        const stock_g = Array.isArray(inventarioLotes)
            ? inventarioLotes.reduce((total: number, inv: any) => total + Number(inv.cantidad_g ?? 0), 0)
            : 0;

        return new LotePrecioListadoEntity(
            id_lote,
            tipo_lote,
            clasificacion ?? null,
            origen ? OrigenEntity.fromObject(origen) : null,
            proveedor ? { id_proveedor: proveedor.id_proveedor, nombre: proveedor.nombre } : null,
            stock_g,
            precio ? PrecioLoteEntity.fromObject(precio) : null,
        );
    }
}
