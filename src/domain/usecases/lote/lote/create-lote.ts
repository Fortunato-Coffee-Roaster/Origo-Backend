import { CreateLoteDto } from "../../../dtos/lotes/lote/create";
import { LoteRepository } from '../../../repository/lote.repository';
import { LoteEntity } from "../../../entities/lote.entity";
import { UserRepository } from "../../../repository/user.repository";
import { Pedido } from "@prisma/client";
import { PedidoRepository } from "../../../repository/pedido.repository";
import { HistorialRepository } from "../../../repository/historial.repository";
import { MovimientoAlmacenRepository } from "../../../repository/movimiento-almacen.repository";
import { InventarioLoteRepository } from "../../../repository/inventario-lote.repository";
import { CreateHistorialDto } from "../../../dtos/historial/create";
import { HistorialEntidad } from "../../../../enums/historial-entidad.enum";
import { HistorialAccion } from "../../../../enums/historial-accion.enum";
import { TipoMovimiento } from "../../../../enums/tipo-movimiento.enum";
import { EntidadInventario } from "../../../../enums/entidad-inventario.enum";
import { CreateMovimientoAlmacenDto } from "../../../dtos/almacen/movimiento-almacen/create";
import { TipoUser } from "../../../../enums/tipo-user.enum";


export interface CreateLoteUseCase {
    execute(createLoteDto: CreateLoteDto, tueste?: Boolean, id_c?: string, id_almacen?: string, id_pedido?: string, id_user_accion?: string): Promise<LoteEntity>;
}

export class CreateLote implements CreateLoteUseCase {

    constructor(
        private readonly loteRepository: LoteRepository,
        private readonly userRepository: UserRepository,
        private readonly pedidoRepository: PedidoRepository,
        private readonly historialRepository: HistorialRepository,
        private readonly movimientoAlmacenRepository: MovimientoAlmacenRepository,
        private readonly inventarioLoteRepository: InventarioLoteRepository
    ) { }

    async execute(createLoteDto: CreateLoteDto, tueste?: Boolean, id_c?: string, id_almacen?: string, id_pedido?: string, id_user_accion?: string): Promise<LoteEntity> {
        const id = await this.generarId(createLoteDto, tueste, id_c);
        const [error, dto] = CreateLoteDto.create({
            ...createLoteDto,
            id_lote: id,
        });
        if (error) {
            console.log('Error DTO:', error);
        }
        const lote = await this.loteRepository.createLote(dto!);

        if (id_almacen) {
            await this.inventarioLoteRepository.createInventario({
                id_lote: lote.id_lote,
                id_almacen: id_almacen,
                cantidad_kg: lote.peso,
            });

            // Ingreso inicial de stock — mismo criterio que cualquier otra entrada a almacén.
            const [movError, movDto] = CreateMovimientoAlmacenDto.create({
                tipo: TipoMovimiento.INGRESO,
                entidad: EntidadInventario.LOTE,
                id_entidad_primario: lote.id_lote,
                id_almacen_destino: id_almacen,
                cantidad: lote.peso,
                id_user: id_user_accion ?? createLoteDto.id_user!,
                id_pedido: id_pedido,
                objeto_despues: lote,
                comentario: id_pedido
                    ? `Ingreso inicial por lote creado desde pedido ${id_pedido}`
                    : `Ingreso inicial por creación manual de lote`,
            });
            if (movError || !movDto) throw new Error(movError ?? 'Error al construir movimiento de ingreso de lote');
            await this.movimientoAlmacenRepository.createMovimiento(movDto);
        }

        // Historial de creación — único punto de entrada, sin importar si el lote
        // nace manual, desde un Pedido (vía DuplicateLote), o desde una Muestra.
        // id_user aquí es quien EJECUTÓ la acción, no necesariamente el dueño del lote
        // (un lote de tienda no tiene dueño/cliente, así que createLoteDto.id_user puede venir undefined).
        const [histError, histDto] = CreateHistorialDto.create({
            entidad: HistorialEntidad.LOTE,
            accion: HistorialAccion.CREATE,
            id_entidad: lote.id_lote,
            id_user: id_user_accion ?? createLoteDto.id_user!,
            id_pedido: id_pedido ?? undefined,
            comentario: id_pedido
                ? `Lote creado a partir del pedido ${id_pedido}`
                : `Lote creado manualmente`,
        });
        if (histError || !histDto) throw new Error(histError ?? 'Error al construir historial de creación de lote');
        await this.historialRepository.createHistorial(histDto);

        return lote;
    }

    generarId = async (dto: CreateLoteDto, tueste?: Boolean, id_c?: string): Promise<string> => {
        const user = dto.id_user
            ? await this.userRepository.getUserById(dto.id_user)
            : null;
        const esCliente = user?.tipo === TipoUser.CLIENTE;

        // CASO: lote derivado (cliente, con origen en un lote padre vía pedido).
        if (esCliente && id_c) {
            const partesNombre = user!.nombre.trim().split(' ');
            const inicialNombreUser = partesNombre[0]?.charAt(0).toUpperCase() || '';
            const inicialApellidoUser = partesNombre[1]?.charAt(0).toUpperCase() || '';

            let idGenerado = `${inicialNombreUser}${inicialApellidoUser}-${id_c}`;
            if (tueste) {
                idGenerado = `${idGenerado}-T`;
            }
            return idGenerado;
        }

        //  lOTE NUEVO (raíz — tienda o cliente desde cero)
        const { productor, variedades, proceso } = dto;
        const nombres = productor.trim().split(' ');
        const inicialNombre = nombres[0]?.charAt(0).toUpperCase() || '';
        const inicialApellido = nombres[1]?.charAt(0).toUpperCase() || '';


        let inicialVariedad = '';

        if (variedades.length >= 3) {
            inicialVariedad = 'BL';
        } else {
            for (const variedad of variedades) {
                const palabras = variedad.trim().split(' ');
                if (palabras.length > 0) {
                    inicialVariedad += palabras[0].slice(0, 2).toUpperCase();
                    for (let i = 1; i < palabras.length; i++) {
                        inicialVariedad += palabras[i].charAt(0).toUpperCase();
                    }
                }
            }
        }

        let inicialProceso = '';
        if (proceso.toLowerCase() === 'natural') {
            inicialProceso = 'NA';
        } else if (proceso.toLowerCase() === 'honey') {
            inicialProceso = 'HO';
        } else if (proceso.toLowerCase() === 'lavado') {
            inicialProceso = '';
        }

        let idGenerado = `${inicialNombre}${inicialApellido}${inicialVariedad}${inicialProceso}`;

        // NUMERO FINAL — solo se calcula para lotes raíz (nunca para derivados)
        const numeroLoteFinal = dto.owned_by_store
            ? (await this.loteRepository.getLotesOwnedByStore(true)).length + 1
            : (await this.loteRepository.getLotesByUserId(dto.id_user!, true)).length + 1;
        idGenerado = `${idGenerado}-${numeroLoteFinal}`;


        // LOTE PARA CLIENTE (raíz, sin id_c)
        if (esCliente) {
            const partesNombre = user!.nombre.trim().split(' ');
            const inicialNombreUser = partesNombre[0]?.charAt(0).toUpperCase() || '';
            const inicialApellidoUser = partesNombre[1]?.charAt(0).toUpperCase() || '';

            idGenerado = `${inicialNombreUser}${inicialApellidoUser}-${idGenerado}`;

            if (tueste) {
                idGenerado = `${idGenerado}-T`;
            }
        }

        return idGenerado;
    }
}