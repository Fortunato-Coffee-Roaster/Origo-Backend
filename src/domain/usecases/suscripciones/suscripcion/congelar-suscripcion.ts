import { CongelarSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/congelar";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";

export interface CongelarSuscripcionUseCase {
    execute(dto: CongelarSuscripcionDto): Promise<SuscripcionEntity>;
}

export class CongelarSuscripcion implements CongelarSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(dto: CongelarSuscripcionDto): Promise<SuscripcionEntity> {
        const suscripcion = await this.suscripcionRepository.getSuscripcionById(dto.id_suscripcion);
        if (!suscripcion) throw new Error('Suscripción no encontrada');
        if (suscripcion.estado !== 'ACTIVA') throw new Error('Solo se puede congelar una suscripción ACTIVA');
        if (suscripcion.congelada) throw new Error('La suscripción ya está congelada');
        if (dto.fecha_congelamiento.getTime() > suscripcion.fecha_fin.getTime())
            throw new Error('La fecha de congelamiento no puede ser posterior a la fecha de fin de la suscripción');

        return this.suscripcionRepository.congelarSuscripcion(suscripcion.id_suscripcion, {
            fecha_congelamiento: dto.fecha_congelamiento,
            comentario: dto.comentario,
            congelado_por: dto.congelado_por,
        });
    }
}
