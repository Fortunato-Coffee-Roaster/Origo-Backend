import { OrigenDataSource } from "../../domain/datasources/origen.datasource";
import { FiltrosOrigenDto } from "../../domain/dtos/origen/filtros";
import { OrigenEntity } from "../../domain/entities/origen.entity";
import { OrigenRepository } from "../../domain/repository/origen.repository";

export class OrigenRepositoryImpl implements OrigenRepository {

    constructor(
        private readonly datasource: OrigenDataSource
    ) {}

    getOrigenes(filtros: FiltrosOrigenDto): Promise<OrigenEntity[]> {
        return this.datasource.getOrigenes(filtros);
    }

    getOrigenById(id: string): Promise<OrigenEntity | null> {
        return this.datasource.getOrigenById(id);
    }
}
