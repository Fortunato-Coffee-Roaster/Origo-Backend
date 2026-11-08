
export class CreateAnalisisFisicoDto {
    private constructor(
        public readonly peso_muestra_g              : number,
        public readonly peso_pergamino_g            : number,
        public readonly wa                          : number,
        public readonly temperatura_wa              : number,
        public readonly humedad                     : number,
        public readonly temperatura_humedad         : number,
        public readonly densidad                    : number,
        public readonly color_grano_verde           : string,
        public readonly olor                        : string,
        public readonly superior_malla_18           : number,
        public readonly superior_malla_16           : number,
        public readonly superior_malla_14           : number,
        public readonly menor_malla_14              : number,
        public readonly peso_defectos_g             : number,
        public readonly quaquers                    : number,
        public readonly peso_muestra_tostada_g      : number,
        public readonly desarrollo                  : number,
        public readonly porcentaje_caramelizacion   : number,
        public readonly c_desarrollo                : number,
        public readonly comentario                  : string,
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateAnalisisFisicoDto?] {
        const {
            peso_muestra_g,
            peso_pergamino_g,
            wa,
            temperatura_wa,
            humedad,
            temperatura_humedad,
            densidad,
            color_grano_verde,
            olor,
            superior_malla_18,
            superior_malla_16,
            superior_malla_14,
            menor_malla_14,
            peso_defectos_g,
            quaquers,
            peso_muestra_tostada_g,
            desarrollo,
            porcentaje_caramelizacion,
            c_desarrollo,
            comentario
        } = props;

        if (peso_muestra_g === undefined) return ['El peso de la muestra es requerido', undefined];
        if (peso_pergamino_g === undefined) return ['El peso del pergamino es requerido', undefined];
        if (wa === undefined) return ['El wa es requerido', undefined];
        if (temperatura_wa === undefined) return ['La temperatura wa es requerida', undefined];
        if (humedad === undefined) return ['La humedad es requerida', undefined]; 
        if (temperatura_humedad === undefined) return ['La temperatura de la humedad es requerida', undefined];
        if (densidad === undefined) return ['La densidad es requerida', undefined];
        if (color_grano_verde === undefined) return ['El color del grano verde es requerido', undefined];
        if (olor === undefined) return ['El olor es requerido', undefined];
        if (superior_malla_18 === undefined) return ['El superior malla 18 es requerido', undefined];
        if (superior_malla_16 === undefined) return ['El superior malla 16 es requerido', undefined];
        if (superior_malla_14 === undefined) return ['El superior malla 14 es requerido', undefined];
        if (menor_malla_14 === undefined) return ['El menor malla 16 es requerido', undefined];
        if (peso_defectos_g === undefined) return ['El peso de defectos es requerido', undefined];
   



        return [undefined, new CreateAnalisisFisicoDto(
            peso_muestra_g,
            peso_pergamino_g,
            wa,
            temperatura_wa,
            humedad,
            temperatura_humedad,
            densidad,
            color_grano_verde,
            olor,
            superior_malla_18,
            superior_malla_16,
            superior_malla_14,
            menor_malla_14,
            peso_defectos_g,
            quaquers,
            peso_muestra_tostada_g,
            desarrollo,
            porcentaje_caramelizacion,
            c_desarrollo,
            comentario
        )];
    }
}
