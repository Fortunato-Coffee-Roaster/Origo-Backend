const esEnteroPositivo = (valor: unknown): boolean =>
    Number.isInteger(Number(valor)) && Number(valor) > 0;

// Cambiar un plan no afecta a las suscripciones ya vendidas:
// cada Suscripcion guarda su propia copia de meses, peso y bolsas.
export class UpdateTipoSuscripcionDto {

    private constructor(
        public readonly id_tipo_suscripcion: string,
        public readonly id_user: string, // usuario de la sesión, para el Historial
        public readonly nombre?: string,
        public readonly cantidad_meses?: number,
        public readonly peso_bolsa_g?: number,
        public readonly cant_bolsas?: number,
        public readonly activo?: boolean,
    ) {}

    get values() {
        const returnObj: { [key: string]: any } = {};

        if (this.nombre) returnObj.nombre = this.nombre;
        if (this.cantidad_meses !== undefined) returnObj.cantidad_meses = this.cantidad_meses;
        if (this.peso_bolsa_g !== undefined) returnObj.peso_bolsa_g = this.peso_bolsa_g;
        if (this.cant_bolsas !== undefined) returnObj.cant_bolsas = this.cant_bolsas;
        if (this.activo !== undefined) returnObj.activo = this.activo;

        return returnObj;
    }

    static update(props: { [key: string]: any }): [string?, UpdateTipoSuscripcionDto?] {
        const { id_tipo_suscripcion, id_user, nombre, cantidad_meses, peso_bolsa_g, cant_bolsas, activo } = props;

        if (!id_tipo_suscripcion) return ['id_tipo_suscripcion es requerido', undefined];
        if (!id_user) return ['id_user es requerido', undefined];
        if (nombre !== undefined && !String(nombre).trim()) return ['nombre no puede estar vacío', undefined];
        if (cantidad_meses !== undefined && !esEnteroPositivo(cantidad_meses)) return ['cantidad_meses debe ser un entero mayor a 0', undefined];
        if (peso_bolsa_g !== undefined && !esEnteroPositivo(peso_bolsa_g)) return ['peso_bolsa_g debe ser un entero mayor a 0 (gramos)', undefined];
        if (cant_bolsas !== undefined && !esEnteroPositivo(cant_bolsas)) return ['cant_bolsas debe ser un entero mayor a 0', undefined];
        if (activo !== undefined && typeof activo !== 'boolean') return ['activo debe ser booleano', undefined];

        const dto = new UpdateTipoSuscripcionDto(
            id_tipo_suscripcion,
            id_user,
            nombre !== undefined ? String(nombre).trim() : undefined,
            cantidad_meses !== undefined ? Number(cantidad_meses) : undefined,
            peso_bolsa_g !== undefined ? Number(peso_bolsa_g) : undefined,
            cant_bolsas !== undefined ? Number(cant_bolsas) : undefined,
            activo,
        );

        if (Object.keys(dto.values).length === 0) return ['No hay campos para actualizar', undefined];

        return [undefined, dto];
    }
}
