import { ProveedorEntity } from "../../entities/proveedor.entity";
import { ProveedorRepository } from "../../repository/proveedor.repository";

export interface GetProveedorUseCase {
    execute(id: string): Promise<ProveedorEntity>;
}

export class GetProveedor implements GetProveedorUseCase {

    constructor(
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    async execute(id: string): Promise<ProveedorEntity> {
        const proveedor = await this.proveedorRepository.getProveedorById(id);
        if (!proveedor) throw new Error('Proveedor no encontrado');
        return proveedor;
    }
}
