import { CreateProveedorDto } from "../dtos/proveedor/create";
import { UpdateProveedorDto } from "../dtos/proveedor/update";
import { ProveedorEntity } from "../entities/proveedor.entity";

export abstract class ProveedorRepository {

    abstract createProveedor(dto: CreateProveedorDto): Promise<ProveedorEntity>;

    abstract updateProveedor(id: string, dto: UpdateProveedorDto): Promise<ProveedorEntity>;

    abstract getProveedorById(id: string): Promise<ProveedorEntity | null>;

    abstract getProveedorByNombre(nombre: string): Promise<ProveedorEntity | null>;

    abstract getProveedores(soloActivos: boolean): Promise<ProveedorEntity[]>;
}
