import { CambiarEstadoSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/cambiar-estado";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";

export interface FinalizarSuscripcionUseCase {
    execute(dto: CambiarEstadoSuscripcionDto): Promise<SuscripcionEntity>;
}

export class FinalizarSuscripcion implements FinalizarSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(dto: CambiarEstadoSuscripcionDto): Promise<SuscripcionEntity> {
        const suscripcion = await this.suscripcionRepository.getSuscripcionById(dto.id_suscripcion);
        if (!suscripcion) throw new Error('Suscripción no encontrada');
        if (suscripcion.estado !== 'ACTIVA') throw new Error('Solo se puede finalizar una suscripción ACTIVA');
        if (suscripcion.congelada) throw new Error('No se puede finalizar una suscripción congelada. Reactívela o cancélela.');

        return this.suscripcionRepository.cambiarEstado(suscripcion.id_suscripcion, {
            estado: 'FINALIZADA',
            id_user: dto.id_user,
            comentario: dto.comentario,
            cerrar_congelamiento: null,
        });
    }
}
