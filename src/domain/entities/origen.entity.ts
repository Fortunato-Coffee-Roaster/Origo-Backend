// Catálogo de ubigeo (solo lectura).
export class OrigenEntity {

    constructor(
        public id_origen: string,
        public ubigeo: string,
        public departamento: string,
        public provincia: string,
        public distrito: string,
    ) {}

    static fromObject(obj: { [key: string]: any }): OrigenEntity {
        const { id_origen, ubigeo, departamento, provincia, distrito } = obj;

        if (!id_origen) throw new Error('id_origen es requerido');
        if (!ubigeo) throw new Error('ubigeo es requerido');
        if (!departamento) throw new Error('departamento es requerido');
        if (!provincia) throw new Error('provincia es requerido');
        if (!distrito) throw new Error('distrito es requerido');

        return new OrigenEntity(id_origen, ubigeo, departamento, provincia, distrito);
    }
}
