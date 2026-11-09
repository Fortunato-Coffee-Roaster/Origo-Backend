import { CreateTipoSuscripcionDto } from "../../../dtos/suscripcion/tipo-suscripcion/create";
import { TipoSuscripcionEntity } from "../../../entities/tipo-suscripcion.entity";
import { TipoSuscripcionRepository } from "../../../repository/tipo-suscripcion.repository";

export interface CreateTipoSuscripcionUseCase {
    execute(dto: CreateTipoSuscripcionDto): Promise<TipoSuscripcionEntity>;
}

export class CreateTipoSuscripcion implements CreateTipoSuscripcionUseCase {

    constructor(
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository,
    ) {}

    async execute(dto: CreateTipoSuscripcionDto): Promise<TipoSuscripcionEntity> {
        const existente = await this.tipoSuscripcionRepository.getTipoSuscripcionByNombre(dto.nombre);
        if (existente) throw new Error(`Ya existe un tipo de suscripción con el nombre "${dto.nombre}"`);

        return this.tipoSuscripcionRepository.createTipoSuscripcion(dto);
    }
}
