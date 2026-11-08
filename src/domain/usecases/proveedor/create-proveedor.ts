import { CreateProveedorDto } from "../../dtos/proveedor/create";
import { ProveedorEntity } from "../../entities/proveedor.entity";
import { ProveedorRepository } from "../../repository/proveedor.repository";

export interface CreateProveedorUseCase {
    execute(dto: CreateProveedorDto): Promise<ProveedorEntity>;
}

export class CreateProveedor implements CreateProveedorUseCase {

    constructor(
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    async execute(dto: CreateProveedorDto): Promise<ProveedorEntity> {
        const existente = await this.proveedorRepository.getProveedorByNombre(dto.nombre);
        if (existente) throw new Error(`Ya existe un proveedor con el nombre "${dto.nombre}"`);

        return this.proveedorRepository.createProveedor(dto);
    }
}
