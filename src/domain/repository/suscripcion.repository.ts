import {
    DatosCambioEstado,
    DatosCongelamiento,
    DatosNuevaSuscripcion,
    DatosReactivacion,
    FiltrosConsultaSuscripcion,
} from "../datasources/suscripcion.datasource";
import { SuscripcionEntity } from "../entities/suscripcion.entity";

export abstract class SuscripcionRepository {

    abstract crearSuscripcion(datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity>;

    abstract renovarSuscripcion(id_anterior: string, datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity>;

    abstract cambiarEstado(id: string, datos: DatosCambioEstado): Promise<SuscripcionEntity>;

    abstract congelarSuscripcion(id: string, datos: DatosCongelamiento): Promise<SuscripcionEntity>;

    abstract reactivarSuscripcion(id: string, datos: DatosReactivacion): Promise<SuscripcionEntity>;

    abstract getSuscripcionById(id: string): Promise<SuscripcionEntity | null>;

    abstract getSuscripciones(filtros: FiltrosConsultaSuscripcion): Promise<SuscripcionEntity[]>;

    abstract getSuscripcionesByCliente(id_cliente: string): Promise<SuscripcionEntity[]>;

    abstract getSuscripcionActivaByCliente(id_cliente: string): Promise<SuscripcionEntity | null>;

    abstract existeCliente(id_cliente: string): Promise<boolean>;
}
