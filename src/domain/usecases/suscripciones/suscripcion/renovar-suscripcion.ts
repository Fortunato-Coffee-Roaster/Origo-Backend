import { RenovarSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/renovar";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";
import { TipoSuscripcionRepository } from "../../../repository/tipo-suscripcion.repository";
import { hoy, sumarMeses } from "../../../utils/fechas";

export interface RenovarSuscripcionUseCase {
    execute(dto: RenovarSuscripcionDto): Promise<SuscripcionEntity>;
}

export class RenovarSuscripcion implements RenovarSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository,
    ) {}

    async execute(dto: RenovarSuscripcionDto): Promise<SuscripcionEntity> {
        const anterior = await this.suscripcionRepository.getSuscripcionById(dto.id_suscripcion);
        if (!anterior) throw new Error('Suscripción no encontrada');
        if (anterior.estado !== 'ACTIVA') throw new Error('Solo se puede renovar una suscripción ACTIVA');
        if (anterior.congelada) throw new Error('No se puede renovar una suscripción congelada. Reactívela primero.');

        // Sin id_tipo_suscripcion → mismo plan.
        const id_tipo = dto.id_tipo_suscripcion ?? anterior.id_tipo_suscripcion;
        const tipo = await this.tipoSuscripcionRepository.getTipoSuscripcionById(id_tipo);
        if (!tipo) throw new Error('Tipo de suscripción no encontrado');
        if (!tipo.activo) throw new Error('El tipo de suscripción no está activo');

        // La nueva empieza donde termina la anterior; si ya venció, empieza hoy.
        const fecha_inicio = anterior.vencida ? hoy() : anterior.fecha_fin;

        return this.suscripcionRepository.renovarSuscripcion(anterior.id_suscripcion, {
            id_cliente: anterior.id_cliente,
            id_tipo_suscripcion: tipo.id_tipo_suscripcion,
            duracion_meses: tipo.cantidad_meses,
            peso_bolsa_g: tipo.peso_bolsa_g,
            cant_bolsas: tipo.cant_bolsas,
            fecha_inicio,
            fecha_fin: sumarMeses(fecha_inicio, tipo.cantidad_meses),
            id_suscripcion_anterior: anterior.id_suscripcion,
            comentario: dto.comentario ?? null,
            created_by: dto.created_by,
        });
    }
}
