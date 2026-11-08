import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";

export interface GetSuscripcionUseCase {
    execute(id: string): Promise<SuscripcionEntity>;
}

export class GetSuscripcion implements GetSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(id: string): Promise<SuscripcionEntity> {
        const suscripcion = await this.suscripcionRepository.getSuscripcionById(id);
        if (!suscripcion) throw new Error('Suscripción no encontrada');
        return suscripcion;
    }
}
