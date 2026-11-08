export class CreateLoteTostadoDto {
    constructor(
        public id_lote_tostado: string,
        public id_lote: string,
        public fecha_tostado: Date,
        public peso_g: number ,
        public perfil_tostado: string,
        public owned_by_store: boolean,
        public id_user?: string,
        public id_analisis_rapido?: string,
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateLoteTostadoDto?] {
        const { id_lote, fecha_tostado, perfil_tostado, peso_g, id_lote_tostado, owned_by_store, id_user, id_analisis_rapido } = props;

        if (!id_lote) return ['El id_lote es requerido', undefined];
        if (!perfil_tostado) return ['El perfil_tostado es requerido', undefined];
        if (!peso_g) return ['El peso (g) es requerido', undefined];
        const newFechaTostado = new Date(fecha_tostado);
        if (isNaN(newFechaTostado.getTime())) {
            return ['La fecha_tostado no es válida', undefined];
        }


        return [undefined,
            new CreateLoteTostadoDto(
                id_lote_tostado,
                id_lote,
                newFechaTostado,
                peso_g,
                perfil_tostado,
                owned_by_store ?? false,
                id_user,
                id_analisis_rapido
            )];
    }

}