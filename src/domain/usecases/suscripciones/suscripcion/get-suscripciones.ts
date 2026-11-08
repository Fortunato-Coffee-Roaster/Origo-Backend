import { FiltrosSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/filtros";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";

export interface GetSuscripcionesUseCase {
    execute(filtros: FiltrosSuscripcionDto): Promise<SuscripcionEntity[]>;
}

export class GetSuscripciones implements GetSuscripcionesUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(filtros: FiltrosSuscripcionDto): Promise<SuscripcionEntity[]> {
        const suscripciones = await this.suscripcionRepository.getSuscripciones({
            estado: filtros.estado,
            id_cliente: filtros.id_cliente,
        });

        // `vencida` es un calculado de la entity: se filtra aquí, no en la BD.
        if (filtros.vencida === undefined) return suscripciones;
        return suscripciones.filter(s => s.vencida === filtros.vencida);
    }
}
