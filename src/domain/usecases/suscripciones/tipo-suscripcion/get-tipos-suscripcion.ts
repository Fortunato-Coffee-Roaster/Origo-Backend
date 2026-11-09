import { TipoSuscripcionEntity } from "../../../entities/tipo-suscripcion.entity";
import { TipoSuscripcionRepository } from "../../../repository/tipo-suscripcion.repository";

export interface GetTiposSuscripcionUseCase {
    execute(): Promise<TipoSuscripcionEntity[]>;
}

export class GetTiposSuscripcion implements GetTiposSuscripcionUseCase {

    constructor(
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository,
    ) {}

    async execute(): Promise<TipoSuscripcionEntity[]> {
        return this.tipoSuscripcionRepository.getAllTiposSuscripcion();
    }
}
