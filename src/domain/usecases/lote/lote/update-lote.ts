import { LoteRepository } from '../../../repository/lote.repository';
import { LoteEntity } from "../../../entities/lote.entity";
import { UpdateLoteDto } from "../../../dtos/lotes/lote/update";
import { Historial } from '@prisma/client';
import { HistorialRepository } from '../../../repository/historial.repository';
import { OrigenRepository } from '../../../repository/origen.repository';
import { ProveedorRepository } from '../../../repository/proveedor.repository';
import { validarOrigenProveedor } from '../../origen/validar-origen-proveedor';


export interface UpdateLoteUseCase {
    execute(id:string , updateLoteDto: UpdateLoteDto): Promise<LoteEntity>;
}

export class UpdateLote implements UpdateLoteUseCase {
    constructor(
        private readonly loteRepository: LoteRepository,
        private readonly origenRepository: OrigenRepository,
        private readonly proveedorRepository: ProveedorRepository,
    ){}

    async execute( id:string ,updateLoteDto: UpdateLoteDto): Promise<LoteEntity> {  
        
                
        await validarOrigenProveedor(this.origenRepository, this.proveedorRepository, {
            id_origen: updateLoteDto.id_origen,
            id_proveedor: updateLoteDto.id_proveedor,
            exigirActivo: true,
        });

        return this.loteRepository.updateLote(id, updateLoteDto);

    }
}