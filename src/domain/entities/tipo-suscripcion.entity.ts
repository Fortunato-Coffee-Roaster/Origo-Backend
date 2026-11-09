export class TipoSuscripcionEntity {

    constructor(
        public id_tipo_suscripcion: string,
        public nombre: string,
        public cantidad_meses: number,
        public peso_bolsa_g: number,
        public cant_bolsas: number,
        public activo: boolean,
        public created_at: Date,
    ) {}

    static fromObject(obj: { [key: string]: any }): TipoSuscripcionEntity {
        const { id_tipo_suscripcion, nombre, cantidad_meses, peso_bolsa_g, cant_bolsas, activo, created_at } = obj;

        if (!id_tipo_suscripcion) throw new Error('id_tipo_suscripcion es requerido');
        if (!nombre) throw new Error('nombre es requerido');
        if (cantidad_meses === undefined || cantidad_meses === null) throw new Error('cantidad_meses es requerido');
        if (peso_bolsa_g === undefined || peso_bolsa_g === null) throw new Error('peso_bolsa_g es requerido');
        if (cant_bolsas === undefined || cant_bolsas === null) throw new Error('cant_bolsas es requerido');
        if (activo === undefined) throw new Error('activo es requerido');
        if (!created_at) throw new Error('created_at es requerido');

        const newCreatedAt = new Date(created_at);
        if (isNaN(newCreatedAt.getTime())) throw new Error('created_at no es válido');

        return new TipoSuscripcionEntity(
            id_tipo_suscripcion,
            nombre,
            Number(cantidad_meses),
            Number(peso_bolsa_g),
            Number(cant_bolsas),
            activo,
            newCreatedAt,
        );
    }
}
