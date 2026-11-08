import { EstadoSuscripcion, SuscripcionEntity } from "../entities/suscripcion.entity";

// Datos ya calculados por el use case para insertar una Suscripcion.
export interface DatosNuevaSuscripcion {
    id_cliente: string;
    id_tipo_suscripcion: string;
    duracion_meses: number;
    peso_bolsa_g: number;
    cant_bolsas: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    id_suscripcion_anterior: string | null;
    comentario: string | null;
    created_by: string;
}

// Cierre de un congelamiento abierto (al reactivar o al cancelar).
export interface DatosCierreCongelamiento {
    id_congelamiento: string;
    fecha_reactivacion: Date;
    dias: number;
    reactivado_por: string;
}

export interface DatosCambioEstado {
    estado: Extract<EstadoSuscripcion, 'FINALIZADA' | 'CANCELADA'>;
    id_user: string;
    comentario: string | null;
    cerrar_congelamiento: DatosCierreCongelamiento | null;
}

export interface DatosCongelamiento {
    fecha_congelamiento: Date;
    comentario: string | null;
    congelado_por: string;
}

export interface DatosReactivacion {
    cierre: DatosCierreCongelamiento;
    nueva_fecha_fin: Date;
    comentario: string | null;
}

export interface FiltrosConsultaSuscripcion {
    estado?: EstadoSuscripcion;
    id_cliente?: string;
}

// Todas las mutaciones se ejecutan en una transacción junto con su Historial
// (entidad SUSCRIPCION). Las reglas de negocio viven en los use cases.
export abstract class SuscripcionDataSource {

    // Historial CREATE.
    abstract crearSuscripcion(datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity>;

    // La anterior pasa a RENOVADA y se crea la nueva. Historial UPDATE (anterior) + CREATE (nueva).
    abstract renovarSuscripcion(id_anterior: string, datos: DatosNuevaSuscripcion): Promise<SuscripcionEntity>;

    // FINALIZADA → Historial COMPLETE. CANCELADA → Historial CANCEL.
    abstract cambiarEstado(id: string, datos: DatosCambioEstado): Promise<SuscripcionEntity>;

    // Historial UPDATE.
    abstract congelarSuscripcion(id: string, datos: DatosCongelamiento): Promise<SuscripcionEntity>;

    // Cierra el congelamiento y corre fecha_fin. Historial UPDATE.
    abstract reactivarSuscripcion(id: string, datos: DatosReactivacion): Promise<SuscripcionEntity>;

    abstract getSuscripcionById(id: string): Promise<SuscripcionEntity | null>;

    abstract getSuscripciones(filtros: FiltrosConsultaSuscripcion): Promise<SuscripcionEntity[]>;

    abstract getSuscripcionesByCliente(id_cliente: string): Promise<SuscripcionEntity[]>;

    abstract getSuscripcionActivaByCliente(id_cliente: string): Promise<SuscripcionEntity | null>;

    // Busca en UserCliente (usuario no eliminado).
    abstract existeCliente(id_cliente: string): Promise<boolean>;
}
