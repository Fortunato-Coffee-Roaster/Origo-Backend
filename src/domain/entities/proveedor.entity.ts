export class ProveedorEntity {

    constructor(
        public id_proveedor: string,
        public nombre: string,
        public documento: string | null,
        public telefono: string | null,
        public activo: boolean,
        public created_at: Date,
    ) {}

    static fromObject(obj: { [key: string]: any }): ProveedorEntity {
        const { id_proveedor, nombre, documento, telefono, activo, created_at } = obj;

        if (!id_proveedor) throw new Error('id_proveedor es requerido');
        if (!nombre) throw new Error('nombre es requerido');
        if (activo === undefined) throw new Error('activo es requerido');
        if (!created_at) throw new Error('created_at es requerido');

        const newCreatedAt = new Date(created_at);
        if (isNaN(newCreatedAt.getTime())) throw new Error('created_at no es válido');

        return new ProveedorEntity(
            id_proveedor,
            nombre,
            documento ?? null,
            telefono ?? null,
            activo,
            newCreatedAt,
        );
    }
}

// Forma corta que se anida en Lote y Muestra.
export interface ProveedorResumen {
    id_proveedor: string;
    nombre: string;
}
