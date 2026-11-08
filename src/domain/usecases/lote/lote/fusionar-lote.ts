import { LoteRepository } from '../../../repository/lote.repository';
import { LoteEntity } from '../../../entities/lote.entity';
import { FusionarLotesDto } from '../../../dtos/lotes/lote/fusionar-lotes';
import { UpdateLoteDto } from '../../../dtos/lotes/lote/update';

export interface FusionarLoteUseCase {
  execute(dto: FusionarLotesDto): Promise<LoteEntity>;
}

export class FusionarLotes implements FusionarLoteUseCase {
  constructor(
    private readonly loteRepository: LoteRepository
  ) {}

  async execute(dto: FusionarLotesDto): Promise<LoteEntity> {
    const { lotes } = dto;

    // Validar que vengan exactamente 2 lotes
    if (!lotes || lotes.length === 0) {
      throw new Error('Los lotes son requeridos');
    }
    if (lotes.length !== 2) {
      throw new Error('Solo puedes fusionar exactamente 2 lotes');
    }

    // Destructurar los dos lotes y validar pesos
    const [[id1, ], [id2, pesoTransferir]] = lotes;
    if (pesoTransferir <= 0) {
      throw new Error('El peso a transferir debe ser mayor a 0');
    }
    
    // Obtener entidades
    const lote1 = await this.loteRepository.getLoteById(id1);
    const lote2 = await this.loteRepository.getLoteById(id2);

    if (!lote1 || !lote2) {
      throw new Error('Uno o más lotes no existen');
    }
    if (lote1.eliminado || lote2.eliminado) {
      throw new Error('Uno o más lotes están eliminados');
    }
    if (lote2.peso_g < pesoTransferir) {
      throw new Error('El lote origen no tiene suficiente peso para transferir');
    }

    // Calcular nuevos pesos
    const nuevoPeso1 = lote1.peso_g + pesoTransferir;
    const nuevoPeso2 = lote2.peso_g - pesoTransferir;

    // Actualizar lote1
    const [err1, updateDto1] = UpdateLoteDto.update({ peso_g: nuevoPeso1 });
    if (err1) {
      throw new Error(err1);
    }
    await this.loteRepository.updateLote(lote1.id_lote, updateDto1!);

    // Actualizar lote2
    const [err2, updateDto2] = UpdateLoteDto.update({ peso_g: nuevoPeso2 });
    if (err2) {
      throw new Error(err2);
    }
    if (nuevoPeso2 == 0) {
      // Si el lote2 queda con peso 0 o menos, lo eliminamos
      await this.loteRepository.deleteLote(lote2.id_lote);
    }
    await this.loteRepository.updateLote(lote2.id_lote, updateDto2!);

    // Devolver la entidad actualizada del primer lote
    return this.loteRepository.getLoteById(id1) as Promise<LoteEntity>;
  }
}
