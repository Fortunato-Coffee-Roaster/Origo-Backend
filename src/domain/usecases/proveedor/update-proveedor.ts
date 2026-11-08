import { UpdateProveedorDto } from "../../dtos/proveedor/update";
import { ProveedorEntity } from "../../entities/proveedor.entity";
import { ProveedorRepository } from "../../repository/proveedor.repository";

export interface UpdateProveedorUseCase {
    execute(id: string, dto: UpdateProveedorDto): Promise<ProveedorEntity>;
}

export class UpdateProveedor implements UpdateProveedorUseCase {

    constructor(
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    async execute(id: string, dto: UpdateProveedorDto): Promise<ProveedorEntity> {
        const proveedor = await this.proveedorRepository.getProveedorById(id);
        if (!proveedor) throw new Error('Proveedor no encontrado');

        if (dto.nombre && dto.nombre.toLowerCase() !== proveedor.nombre.toLowerCase()) {
            const existente = await this.proveedorRepository.getProveedorByNombre(dto.nombre);
            if (existente) throw new Error(`Ya existe un proveedor con el nombre "${dto.nombre}"`);
        }

        return this.proveedorRepository.updateProveedor(id, dto);
    }
}
