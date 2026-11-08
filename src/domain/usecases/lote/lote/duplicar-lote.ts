import { LoteEntity } from "../../../entities/lote.entity";
import { PedidoEntity } from "../../../entities/pedido.entity";
import { AnalisisRepository } from "../../../repository/analisis.repository";
import { AnalisisDefectosRespository } from "../../../repository/analisisDefectos.repository";
import { AnalisisFisicoRepository } from "../../../repository/analisisFisico.repository";
import { AnalisisSensorialRepository } from "../../../repository/analisisSensorial.repository";
import { LoteAnalisisRepository } from "../../../repository/lote-analisis.repository";
import { LoteRepository } from "../../../repository/lote.repository";
import { UserRepository } from "../../../repository/user.repository";
import { Pedido } from '@prisma/client';
import { CreateLoteUseCase } from "./create-lote";
import { CreateLoteDto } from "../../../dtos/lotes/lote/create";
import { CreateAnalisisFisicoDto } from "../../../dtos/analisis/fisico/create";
import { CreateAnalisisSensorialDTO } from "../../../dtos/analisis/sensorial/create";
import { CreateAnalisisDefectosDto } from "../../../dtos/analisis/defectos/create";
import { CreateAnalisisDto } from "../../../dtos/analisis/analisis/create";
import { CreateLoteAnalisisDto } from "../../../dtos/lote-analisis/create";
import { UpdateLoteDto } from "../../../dtos/lotes/lote/update";
import { create } from 'domain';

export interface DuplicateLoteUseCase {
    execute(lote: LoteEntity, pedido: PedidoEntity, tueste?: Boolean, id_completado_por?: string): Promise<LoteEntity>;
}
export class DuplicateLote implements DuplicateLoteUseCase {

    constructor(
        private readonly loteRepository: LoteRepository,
        private readonly createLoteUseCase: CreateLoteUseCase,
        private readonly analisisRepository: AnalisisRepository,
        private readonly analisisFisicoRepository: AnalisisFisicoRepository,
        private readonly analisisSensorialRepository: AnalisisSensorialRepository,
        private readonly analisisDefectosRepository: AnalisisDefectosRespository,
        private readonly loteAnalisisRepository: LoteAnalisisRepository
    ) { }

    async execute(lote: LoteEntity, pedido: PedidoEntity, tueste?: Boolean, id_completado_por?: string): Promise<LoteEntity> {

        const tipo_lote = pedido.tipo_pedido === 'Venta Verde' ? 'Lote Verde' : 'Lote Tostado';
         
        let pesoVerde = pedido.cantidad;
        let pesoTostado = 0;

        if (tueste){
            const cantidadVerde = Math.ceil(pedido.cantidad * 1.1765);
            pesoTostado = pedido.cantidad;
        }

        let [error, createLoteDto] = CreateLoteDto.create({
            productor: lote.productor,
            finca: lote.finca,
            distrito: lote.distrito,
            departamento: lote.departamento,
            peso_g: pesoVerde,
            peso_tostado_g: pesoTostado,
            variedades: lote.variedades,
            proceso: lote.proceso,
            tipo_lote: tipo_lote,
            clasificacion: lote.clasificacion,
            id_user: pedido.id_user,
            // datos de origen para el rotulado — se heredan del lote padre
            provincia: lote.provincia,
            anio_cosecha: lote.anio_cosecha,
            altura: lote.altura,
        });

        
        const nuevoLoteDestino = await this.createLoteUseCase.execute(
            createLoteDto!,
            tueste,
            lote.id_lote,
            undefined,
            pedido.id_pedido, 
            id_completado_por 
        );

        if (lote.id_analisis) {
            let nuevoFis, nuevoSen, nuevoDef;
            const analisis = await this.analisisRepository.getAnalisisById(lote.id_analisis);
            if (!analisis) throw new Error('Análisis no encontrado');
            if (analisis.analisisFisico_id) {
                // Recrear el análisis físico si existe
                let af = await this.analisisFisicoRepository.getAnalisisFisicoById(analisis.analisisFisico_id!);
                const [, dtoFis] = CreateAnalisisFisicoDto.create({ ...af! });
                nuevoFis = await this.analisisFisicoRepository.createAnalisisFisico(dtoFis!);
            }
            if (analisis.analisisSensorial_id) {
                // Recrear el análisis sensorial si existe
                let as = await this.analisisSensorialRepository.getAnalisisSensorialById(analisis.analisisSensorial_id!);
                const [, dtoSen] = CreateAnalisisSensorialDTO.create({ ...as! });
                nuevoSen = await this.analisisSensorialRepository.createAnalisisSensorial(dtoSen!);
            }
            if (analisis.analisisDefectos_id) {
                // Si hay análisis de defectos, recrearlo
                let ad = await this.analisisDefectosRepository.getAnalisisDefectosById(analisis.analisisDefectos_id!);
                const [, dtoDef] = CreateAnalisisDefectosDto.create({ ...ad! });
                nuevoDef = await this.analisisDefectosRepository.createAnalisisDefectos(dtoDef!);
            }
            // Crear la nueva entidad de análisis
            const [, dtoAnalisis] = CreateAnalisisDto.create({
                analisisFisico_id: nuevoFis?.id_analisis_fisico ? nuevoFis.id_analisis_fisico : undefined,
                analisisSensorial_id: nuevoSen?.id_analisis_sensorial ? nuevoSen.id_analisis_sensorial : undefined,
                analisisDefectos_id: nuevoDef?.id_analisis_defecto ? nuevoDef.id_analisis_defecto : undefined,
            });
            const nuevoAnalisis = await this.analisisRepository.createAnalisis(dtoAnalisis!);

            // Crear la relación entre el lote y el análisis
            const [, dtoLoteAnalisis] = CreateLoteAnalisisDto.create({
                id_lote: nuevoLoteDestino.id_lote,
                id_analisis: nuevoAnalisis.id_analisis,
            });
            await this.loteAnalisisRepository.create(dtoLoteAnalisis!);
            const [, dtoUpdateLote] = UpdateLoteDto.update({
                id_analisis: nuevoAnalisis.id_analisis,
            });
            console.log('dtoUpdateLote', dtoUpdateLote);
            await this.loteRepository.updateLote(nuevoLoteDestino.id_lote, dtoUpdateLote!);
        }

        return nuevoLoteDestino;
    }

}