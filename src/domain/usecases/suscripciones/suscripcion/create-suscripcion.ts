import { CreateSuscripcionDto } from "../../../dtos/suscripcion/suscripcion/create";
import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";
import { TipoSuscripcionRepository } from "../../../repository/tipo-suscripcion.repository";
import { sumarMeses } from "../../../utils/fechas";

export interface CreateSuscripcionUseCase {
    execute(dto: CreateSuscripcionDto): Promise<SuscripcionEntity>;
}

export class CreateSuscripcion implements CreateSuscripcionUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository,
    ) {}

    async execute(dto: CreateSuscripcionDto): Promise<SuscripcionEntity> {
        const tipo = await this.tipoSuscripcionRepository.getTipoSuscripcionById(dto.id_tipo_suscripcion);
        if (!tipo) throw new Error('Tipo de suscripción no encontrado');
        if (!tipo.activo) throw new Error('El tipo de suscripción no está activo');

        const existeCliente = await this.suscripcionRepository.existeCliente(dto.id_cliente);
        if (!existeCliente) throw new Error('Cliente no encontrado');

        const activa = await this.suscripcionRepository.getSuscripcionActivaByCliente(dto.id_cliente);
        if (activa) throw new Error('El cliente ya tiene una suscripción ACTIVA. Renuévela o ciérrela antes de crear otra.');

        // Se copian los datos del plan: si el plan cambia después, esta suscripción no cambia.
        return this.suscripcionRepository.crearSuscripcion({
            id_cliente: dto.id_cliente,
            id_tipo_suscripcion: tipo.id_tipo_suscripcion,
            duracion_meses: tipo.cantidad_meses,
            peso_bolsa_g: tipo.peso_bolsa_g,
            cant_bolsas: tipo.cant_bolsas,
            fecha_inicio: dto.fecha_inicio,
            fecha_fin: sumarMeses(dto.fecha_inicio, tipo.cantidad_meses),
            id_suscripcion_anterior: null,
            comentario: dto.comentario,
            created_by: dto.created_by,
        });
    }
}
