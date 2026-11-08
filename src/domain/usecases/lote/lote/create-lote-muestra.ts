import { UpdateLoteDto } from './../../../dtos/lotes/lote/update';
import { CreateLoteAnalisisDto } from './../../../dtos/lote-analisis/create';
import { CreateAnalisisFisicoDto } from './../../../dtos/analisis/fisico/create';
import { CreateLoteDto } from "../../../dtos/lotes/lote/create";
import { LoteEntity } from "../../../entities/lote.entity";
import { MuestraRepository } from "../../../repository/muestra.repository";
import { CreateLoteUseCase } from "./create-lote";
import { AnalisisRepository } from "../../../repository/analisis.repository";
import { AnalisisFisicoRepository } from "../../../repository/analisisFisico.repository";
import { AnalisisSensorialRepository } from '../../../repository/analisisSensorial.repository';
import { CreateAnalisisDto } from '../../../dtos/analisis/analisis/create';
import { LoteRepository } from '../../../repository/lote.repository';
import { CreateAnalisisSensorialDTO } from '../../../dtos/analisis/sensorial/create';
import { LoteAnalisisRepository } from '../../../repository/lote-analisis.repository';
import { AnalisisDefectosRespository } from '../../../repository/analisisDefectos.repository';
import { CreateAnalisisDefectosDto } from '../../../dtos/analisis/defectos/create';

export interface CreateLoteFromMuestraUseCase {
    execute(id: string, createLoteDto: CreateLoteDto, id_user_accion: string, id_almacen?: string): Promise<LoteEntity>;
}

export class CreateLoteFromMuestra implements CreateLoteFromMuestraUseCase {
    constructor(
        private readonly createLoteUseCase: CreateLoteUseCase,
        private readonly loteAnalisisRepository: LoteAnalisisRepository,
        private readonly muestraRepository: MuestraRepository,
        private readonly analisisRepository: AnalisisRepository,
        private readonly analisisFisicoRepository: AnalisisFisicoRepository,
        private readonly analisisSensorialRepository: AnalisisSensorialRepository,
        private readonly analisisDefectosRepository: AnalisisDefectosRespository,
        private readonly loteRepository: LoteRepository,
    ) { }

    async execute(id: string, createLoteDto: CreateLoteDto, id_user_accion: string,id_almacen?: string): Promise<LoteEntity> {

        // 1) Obtener la muestra y validar
        const muestra = await this.muestraRepository.getMuestraById(id);
        if (!muestra) throw new Error('Muestra no encontrada');

        // Si la muestra es de tienda, forzamos el DTO del lote a ser de tienda
        const [err, finalDto] = CreateLoteDto.create({
            ...createLoteDto,
            owned_by_store: muestra.owned_by_store, // Mandan los datos originales de la muestra
            id_user: muestra.owned_by_store ? undefined : createLoteDto.id_user,
            // Datos de rotulado: si el formulario no los manda, se toman de la muestra
            id_origen: createLoteDto.id_origen ?? muestra.id_origen,
            id_proveedor: createLoteDto.id_proveedor ?? muestra.id_proveedor,
            anio_cosecha: createLoteDto.anio_cosecha ?? muestra.anio_cosecha,
            altura: createLoteDto.altura ?? muestra.altura,
        });
        if (err) throw new Error(err);

        // 2) Crea el nuevo lote — id_user_accion es SIEMPRE quien ejecuta (el autenticado),
        //    nunca el dueño del lote (que puede ser undefined si es de tienda).
        const lote = await this.createLoteUseCase.execute(finalDto!, undefined, undefined, id_almacen, undefined, id_user_accion);


        // 3) Si la muestra original tiene un análisis asociado, clonarlo y asociarlo al nuevo lote
        if (muestra.id_analisis) {
            let nuevoFis, nuevoSen, nuevoDef;
            const analisis = await this.analisisRepository.getAnalisisById(muestra.id_analisis);
            if (!analisis) throw new Error('Análisis no encontrado');
            if (analisis.analisisFisico_id) {
                // 3a) Recrear el análisis físico si existe
                let af = await this.analisisFisicoRepository.getAnalisisFisicoById(analisis.analisisFisico_id!);
                const [, dtoFis] = CreateAnalisisFisicoDto.create({ ...af! });
                nuevoFis = await this.analisisFisicoRepository.createAnalisisFisico(dtoFis!);
            }
            if (analisis.analisisSensorial_id) {
                // 3b)  Recrear el análisis sensorial si existe
                let as = await this.analisisSensorialRepository.getAnalisisSensorialById(analisis.analisisSensorial_id!);
                const [, dtoSen] = CreateAnalisisSensorialDTO.create({ ...as! });
                nuevoSen = await this.analisisSensorialRepository.createAnalisisSensorial(dtoSen!);
            }
            if (analisis.analisisDefectos_id) {
                // 3c) Si hay análisis de defectos, recrearlo
                let ad = await this.analisisDefectosRepository.getAnalisisDefectosById(analisis.analisisDefectos_id!);
                const [, dtoDef] = CreateAnalisisDefectosDto.create({ ...ad! });
                nuevoDef = await this.analisisDefectosRepository.createAnalisisDefectos(dtoDef!);
            }
            // 3c) Crear la nueva entidad de análisis
            // 3c) Relacionarlos en un nuevo “análisis”
            const [, dtoAnalisis] = CreateAnalisisDto.create({
                analisisFisico_id: nuevoFis?.id_analisis_fisico ? nuevoFis.id_analisis_fisico : undefined,
                analisisSensorial_id: nuevoSen?.id_analisis_sensorial ? nuevoSen.id_analisis_sensorial : undefined,
                analisisDefectos_id: nuevoDef?.id_analisis_defecto ? nuevoDef.id_analisis_defecto : undefined,
            });
            const nuevoAnalisis = await this.analisisRepository.createAnalisis(dtoAnalisis!);

            // 3d) Crear la relación entre el lote y el análisis
            const [, dtoLoteAnalisis] = CreateLoteAnalisisDto.create({
                id_lote: lote.id_lote,
                id_analisis: nuevoAnalisis.id_analisis,
            });
            await this.loteAnalisisRepository.create(dtoLoteAnalisis!);

            // 3e) Actualizar el lote destino con el nuevo análisis
            const [, dtoUpdateLote] = UpdateLoteDto.update({
                id_analisis: nuevoAnalisis.id_analisis,
            });
            await this.loteRepository.updateLote(lote.id_lote, dtoUpdateLote!);
        }

        // 4) Finalmente, eliminar la muestra original
        await this.muestraRepository.deleteMuestra(muestra.id_muestra);

        // 5) Retorna el nuevo lote creado
        return lote;
    }
}