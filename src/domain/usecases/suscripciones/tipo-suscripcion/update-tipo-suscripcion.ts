import { UpdateTipoSuscripcionDto } from "../../../dtos/suscripcion/tipo-suscripcion/update";
import { TipoSuscripcionEntity } from "../../../entities/tipo-suscripcion.entity";
import { TipoSuscripcionRepository } from "../../../repository/tipo-suscripcion.repository";

export interface UpdateTipoSuscripcionUseCase {
    execute(id: string, dto: UpdateTipoSuscripcionDto): Promise<TipoSuscripcionEntity>;
}

export class UpdateTipoSuscripcion implements UpdateTipoSuscripcionUseCase {

    constructor(
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository,
    ) {}

    async execute(id: string, dto: UpdateTipoSuscripcionDto): Promise<TipoSuscripcionEntity> {
        const tipo = await this.tipoSuscripcionRepository.getTipoSuscripcionById(id);
        if (!tipo) throw new Error('Tipo de suscripción no encontrado');

        if (dto.nombre && dto.nombre !== tipo.nombre) {
            const existente = await this.tipoSuscripcionRepository.getTipoSuscripcionByNombre(dto.nombre);
            if (existente) throw new Error(`Ya existe un tipo de suscripción con el nombre "${dto.nombre}"`);
        }

        return this.tipoSuscripcionRepository.updateTipoSuscripcion(id, dto);
    }
}
