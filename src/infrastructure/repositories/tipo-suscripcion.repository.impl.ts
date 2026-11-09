import { TipoSuscripcionDataSource } from "../../domain/datasources/tipo-suscripcion.datasource";
import { CreateTipoSuscripcionDto } from "../../domain/dtos/suscripcion/tipo-suscripcion/create";
import { UpdateTipoSuscripcionDto } from "../../domain/dtos/suscripcion/tipo-suscripcion/update";
import { TipoSuscripcionEntity } from "../../domain/entities/tipo-suscripcion.entity";
import { TipoSuscripcionRepository } from "../../domain/repository/tipo-suscripcion.repository";

export class TipoSuscripcionRepositoryImpl implements TipoSuscripcionRepository {

    constructor(
        private readonly datasource: TipoSuscripcionDataSource
    ) {}

    createTipoSuscripcion(dto: CreateTipoSuscripcionDto): Promise<TipoSuscripcionEntity> {
        return this.datasource.createTipoSuscripcion(dto);
    }

    updateTipoSuscripcion(id: string, dto: UpdateTipoSuscripcionDto): Promise<TipoSuscripcionEntity> {
        return this.datasource.updateTipoSuscripcion(id, dto);
    }

    getTipoSuscripcionById(id: string): Promise<TipoSuscripcionEntity | null> {
        return this.datasource.getTipoSuscripcionById(id);
    }

    getTipoSuscripcionByNombre(nombre: string): Promise<TipoSuscripcionEntity | null> {
        return this.datasource.getTipoSuscripcionByNombre(nombre);
    }

    getAllTiposSuscripcion(): Promise<TipoSuscripcionEntity[]> {
        return this.datasource.getAllTiposSuscripcion();
    }
}
