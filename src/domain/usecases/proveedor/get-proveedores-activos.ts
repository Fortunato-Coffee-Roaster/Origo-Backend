import { ProveedorEntity } from "../../entities/proveedor.entity";
import { ProveedorRepository } from "../../repository/proveedor.repository";

export interface GetProveedoresActivosUseCase {
    execute(): Promise<ProveedorEntity[]>;
}

export class GetProveedoresActivos implements GetProveedoresActivosUseCase {

    constructor(
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    async execute(): Promise<ProveedorEntity[]> {
        return this.proveedorRepository.getProveedores(true);
    }
}
