import { ProveedorEntity } from "../../entities/proveedor.entity";
import { ProveedorRepository } from "../../repository/proveedor.repository";

export interface GetProveedoresUseCase {
    execute(): Promise<ProveedorEntity[]>;
}

export class GetProveedores implements GetProveedoresUseCase {

    constructor(
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    async execute(): Promise<ProveedorEntity[]> {
        return this.proveedorRepository.getProveedores(false);
    }
}
