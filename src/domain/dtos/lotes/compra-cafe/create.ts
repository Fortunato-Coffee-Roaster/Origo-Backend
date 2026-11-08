const textoOpcional = (v: any): string | null =>
    v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim();

const numeroOpcional = (v: any): number | null | undefined =>
    v === undefined ? undefined : v === null || v === '' ? null : Number(v);

export class CreateCompraCafeDto {

    private constructor(
        public readonly id_lote: string,
        public readonly id_almacen: string,
        public readonly id_proveedor: string | null,
        public readonly cantidad_g: number,
        public readonly costo_compra_kg: number,
        public readonly costo_adicional_kg: number | null,
        public readonly comentario: string | null,
        public readonly id_user: string,
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateCompraCafeDto?] {
        const {
            id_lote, id_almacen, id_proveedor, cantidad_g, costo_compra_kg,
            costo_adicional_kg, comentario, id_user,
        } = props;

        if (!id_lote) return ['El lote (id_lote) es requerido', undefined];
        if (!id_almacen) return ['El almacén (id_almacen) es requerido', undefined];
        if (!id_user) return ['El usuario (id_user) es requerido', undefined];

        const cantidad = Number(cantidad_g);
        if (cantidad_g === undefined || cantidad_g === null || isNaN(cantidad) || cantidad <= 0) {
            return ['cantidad_g debe ser un número mayor a 0', undefined];
        }

        const costo = Number(costo_compra_kg);
        if (costo_compra_kg === undefined || costo_compra_kg === null || isNaN(costo) || costo < 0) {
            return ['costo_compra_kg debe ser un número mayor o igual a 0', undefined];
        }

        const adicional = numeroOpcional(costo_adicional_kg);
        if (adicional !== undefined && adicional !== null && (isNaN(adicional) || adicional < 0)) {
            return ['costo_adicional_kg debe ser un número mayor o igual a 0', undefined];
        }

        return [undefined, new CreateCompraCafeDto(
            String(id_lote),
            String(id_almacen),
            textoOpcional(id_proveedor),
            cantidad,
            costo,
            adicional ?? null,
            textoOpcional(comentario),
            String(id_user),
        )];
    }

    // Copia con el proveedor resuelto por el use case (si no vino, se usa el del lote).
    conProveedor(id_proveedor: string | null): CreateCompraCafeDto {
        return new CreateCompraCafeDto(
            this.id_lote, this.id_almacen, id_proveedor, this.cantidad_g, this.costo_compra_kg,
            this.costo_adicional_kg, this.comentario, this.id_user,
        );
    }

    get values() {
        return {
            id_lote: this.id_lote,
            id_almacen: this.id_almacen,
            id_proveedor: this.id_proveedor,
            cantidad_g: this.cantidad_g,
            costo_compra_kg: this.costo_compra_kg,
            costo_adicional_kg: this.costo_adicional_kg,
            comentario: this.comentario,
            id_user: this.id_user,
        };
    }
}
