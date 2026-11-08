import { UpdateMuestraDto } from "../../dtos/muestra/update";
import { MuestraEntity } from "../../entities/muestra.entity";
import { MuestraRepository } from "../../repository/muestra.repository";
import { OrigenRepository } from "../../repository/origen.repository";
import { ProveedorRepository } from "../../repository/proveedor.repository";
import { validarOrigenProveedor } from "../origen/validar-origen-proveedor";

export interface UpdateMuestraUseCase {
    execute(id: string, updateMuestraDto: UpdateMuestraDto): Promise<MuestraEntity>;
}

export class UpdateMuestra implements UpdateMuestraUseCase {
    constructor(
        private readonly muestraRepository: MuestraRepository,
        private readonly origenRepository: OrigenRepository,
        private readonly proveedorRepository: ProveedorRepository,
    ){}

    async execute(id: string, updateMuestraDto: UpdateMuestraDto): Promise<MuestraEntity> {
        await validarOrigenProveedor(this.origenRepository, this.proveedorRepository, {
            id_origen: updateMuestraDto.id_origen,
            id_proveedor: updateMuestraDto.id_proveedor,
            exigirActivo: true,
        });

        return this.muestraRepository.updateMuestra(id, updateMuestraDto);
    }
}