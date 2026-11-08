
export class UpdateLoteTostadoDto{
    constructor(
        public fecha_tostado?: Date,
        public perfil_tostado?: string,
        public peso_g?: number,
        public id_analisis_rapido?: string,
        public entregado?: Date
    ){}

    get values(){
        const returnObj: { [key: string]: any } = {};
        if (this.fecha_tostado) returnObj.fecha_tostado = this.fecha_tostado;
        if (this.perfil_tostado) returnObj.perfil_tostado = this.perfil_tostado;
        if (this.peso_g) returnObj.peso_g = this.peso_g;
        if (this.id_analisis_rapido) returnObj.id_analisis_rapido = this.id_analisis_rapido; 
        if (this.entregado) returnObj.entregado = this.entregado;   
        return returnObj;
    }

    static update(props: { [key: string]: any }): [string?, UpdateLoteTostadoDto?] {
        const { fecha_tostado, perfil_tostado, peso_g, id_analisis_rapido, entregado } = props;
        return [undefined, 
            new UpdateLoteTostadoDto(
                fecha_tostado,
                perfil_tostado,
                peso_g,
                id_analisis_rapido ,
                entregado
        )];
    }

}