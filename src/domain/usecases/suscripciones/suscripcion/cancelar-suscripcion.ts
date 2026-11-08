import { DatosCierreCongelamiento } from "../../../datasources/suscripcion.datasource";
import { CambiarEstadoSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/cambiar-estado";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";
import { diasEntre, hoy } from "../../../utils/fechas";

export interface CancelarSuscripcionUseCase {
    execute(dto: CambiarEstadoSuscripcionDto): Promise<SuscripcionEntity>;
}

export class CancelarSuscripcion implements CancelarSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(dto: CambiarEstadoSuscripcionDto): Promise<SuscripcionEntity> {
        const suscripcion = await this.suscripcionRepository.getSuscripcionById(dto.id_suscripcion);
        if (!suscripcion) throw new Error('Suscripción no encontrada');
        if (suscripcion.estado !== 'ACTIVA') throw new Error('Solo se puede cancelar una suscripción ACTIVA');

        // Si está congelada se cierra el congelamiento, pero NO se corre fecha_fin.
        let cerrar_congelamiento: DatosCierreCongelamiento | null = null;
        const abierto = suscripcion.congelamientoAbierto;
        if (abierto) {
            const fecha_reactivacion = hoy();
            cerrar_congelamiento = {
                id_congelamiento: abierto.id_congelamiento,
                fecha_reactivacion,
                dias: Math.max(0, diasEntre(abierto.fecha_congelamiento, fecha_reactivacion)),
                reactivado_por: dto.id_user,
            };
        }

        return this.suscripcionRepository.cambiarEstado(suscripcion.id_suscripcion, {
            estado: 'CANCELADA',
            id_user: dto.id_user,
            comentario: dto.comentario,
            cerrar_congelamiento,
        });
    }
}
