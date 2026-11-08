import { CreateTipoSuscripcionDto } from "../dtos/suscripcion/tipo-suscripcion/create";
import { UpdateTipoSuscripcionDto } from "../dtos/suscripcion/tipo-suscripcion/update";
import { TipoSuscripcionEntity } from "../entities/tipo-suscripcion.entity";

export abstract class TipoSuscripcionDataSource {

    // Crea el tipo y registra Historial (TIPO_SUSCRIPCION / CREATE) en la misma transacción.
    abstract createTipoSuscripcion(dto: CreateTipoSuscripcionDto): Promise<TipoSuscripcionEntity>;

    // Actualiza el tipo y registra Historial (TIPO_SUSCRIPCION / UPDATE) en la misma transacción.
    abstract updateTipoSuscripcion(id: string, dto: UpdateTipoSuscripcionDto): Promise<TipoSuscripcionEntity>;

    abstract getTipoSuscripcionById(id: string): Promise<TipoSuscripcionEntity | null>;

    abstract getTipoSuscripcionByNombre(nombre: string): Promise<TipoSuscripcionEntity | null>;

    abstract getAllTiposSuscripcion(): Promise<TipoSuscripcionEntity[]>;
}
