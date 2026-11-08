import { ProveedorDataSource } from "../../domain/datasources/proveedor.datasource";
import { CreateProveedorDto } from "../../domain/dtos/proveedor/create";
import { UpdateProveedorDto } from "../../domain/dtos/proveedor/update";
import { ProveedorEntity } from "../../domain/entities/proveedor.entity";
import { ProveedorRepository } from "../../domain/repository/proveedor.repository";

export class ProveedorRepositoryImpl implements ProveedorRepository {

    constructor(
        private readonly datasource: ProveedorDataSource
    ) {}

    createProveedor(dto: CreateProveedorDto): Promise<ProveedorEntity> {
        return this.datasource.createProveedor(dto);
    }

    updateProveedor(id: string, dto: UpdateProveedorDto): Promise<ProveedorEntity> {
        return this.datasource.updateProveedor(id, dto);
    }

    getProveedorById(id: string): Promise<ProveedorEntity | null> {
        return this.datasource.getProveedorById(id);
    }

    getProveedorByNombre(nombre: string): Promise<ProveedorEntity | null> {
        return this.datasource.getProveedorByNombre(nombre);
    }

    getProveedores(soloActivos: boolean): Promise<ProveedorEntity[]> {
        return this.datasource.getProveedores(soloActivos);
    }
}
