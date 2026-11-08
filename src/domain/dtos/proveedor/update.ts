// '' o null → null (borra el dato); undefined → no se toca.
const textoNullable = (v: any): string | null | undefined =>
    v === undefined ? undefined : v === null || String(v).trim() === '' ? null : String(v).trim();

// Sin borrado físico: para dar de baja se envía activo = false.
export class UpdateProveedorDto {

    private constructor(
        public readonly id_proveedor: string,
        public readonly nombre?: string,
        public readonly documento?: string | null,
        public readonly telefono?: string | null,
        public readonly activo?: boolean,
    ) {}

    get values() {
        const returnObj: { [key: string]: any } = {};

        if (this.nombre) returnObj.nombre = this.nombre;
        if (this.documento !== undefined) returnObj.documento = this.documento;
        if (this.telefono !== undefined) returnObj.telefono = this.telefono;
        if (this.activo !== undefined) returnObj.activo = this.activo;

        return returnObj;
    }

    static update(props: { [key: string]: any }): [string?, UpdateProveedorDto?] {
        const { id_proveedor, nombre, documento, telefono, activo } = props;

        if (!id_proveedor) return ['id_proveedor es requerido', undefined];
        if (nombre !== undefined && !String(nombre).trim()) return ['nombre no puede estar vacío', undefined];
        if (activo !== undefined && typeof activo !== 'boolean') return ['activo debe ser booleano', undefined];

        const dto = new UpdateProveedorDto(
            id_proveedor,
            nombre !== undefined ? String(nombre).trim() : undefined,
            textoNullable(documento),
            textoNullable(telefono),
            activo,
        );

        if (Object.keys(dto.values).length === 0) return ['No hay campos para actualizar', undefined];

        return [undefined, dto];
    }
}
