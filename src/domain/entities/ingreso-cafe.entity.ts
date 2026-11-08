export class IngresoCafeEntity {

    constructor(
        public id_ingreso: string,
        public id_lote: string,
        public cantidad_g: number,
        public costo_unitario: number,
        public fecha_ingreso: Date,
        public proveedor?: string,
        public id_user?: string,
    ) {}

    static fromObject(obj: { [key: string]: any }): IngresoCafeEntity {
        const {
            id_ingreso,
            id_lote,
            cantidad_g,
            costo_unitario,
            fecha_ingreso,
            proveedor,
            id_user
        } = obj;

        if (!id_ingreso) throw new Error('id_ingreso es requerido');
        if (!id_lote) throw new Error('id_lote es requerido');
        if (cantidad_g === undefined) throw new Error('cantidad_g es requerida');
        if (costo_unitario === undefined) throw new Error('costo_unitario es requerido');
        if (!fecha_ingreso) throw new Error('fecha_ingreso es requerida');

        const newFechaIngreso = new Date(fecha_ingreso);
        if (isNaN(newFechaIngreso.getTime())) {
            throw new Error('fecha_ingreso no es válida');
        }

        return new IngresoCafeEntity(
            id_ingreso,
            id_lote,
            Number(cantidad_g),
            Number(costo_unitario),
            newFechaIngreso,
            proveedor,
            id_user
        );
    }
}
