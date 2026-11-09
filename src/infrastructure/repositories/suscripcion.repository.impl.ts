import {
    DatosCambioEstado,
    DatosCongelamiento,
    DatosNuevaSuscripcion,
    DatosReactivacion,
    FiltrosConsultaSuscripcion,
    SuscripcionDataSource,
} from "../../domain/datasources/suscripcion.datasource";
import { SuscripcionEntity } from "../../domain/entities/suscripcion.entity";
import { SuscripcionRepository } from "../../domain/repository/suscripcion.repository";

export class SuscripcionRepositoryImpl implements SuscripcionRepository {

    constructor(
        private readonly datasource: SuscripcionDataSource
    ) {}

    crearSuscripcion(datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity> {
        return this.datasource.crearSuscripcion(datos);
    }

    renovarSuscripcion(id_anterior: string, datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity> {
        return this.datasource.renovarSuscripcion(id_anterior, datos);
    }

    cambiarEstado(id: string, datos: DatosCambioEstado): Promise<SuscripcionEntity> {
        return this.datasource.cambiarEstado(id, datos);
    }

    congelarSuscripcion(id: string, datos: DatosCongelamiento): Promise<SuscripcionEntity> {
        return this.datasource.congelarSuscripcion(id, datos);
    }

    reactivarSuscripcion(id: string, datos: DatosReactivacion): Promise<SuscripcionEntity> {
        return this.datasource.reactivarSuscripcion(id, datos);
    }

    getSuscripcionById(id: string): Promise<SuscripcionEntity | null> {
        return this.datasource.getSuscripcionById(id);
    }

    getSuscripciones(filtros: FiltrosConsultaSuscripcion): Promise<SuscripcionEntity[]> {
        return this.datasource.getSuscripciones(filtros);
    }

    getSuscripcionesByCliente(id_cliente: string): Promise<SuscripcionEntity[]> {
        return this.datasource.getSuscripcionesByCliente(id_cliente);
    }

    getSuscripcionActivaByCliente(id_cliente: string): Promise<SuscripcionEntity | null> {
        return this.datasource.getSuscripcionActivaByCliente(id_cliente);
    }

    existeCliente(id_cliente: string): Promise<boolean> {
        return this.datasource.existeCliente(id_cliente);
    }
}
