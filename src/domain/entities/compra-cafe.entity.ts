import { ProveedorResumen } from "./proveedor.entity";

// Compra de café verde de la tienda a un proveedor. cantidad_g en gramos; costos por kg.
export class CompraCafeEntity {

    constructor(
        public id_compra: string,
        public id_lote: string,
        public id_almacen: string,
        public id_proveedor: string | null,
        public cantidad_g: number,
        public costo_compra_kg: number,
        public costo_adicional_kg: number | null,
        public fecha_ingreso: Date,
        public comentario: string | null,
        public id_user: string,
        public proveedor?: ProveedorResumen | null,
        public almacen?: { id_almacen: string; nombre: string } | null,
    ) {}

    static fromObject(obj: { [key: string]: any }): CompraCafeEntity {
        const {
            id_compra, id_lote, id_almacen, id_proveedor, cantidad_g, costo_compra_kg,
            costo_adicional_kg, fecha_ingreso, comentario, id_user, proveedor, almacen,
        } = obj;

        if (!id_compra) throw new Error('id_compra es requerido');
        if (!id_lote) throw new Error('id_lote es requerido');
        if (!id_almacen) throw new Error('id_almacen es requerido');
        if (!id_user) throw new Error('id_user es requerido');

        const newFecha = new Date(fecha_ingreso);
        if (isNaN(newFecha.getTime())) throw new Error('fecha_ingreso no es válida');

        return new CompraCafeEntity(
            id_compra,
            id_lote,
            id_almacen,
            id_proveedor ?? null,
            Number(cantidad_g),
            Number(costo_compra_kg),
            costo_adicional_kg === null || costo_adicional_kg === undefined ? null : Number(costo_adicional_kg),
            newFecha,
            comentario ?? null,
            id_user,
            proveedor ? { id_proveedor: proveedor.id_proveedor, nombre: proveedor.nombre } : proveedor,
            almacen ? { id_almacen: almacen.id_almacen, nombre: almacen.nombre } : almacen,
        );
    }
}

// Costo por kg de un lote, promedio ponderado por cantidad_g de sus compras.
export interface CostoKgLote {
    id_lote: string;
    costo_kg: number;
}
