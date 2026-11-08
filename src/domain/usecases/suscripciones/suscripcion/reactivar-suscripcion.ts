import { ReactivarSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/reactivar";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";
import { diasEntre, sumarDias } from "../../../utils/fechas";

export interface ReactivarSuscripcionUseCase {
    execute(dto: ReactivarSuscripcionDto): Promise<SuscripcionEntity>;
}

export class ReactivarSuscripcion implements ReactivarSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(dto: ReactivarSuscripcionDto): Promise<SuscripcionEntity> {
        const suscripcion = await this.suscripcionRepository.getSuscripcionById(dto.id_suscripcion);
        if (!suscripcion) throw new Error('Suscripción no encontrada');
        if (suscripcion.estado !== 'ACTIVA') throw new Error('Solo se puede reactivar una suscripción ACTIVA');

        const abierto = suscripcion.congelamientoAbierto;
        if (!abierto) throw new Error('La suscripción no está congelada');

        const dias = diasEntre(abierto.fecha_congelamiento, dto.fecha_reactivacion);
        if (dias < 0) throw new Error('La fecha de reactivación no puede ser anterior a la fecha de congelamiento');

        // fecha_fin se corre los días que estuvo congelada.
        return this.suscripcionRepository.reactivarSuscripcion(suscripcion.id_suscripcion, {
            cierre: {
                id_congelamiento: abierto.id_congelamiento,
                fecha_reactivacion: dto.fecha_reactivacion,
                dias,
                reactivado_por: dto.reactivado_por,
            },
            nueva_fecha_fin: sumarDias(suscripcion.fecha_fin, dias),
            comentario: dto.comentario,
        });
    }
}
