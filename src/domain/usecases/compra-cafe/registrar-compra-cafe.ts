import { CreateCompraCafeDto } from "../../dtos/lotes/compra-cafe/create";
import { CompraCafeEntity } from "../../entities/compra-cafe.entity";
import { CompraCafeRepository } from "../../repository/compra-cafe.repository";
import { LoteRepository } from "../../repository/lote.repository";
import { AlmacenRepository } from "../../repository/almacen.repository";
import { ProveedorRepository } from "../../repository/proveedor.repository";

export interface RegistrarCompraCafeUseCase {
    execute(dto: CreateCompraCafeDto): Promise<CompraCafeEntity>;
}

// Recompra manual de un lote de tienda ya existente (más sacos del mismo café).
// La primera compra se registra sola al crear el lote (CreateLote).
export class RegistrarCompraCafe implements RegistrarCompraCafeUseCase {

    constructor(
        private readonly compraCafeRepository: CompraCafeRepository,
        private readonly loteRepository: LoteRepository,
        private readonly almacenRepository: AlmacenRepository,
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    async execute(dto: CreateCompraCafeDto): Promise<CompraCafeEntity> {
        const lote = await this.loteRepository.getLoteById(dto.id_lote);
        if (!lote) throw new Error('Lote no encontrado');
        if (lote.eliminado) throw new Error('El lote está eliminado');
        if (!lote.owned_by_store) throw new Error('Solo se registran compras de lotes de la tienda');

        const almacen = await this.almacenRepository.getAlmacenById(dto.id_almacen);
        if (!almacen) throw new Error('Almacén no encontrado');
        if (almacen.activo === false) throw new Error('El almacén está inactivo');

        // Sin proveedor explícito se usa el del lote; si viene, debe existir y estar activo.
        let id_proveedor = dto.id_proveedor;
        if (id_proveedor) {
            const proveedor = await this.proveedorRepository.getProveedorById(id_proveedor);
            if (!proveedor) throw new Error('Proveedor no encontrado');
            if (!proveedor.activo) throw new Error('El proveedor está inactivo');
        } else {
            id_proveedor = lote.id_proveedor;
        }

        return this.compraCafeRepository.registrarCompra(dto.conProveedor(id_proveedor));
    }
}
