import { SuscripcionEntity } from "../../../entities/suscripcion.entity";
import { SuscripcionRepository } from "../../../repository/suscripcion.repository";

export interface GetSuscripcionesClienteUseCase {
    execute(id_cliente: string): Promise<SuscripcionEntity[]>;
}

export class GetSuscripcionesCliente implements GetSuscripcionesClienteUseCase {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
    ) {}

    async execute(id_cliente: string): Promise<SuscripcionEntity[]> {
        const existeCliente = await this.suscripcionRepository.existeCliente(id_cliente);
        if (!existeCliente) throw new Error('Cliente no encontrado');

        return this.suscripcionRepository.getSuscripcionesByCliente(id_cliente);
    }
}
