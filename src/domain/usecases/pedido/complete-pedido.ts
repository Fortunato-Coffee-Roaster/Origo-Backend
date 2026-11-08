import { CreateInventarioLoteDto } from './../../dtos/inventarios/inventario-lote/create';
import { create } from 'domain';
import { CreateLoteTostado } from './../lote/lote-tostado/create-lote-tostado';
import { UpdateLoteDto } from "../../dtos/lotes/lote/update";
import { PedidoEntity } from "../../entities/pedido.entity";
import { LoteRepository } from "../../repository/lote.repository";
import { PedidoRepository } from "../../repository/pedido.repository";
import { DuplicateLoteUseCase } from './../lote/lote/duplicar-lote';
import { UpdatePedidoDto } from '../../dtos/pedido/update';
import { InventarioProductoRepository } from "../../repository/inventario-producto.repository";
import { LoteTostadoRepository } from "../../repository/loteTostado.repository";
import { InventarioLoteRepository } from "../../repository/inventario-lote.repository";
import { InventarioLoteTostadoRepository } from "../../repository/inventario-lote-tostado.repository";
import { UpdateInventarioLoteDto } from "../../dtos/inventarios/inventario-lote/update";
import { UpdateInventarioLoteTostadoDto } from "../../dtos/inventarios/inventario-lote-tostado/update";
import { HistorialRepository } from "../../repository/historial.repository";
import { MovimientoAlmacenRepository } from "../../repository/movimiento-almacen.repository";
import { TipoMovimiento } from "../../../enums/tipo-movimiento.enum";
import { EntidadInventario } from "../../../enums/entidad-inventario.enum";
import { CreateMovimientoAlmacenDto } from "../../dtos/almacen/movimiento-almacen/create";
import { HistorialEntidad } from "../../../enums/historial-entidad.enum";
import { HistorialAccion } from "../../../enums/historial-accion.enum";
import { CreateHistorialDto } from "../../dtos/historial/create";
import { TuesteRepository } from '../../repository/tueste.repository';
import { CreateLoteTostadoDto } from "../../dtos/lotes/lote-tostado/create";
import { UpdateTuesteDto } from "../../dtos/tueste/update";
import { Console } from 'console';
import { PedidoBolsaRepository } from '../../repository/pedido-bolsa.repository';
import { BolsaRepository } from '../../repository/bolsa.repository';
import { InventarioBolsaRepository } from '../../repository/inventario-bolsa.repository';
import { CreateInventarioBolsaDto } from '../../dtos/inventarios/inventario-bolsa/create';
import { CreateBolsaDto } from '../../dtos/bolsa/create';
import { getMoliendaAbrev } from '../../utils/molienda-abrev';
import { PedidoItemRepository } from '../../repository/pedido-item.repository';
import { PaqueteRepository } from '../../repository/paquete.repository';
import { PaqueteItemRepository } from '../../repository/paquete-item.repository';
import { InventarioGenericoRepository } from '../../repository/inventario-generico.repository';
import { CreatePaqueteDto } from '../../dtos/paquete/create';
import { CreatePaqueteItemDto } from '../../dtos/paquete-item/create';
import { getUnidadMedidaDefault } from '../../utils/unidad-medida-default';

export interface CompletarPedidoUseCase {
    execute(id_pedido: string, id_completado_por: string): Promise<PedidoEntity>;
}

export class CompletarPedido implements CompletarPedidoUseCase {
    constructor(
        private readonly pedidoRepository: PedidoRepository,
        private readonly loteRepository: LoteRepository,
        private readonly loteTostadoRepository: LoteTostadoRepository,
        private readonly inventarioLoteRepository: InventarioLoteRepository,
        private readonly inventarioLoteTostadoRepository: InventarioLoteTostadoRepository,
        private readonly duplicateLoteUseCase: DuplicateLoteUseCase,
        private readonly historialRepository: HistorialRepository,
        private readonly movimientoAlmacenRepository: MovimientoAlmacenRepository,
        private readonly tuesteRepository: TuesteRepository,
        private readonly createLoteTostado: CreateLoteTostado,
        private readonly pedidoBolsaRepository: PedidoBolsaRepository,
        private readonly bolsaRepository: BolsaRepository,
        private readonly inventarioBolsaRepository: InventarioBolsaRepository,
        private readonly pedidoItemRepository: PedidoItemRepository,
        private readonly paqueteRepository: PaqueteRepository,
        private readonly paqueteItemRepository: PaqueteItemRepository,
        private readonly inventarioGenericoRepository: InventarioGenericoRepository,
    ) { }

    async execute(id_pedido: string, id_completado_por: string): Promise<PedidoEntity> {
        const pedido = await this.pedidoRepository.getPedidoById(id_pedido);
        if (!pedido || pedido.eliminado) {
            throw new Error('El pedido no existe o fue eliminado');
        }

        // Validar que no esté ya completado
        if (pedido.estado_pedido === 'Completado') {
            return PedidoEntity.fromObject(pedido);
        }

        // Acciones según tipo de pedido
        switch (pedido.tipo_pedido) {
            case 'Venta Verde':
                return this.ventaVerdeCompletion(pedido.id_pedido, id_completado_por);
                break;
            case 'Tostado Verde':
                return this.tostadoVerdeCompletion(pedido.id_pedido, id_completado_por);
                break;
            case 'Orden Tueste':
                return this.ordenTuesteCompletion(pedido.id_pedido, id_completado_por);
                break
            case 'Maquila':
                return this.maquilaCompletion(pedido.id_pedido, id_completado_por);
                break
            case 'OrdenDespacho':
                return this.ordenDespachoCompletion(pedido.id_pedido, id_completado_por);
                break
            case 'Suscripcion':
                return this.pedidoRepository.completarPedido(id_pedido, id_completado_por);
                break;
            default:
                throw new Error('Tipo de pedido inválido');
        }

    }


    async ventaVerdeCompletion(pedidoId: string, id_completado_por: string) {
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId);
        if (!pedido || pedido.estado_pedido !== "Pendiente") throw new Error("Pedido no válido");

        const loteOrigen = await this.loteRepository.getLoteById(pedido.id_lote!);
        if (!loteOrigen) throw new Error("Lote origen no válido");


        // verificar que el lote origen tenga suficiente peso para la cantidad solicitada en su almacen correspondiente
        const inventarioLote = await this.inventarioLoteRepository.getByLoteAndAlmacen(loteOrigen.id_lote, pedido.id_almacen!);
        if (!inventarioLote || inventarioLote.cantidad_g < pedido.cantidad) {
            throw new Error("Stock insuficiente en el almacén");
        }


        // crear lote destino o actualizar existente
        // Verificar si el cliente ya tiene un lote nuevo creado desde este mismo lote original y del mismo tipo de pedido
        const hasLote = await this.verifyIfUserHasLote(pedido.id_user, loteOrigen.id_lote, 'Lote Verde');
        if (!hasLote) {
            // crear nuevo lote
            const nuevoLoteDestino = await this.duplicateLoteUseCase.execute(loteOrigen, pedido, false, id_completado_por);
            // crear un inventario para el nuevo lote 
            const nuevoInventarioLote = await this.inventarioLoteRepository.createInventario({
                id_lote: nuevoLoteDestino.id_lote!,
                id_almacen: pedido.id_almacen!,
                cantidad_g: pedido.cantidad,
            });
            //crear movimiento almacen, derivacion ya que el lote se parte 
            await this.registrarMovimiento({
                tipo: TipoMovimiento.DERIVACION,
                entidad: EntidadInventario.LOTE,
                id_entidad_primario: pedido.id_lote!,
                id_entidad_secundario: nuevoLoteDestino.id_lote,
                id_almacen_origen: pedido.id_almacen,
                id_almacen_destino: pedido.id_almacen,
                cantidad: pedido.cantidad,
                id_user: id_completado_por,
                id_pedido: pedido.id_pedido,
                comentario: `Derivación por Lote Verde en pedido`,

            });

            // actualizar pedido
            const [error, updatePedidoDto] = UpdatePedidoDto.update({
                id_nuevoLote: nuevoLoteDestino.id_lote,
            });
            if (error) {
                throw new Error(error);
            }

            await this.pedidoRepository.updatePedido(pedidoId, updatePedidoDto!);


        } else {
            // actualizar lote existente
            // actualizar stock del lote existente en su inventario correspondiente
            const inventarioLoteExistente = await this.inventarioLoteRepository.getByLoteAndAlmacen(hasLote, pedido.id_almacen!);
            // si no tiene inventario, crear uno con la cantidad del pedido, caso contrario actualizar sumando la cantidad del pedido al inventario existente
            if (!inventarioLoteExistente) {
                // crear un inventario para el nuevo lote 
                const nuevoInventarioLote = await this.inventarioLoteRepository.createInventario({
                    id_lote: hasLote,
                    id_almacen: pedido.id_almacen!,
                    cantidad_g: pedido.cantidad,
                });
            } else {
                // actualizar inventario sumando la cantidad del pedido al inventario existente
                const nuevoPesoInventario = inventarioLoteExistente.cantidad_g + pedido.cantidad;
                const [error, updateInventarioLoteExistenteDto] = UpdateInventarioLoteDto.update({ cantidad_g: nuevoPesoInventario });
                if (error) {
                    throw new Error(error);
                }
                await this.inventarioLoteRepository.updateInventario(inventarioLoteExistente.id_inventario, updateInventarioLoteExistenteDto!);
            }
            //crear movimiento almacen, derivacion ya que el lote se parte 
            await this.registrarMovimiento({
                tipo: TipoMovimiento.DERIVACION,
                entidad: EntidadInventario.LOTE,
                id_entidad_primario: pedido.id_lote!,
                id_entidad_secundario: hasLote,
                id_almacen_origen: pedido.id_almacen,
                id_almacen_destino: pedido.id_almacen,
                cantidad: pedido.cantidad,
                id_user: id_completado_por,
                id_pedido: pedido.id_pedido,
                comentario: `Derivación por Lote Verde en pedido`,
            });
            // en caso el lote existente este como eliminado, reactivarlo
            const loteExistente = await this.loteRepository.getLoteById(hasLote);
            if (!loteExistente) throw new Error("Lote existente no encontrado");
            if (loteExistente.eliminado) {

                const [error, updateLoteDto] = UpdateLoteDto.update({ eliminado: false });
                if (error) throw new Error(`Error al actualizar lote: ${error}`);
                await this.loteRepository.updateLote(loteExistente.id_lote, updateLoteDto!);

                await this.registrarHistorial({
                    entidad: HistorialEntidad.LOTE,
                    accion: HistorialAccion.UPDATE,
                    id_entidad: loteExistente.id_lote,
                    id_user: id_completado_por,
                    id_pedido: pedido.id_pedido,
                    comentario: `Reactivación de lote por pedido`,
                });
            }

            // actualizar pedido
            const [e, updatePedidoDto] = UpdatePedidoDto.update({
                id_lote_destino: loteExistente.id_lote,
            });
            if (e) {
                throw new Error(e);
            }

            await this.pedidoRepository.updatePedido(pedidoId, updatePedidoDto!);

        }

        // restar stock en lote origen
        const nuevoPesoLote = inventarioLote.cantidad_g - pedido.cantidad;
        const [error, updateInventarioLoteDto] = UpdateInventarioLoteDto.update({ cantidad_g: nuevoPesoLote });
        if (error) {
            throw new Error(error);
        }
        await this.inventarioLoteRepository.updateInventario(inventarioLote.id_inventario, updateInventarioLoteDto!);
        //eliminar lote si el nuevo peso es  0 
        if (nuevoPesoLote == 0) {
            const todosInventarios = await this.inventarioLoteRepository.getByLote(loteOrigen.id_lote);
            const stockTotal = todosInventarios.reduce(
                (sum, inv) => sum + Number(inv.cantidad_g), 0
            );

            if (stockTotal === 0) {
                // se elimina el lote pero no el inventario
                await this.loteRepository.deleteLote(loteOrigen.id_lote);
                await this.registrarHistorial({
                    entidad: HistorialEntidad.LOTE,
                    id_entidad: pedido.id_lote!,
                    id_user: id_completado_por,
                    accion: HistorialAccion.DELETE,
                    comentario: `Lote eliminado por consumo total en pedido`,
                    id_pedido: pedido.id_pedido
                })
            }
        }
        // marcar pedido como completado
        return this.pedidoRepository.completarPedido(pedidoId, id_completado_por);
    }

    async tostadoVerdeCompletion(pedidoId: string, id_completado_por: string) {
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId);
        if (!pedido || pedido.estado_pedido !== "Pendiente") {
            throw new Error("Pedido no válido");
        }

        const loteOrigen = await this.loteRepository.getLoteById(pedido.id_lote!);
        if (!loteOrigen) {
            throw new Error("Lote origen no válido");
        }

        // validar stock de verde requerido
        const cantidadVerde = Math.ceil(pedido.cantidad * 1.1765);
        const inventarioLote = await this.inventarioLoteRepository.getByLoteAndAlmacen(
            loteOrigen.id_lote,
            pedido.id_almacen!
        );


        if (!inventarioLote || inventarioLote.cantidad_g < cantidadVerde) {
            throw new Error("Stock insuficiente en el almacén");
        }

        // buscar si ya existe lote destino para el cliente
        const hasLote = await this.verifyIfUserHasLote(
            pedido.id_user,
            loteOrigen.id_lote,
            'Lote Tostado'
        );

        if (!hasLote) {
            // crear nuevo lote destino
            const nuevoLoteDestino = await this.duplicateLoteUseCase.execute(
                loteOrigen,
                pedido,
                true,
                id_completado_por
            );

            await this.inventarioLoteRepository.createInventario({
                id_lote: nuevoLoteDestino.id_lote!,
                id_almacen: pedido.id_almacen!,
                cantidad_g: cantidadVerde,
                cantidad_tostado_g: pedido.cantidad
            });

            await this.registrarMovimiento({
                tipo: TipoMovimiento.DERIVACION,
                entidad: EntidadInventario.LOTE,
                id_entidad_primario: pedido.id_lote!,
                id_entidad_secundario: nuevoLoteDestino.id_lote,
                id_almacen_origen: pedido.id_almacen,
                id_almacen_destino: pedido.id_almacen,
                cantidad: cantidadVerde,
                id_user: id_completado_por,
                id_pedido: pedido.id_pedido,
                comentario: `Derivación por lote tostado en pedido`,
            });

            const [error, updatePedidoDto] = UpdatePedidoDto.update({
                id_nuevoLote: nuevoLoteDestino.id_lote,
            });
            if (error) {
                throw new Error(error);
            }

            await this.pedidoRepository.updatePedido(pedidoId, updatePedidoDto!);

        } else {
            // actualizar lote destino existente
            const inventarioLoteExistente = await this.inventarioLoteRepository.getByLoteAndAlmacen(
                hasLote,
                pedido.id_almacen!
            );
            if (!inventarioLoteExistente) {
                throw new Error("Inventario del lote existente no encontrado");
            }

            const nuevoPesoInventario = inventarioLoteExistente.cantidad_g + cantidadVerde;
            const nuevoTostado = (inventarioLoteExistente.cantidad_tostado_g ?? 0) + pedido.cantidad;
            const [error, updateInventarioLoteExistenteDto] = UpdateInventarioLoteDto.update({
                cantidad_g: nuevoPesoInventario,
                cantidad_tostado_g: nuevoTostado
            });
            if (error) {
                throw new Error(error);
            }

            await this.inventarioLoteRepository.updateInventario(
                inventarioLoteExistente.id_inventario,
                updateInventarioLoteExistenteDto!
            );

            await this.registrarMovimiento({
                tipo: TipoMovimiento.DERIVACION,
                entidad: EntidadInventario.LOTE,
                id_entidad_primario: pedido.id_lote!,
                id_entidad_secundario: hasLote,
                id_almacen_origen: pedido.id_almacen,
                id_almacen_destino: pedido.id_almacen,
                cantidad: cantidadVerde,
                id_user: id_completado_por,
                id_pedido: pedido.id_pedido,
                comentario: `Derivación por lote tostado en pedido`,
            });

            const loteExistente = await this.loteRepository.getLoteById(hasLote);
            if (!loteExistente) {
                throw new Error("Lote existente no encontrado");
            }

            if (loteExistente.eliminado) {
                const [error, updateLoteDto] = UpdateLoteDto.update({ eliminado: false });
                if (error) {
                    throw new Error(`Error al actualizar lote: ${error}`);
                }

                await this.loteRepository.updateLote(loteExistente.id_lote, updateLoteDto!);

                await this.registrarHistorial({
                    entidad: HistorialEntidad.LOTE,
                    accion: HistorialAccion.UPDATE,
                    id_entidad: loteExistente.id_lote,
                    id_user: id_completado_por,
                    id_pedido: pedido.id_pedido,
                    comentario: `Reactivación de lote por pedido`,
                    objeto_antes: { eliminado: true },
                    objeto_despues: { eliminado: false },
                });
            }

            // actualizar pedido
            const [e, updatePedidoDto] = UpdatePedidoDto.update({
                id_lote_destino: loteExistente.id_lote,
            });
            if (e) {
                throw new Error(e);
            }

            await this.pedidoRepository.updatePedido(pedidoId, updatePedidoDto!);

        }

        // descontar verde del lote origen
        const nuevoPesoLote = inventarioLote.cantidad_g - cantidadVerde;
        const [error, updateInventarioLoteDto] = UpdateInventarioLoteDto.update({
            cantidad_g: nuevoPesoLote
        });
        if (error) {
            throw new Error(error);
        }

        await this.inventarioLoteRepository.updateInventario(
            inventarioLote.id_inventario,
            updateInventarioLoteDto!
        );

        // El delete debe evaluar el STOCK TOTAL del lote en todos los almacenes,
        // no solo en el almacén de esta orden puntual — mismo criterio que ya
        // usa AjustarStockAlmacen. Sin esto, un lote con stock en otro almacén
        // se borraba igual solo porque este almacén puntual llegó a 0.
        if (nuevoPesoLote === 0) {
            const todosInventarios = await this.inventarioLoteRepository.getByLote(loteOrigen.id_lote);
            const stockTotal = todosInventarios.reduce(
                (sum, inv) => sum + Number(inv.cantidad_g), 0
            );

            if (stockTotal === 0) {
                await this.loteRepository.deleteLote(loteOrigen.id_lote);
                await this.registrarHistorial({
                    entidad: HistorialEntidad.LOTE,
                    accion: HistorialAccion.DELETE,
                    id_entidad: loteOrigen.id_lote,
                    id_user: id_completado_por,
                    id_pedido: pedido.id_pedido,
                    comentario: `Lote eliminado por consumo total en orden de tueste ${pedido.id_pedido}`,
                });
            }
        }

        return this.pedidoRepository.completarPedido(pedidoId, id_completado_por);
    }

    async ordenTuesteCompletion(pedidoId: string, id_completado_por: string) {
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId);
        if (!pedido || pedido.estado_pedido !== "Pendiente") {
            throw new Error("Pedido no válido");
        }

        if (!pedido.id_lote) {
            throw new Error("El pedido no tiene lote origen");
        }

        if (!pedido.id_almacen) {
            throw new Error("El pedido no tiene almacén");
        }

        const tuestesDelPedido = await this.tuesteRepository.getTostadosByPedido(pedido.id_pedido);
        if (!tuestesDelPedido.length) {
            throw new Error("El pedido no tiene tuestes asociados");
        }

        const todosCompletados = tuestesDelPedido.every(t => t.estado_tueste === "Completado");
        if (!todosCompletados) {
            throw new Error("Aún existen tuestes pendientes");
        }

        const loteOrigen = await this.loteRepository.getLoteById(pedido.id_lote);
        if (!loteOrigen) {
            throw new Error("Lote origen no encontrado");
        }

        const inventarioLote = await this.inventarioLoteRepository.getByLoteAndAlmacen(
            loteOrigen.id_lote,
            pedido.id_almacen
        );
        if (!inventarioLote) {
            throw new Error("Inventario de lote no encontrado");
        }

        const pesoTotalTostado = tuestesDelPedido.reduce(
            (total, t) => total + (t.peso_salida_g ?? 0),
            0
        );

        const nuevoPesoLote = inventarioLote.cantidad_g - pedido.cantidad;

        if (nuevoPesoLote < 0) {
            throw new Error("Inconsistencia: el peso verde quedó negativo al completar la orden de tueste");
        }

        const inventarioPayload: {
            cantidad_g: number;
            // cantidad_tostado_kg?: number;
        } = {
            cantidad_g: nuevoPesoLote
        };

        // if (loteOrigen.tipo_lote === 'Lote Tostado') {
        //     const tostadoActual = inventarioLote.cantidad_tostado_kg ?? 0;
        //     const nuevoPesoLoteTostado = tostadoActual - pesoTotalTostado;

        //     if (nuevoPesoLoteTostado < 0) {
        //         throw new Error("Inconsistencia: el peso tostado quedó negativo al completar la orden de tueste");
        //     }

        //     inventarioPayload.cantidad_tostado_kg = nuevoPesoLoteTostado;
        // }

        const [invError, updateInventarioLoteDto] = UpdateInventarioLoteDto.update(inventarioPayload);
        if (invError || !updateInventarioLoteDto) {
            throw new Error(invError ?? "Error al generar DTO de inventario lote");
        }

        await this.inventarioLoteRepository.updateInventario(
            inventarioLote.id_inventario,
            updateInventarioLoteDto
        );

        await this.registrarMovimiento({
            tipo: TipoMovimiento.SALIDA,
            entidad: EntidadInventario.LOTE,
            id_entidad_primario: loteOrigen.id_lote,
            cantidad: pedido.cantidad,
            id_user: id_completado_por,
            id_almacen_origen: pedido.id_almacen,
            id_pedido: pedido.id_pedido,
            comentario: `Consumo de ${pedido.cantidad} kg por orden de tueste ${pedido.id_pedido}`,
        });



        // El delete debe evaluar el STOCK TOTAL del lote en todos los almacenes,
        // no solo en el almacén de esta orden puntual — mismo criterio que ya
        // usa AjustarStockAlmacen. Sin esto, un lote con stock en otro almacén
        // se borraba igual solo porque este almacén puntual llegó a 0.
        if (nuevoPesoLote === 0) {
            const todosInventarios = await this.inventarioLoteRepository.getByLote(loteOrigen.id_lote);
            const stockTotal = todosInventarios.reduce(
                (sum, inv) => sum + Number(inv.cantidad_g), 0
            );

            if (stockTotal === 0) {
                await this.loteRepository.deleteLote(loteOrigen.id_lote);
                await this.registrarHistorial({
                    entidad: HistorialEntidad.LOTE,
                    accion: HistorialAccion.DELETE,
                    id_entidad: loteOrigen.id_lote,
                    id_user: id_completado_por,
                    id_pedido: pedido.id_pedido,
                    comentario: `Lote eliminado por consumo total en orden de tueste ${pedido.id_pedido}`,
                });
            }
        }

        const [createLoteTostadoError, createLoteTostadoDto] = CreateLoteTostadoDto.create({
            id_lote: loteOrigen.id_lote,
            fecha_tostado: new Date(),
            peso_g: pesoTotalTostado,
            perfil_tostado: pedido.comentario,
            id_user: pedido.id_user
        });

        if (createLoteTostadoError || !createLoteTostadoDto) {
            throw new Error(createLoteTostadoError ?? "Error generando DTO de lote tostado");
        }

        const loteTostado = await this.createLoteTostado.execute(createLoteTostadoDto);

        await this.inventarioLoteTostadoRepository.createInventario({
            id_lote_tostado: loteTostado.id_lote_tostado,
            id_almacen: pedido.id_almacen,
            cantidad_g: pesoTotalTostado,
        });

        await this.registrarHistorial({
            entidad: HistorialEntidad.LOTE_TOSTADO,
            accion: HistorialAccion.CREATE,
            id_entidad: loteTostado.id_lote_tostado,
            id_user: id_completado_por,
            id_pedido: pedido.id_pedido,
            comentario: `Creación de lote tostado por orden de tueste`,
        });


        const [updateTuesteError, updateTuesteDto] = UpdateTuesteDto.update({
            id_lote_tostado: loteTostado.id_lote_tostado,
        });
        if (updateTuesteError || !updateTuesteDto) {
            throw new Error(updateTuesteError ?? "Error al generar DTO de tueste");
        }

        for (const tueste of tuestesDelPedido) {
            await this.tuesteRepository.updateTueste(tueste.id_tueste, updateTuesteDto);
        }

        const [updatePedidoError, updatePedidoDto] = UpdatePedidoDto.update({
            id_nuevoLote_tostado: loteTostado.id_lote_tostado,
        });
        if (updatePedidoError || !updatePedidoDto) {
            throw new Error(updatePedidoError ?? "Error al generar DTO de pedido");
        }

        await this.pedidoRepository.updatePedido(pedido.id_pedido, updatePedidoDto);

        return this.pedidoRepository.completarPedido(pedido.id_pedido, id_completado_por);
    }

    async maquilaCompletion(pedidoId: string, id_completado_por: string) {

        // 1. Validar que el pedido existe y está Pendiente
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId);
        if (!pedido || pedido.estado_pedido !== "Pendiente")
            throw new Error("Pedido no válido o ya completado");

        // 2. Leer las PedidoBolsas guardadas al crear el pedido
        //    Estas contienen las combinaciones de gramaje/molienda/cantidad definidas por el cliente
        const pedidoBolsas = await this.pedidoBolsaRepository.getByPedido(pedidoId);
        if (!pedidoBolsas || pedidoBolsas.length === 0)
            throw new Error('El pedido no tiene combinaciones de bolsas definidas');

        // 3. Re-validar que la suma de unidades sigue coincidiendo con Pedido.cantidad
        //    Por si alguien editó las PedidoBolsas después de crear el pedido
        const totalUnidades = pedidoBolsas.reduce((acc, b) => acc + b.cantidad, 0);
        if (totalUnidades !== pedido.cantidad) {
            throw new Error(`La suma de bolsas (${totalUnidades}) no coincide con la cantidad del pedido (${pedido.cantidad})`);
        }

        // 4. Calcular total en gramos que se necesita del inventario
        //    gramaje viene en gramos, cantidad_g en inventario también está en gramos
        //    → multiplicar directamente, sin conversión
        const totalSolicitadoGr = pedidoBolsas.reduce(
            (acc, b) => acc + b.gramaje * b.cantidad, 0
        );

        // 5. Validar que el lote tostado sigue existiendo
        const loteTostado = await this.loteTostadoRepository.getLoteTostadoById(pedido.id_lote_tostado!);
        if (!loteTostado || loteTostado.eliminado) throw new Error('Lote tostado no válido');

        // 6. Re-validar stock en el inventario del lote tostado
        //    Puede haber bajado desde que se creó el pedido
        const inventarioLoteTostado = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
            loteTostado.id_lote_tostado,
            pedido.id_almacen!
        );
        if (!inventarioLoteTostado)
            throw new Error('No se encontró inventario del lote tostado en el almacén');
        if (inventarioLoteTostado.cantidad_g < totalSolicitadoGr) {
            throw new Error(`Stock insuficiente. Se necesitan ${totalSolicitadoGr}gr, solo hay ${inventarioLoteTostado.cantidad_g}gr`);
        }

        // 7. Descontar los gramos consumidos del inventario del lote tostado
        const nuevoPesoLoteTostado = inventarioLoteTostado.cantidad_g - totalSolicitadoGr;
        const [, updateInvDto] = UpdateInventarioLoteTostadoDto.update({ cantidad_g: nuevoPesoLoteTostado });
        await this.inventarioLoteTostadoRepository.updateInventario(
            inventarioLoteTostado.id_inventario,
            updateInvDto!
        );

        // 8. Si quedó en 0, eliminar el lote tostado (sin stock ya no tiene sentido mantenerlo)
        if (nuevoPesoLoteTostado === 0) {
            await this.loteTostadoRepository.deleteLoteTostado(loteTostado.id_lote_tostado);
        }

        // 9. Registrar la salida del lote tostado en MovimientoAlmacen
        await this.registrarMovimiento({
            tipo: TipoMovimiento.SALIDA,
            entidad: EntidadInventario.LOTE_TOSTADO,
            id_entidad_primario: loteTostado.id_lote_tostado,
            id_almacen_origen: pedido.id_almacen,
            cantidad: totalSolicitadoGr,
            id_user: id_completado_por,
            id_pedido: pedido.id_pedido,
            comentario: `Consumo de ${totalSolicitadoGr}gr por maquila — ${pedidoBolsas.length} combinación(es) de bolsas`,
        });

        // 10. Por cada combinación crear Bolsa + InventarioBolsa
        for (const item of pedidoBolsas) {

            // 10a. Generar id correlativo por lote tostado + combinación gramaje/molienda
            //      Formato: {id_lote_tostado}-BO-{gramaje}-{molienda_abrev}-{secuencial 2 dígitos}
            const abrev = getMoliendaAbrev(item.molienda);
            const count = await this.bolsaRepository.countBolsasByLoteTostadoGramajeMolienda(
                loteTostado.id_lote_tostado,
                item.gramaje,
                item.molienda
            );
            const siguiente = (count + 1).toString().padStart(2, '0');
            const id_bolsa = `${loteTostado.id_lote_tostado}-BO-${item.gramaje}-${abrev}-${siguiente}`;

            // 10b. Crear la Bolsa — hecho histórico de producción (inmutable una vez creado)
            const [errBolsa, createBolsaDto] = CreateBolsaDto.create({
                id_lote_tostado: loteTostado.id_lote_tostado,
                id_pedido: pedido.id_pedido,
                gramaje: item.gramaje,
                molienda: item.molienda,
                cantidad: item.cantidad,
                owned_by_store: pedido.owned_by_store,
                id_user: pedido.owned_by_store ? undefined : pedido.id_user,
                id_almacen: pedido.id_almacen,
            });
            if (errBolsa || !createBolsaDto) throw new Error(errBolsa ?? 'Error al crear DTO de bolsa');

            const bolsa = await this.bolsaRepository.createBolsa(id_bolsa, createBolsaDto);

            // 10c. Crear InventarioBolsa — stock inicial igual a la cantidad producida
            //      Nada se ha vendido ni enviado aún, entra todo al almacén del pedido
            const [errInv, createInvDto] = CreateInventarioBolsaDto.create({
                id_bolsa: bolsa.id_bolsa,
                id_almacen: pedido.id_almacen!,
                cantidad: item.cantidad,
            });
            if (errInv || !createInvDto) throw new Error(errInv ?? 'Error al crear DTO de inventario bolsa');

            await this.inventarioBolsaRepository.createInventario(createInvDto);

            // 10d. Registrar ingreso de esta bolsa en MovimientoAlmacen
            await this.registrarMovimiento({
                tipo: TipoMovimiento.INGRESO,
                entidad: EntidadInventario.BOLSA,
                id_entidad_primario: bolsa.id_bolsa,
                id_almacen_destino: pedido.id_almacen,
                cantidad: item.cantidad,
                id_user: id_completado_por,
                id_pedido: pedido.id_pedido,
                comentario: `Ingreso ${item.cantidad} bolsas de ${item.gramaje}gr (${item.molienda})`,
            });

            // 10e. Registrar en Historial la creación de esta bolsa
            await this.registrarHistorial({
                entidad: HistorialEntidad.BOLSA,
                accion: HistorialAccion.CREATE,
                id_entidad: bolsa.id_bolsa,
                id_user: id_completado_por,
                id_pedido: pedido.id_pedido,
                comentario: `Bolsa creada por maquila: ${item.cantidad} uds x ${item.gramaje}gr (${item.molienda})`,
            });
        }

        // 11. Marcar pedido como Completado
        return this.pedidoRepository.completarPedido(pedidoId, id_completado_por);
    }

    async ordenDespachoCompletion(pedidoId: string, id_completado_por: string) {
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId);
        if (!pedido || pedido.estado_pedido !== "Pendiente")
            throw new Error("Pedido no válido o ya completado");

        if (!pedido.id_almacen) throw new Error('El pedido no tiene almacén asociado');

        const pedidoItems = await this.pedidoItemRepository.getByPedido(pedidoId);
        if (!pedidoItems || pedidoItems.length === 0)
            throw new Error('El pedido no tiene artículos definidos');

        for (const item of pedidoItems) {
            const disponible = await this.inventarioGenericoRepository.obtenerStockDisponible({
                entidad: item.entidad,
                id_entidad: item.id_entidad,
                id_almacen: pedido.id_almacen,
                cantidad: item.cantidad,
            });
            if (disponible < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.entidad} ${item.id_entidad}: disponible ${disponible}, requerido ${item.cantidad}`);
            }
        }

        const [errPaq, paqueteDto] = CreatePaqueteDto.create({
            id_cliente: pedido.id_user,
            creado_por_id: id_completado_por,
            id_pedido_origen: pedido.id_pedido,
        });
        if (errPaq || !paqueteDto) throw new Error(errPaq ?? 'Error al crear DTO de paquete');

        // Regla de negocio: correlativo tipo PAQ-000001, mismo patrón que ENV-000001 en CrearEnvio.
        const totalPaquetes = await this.paqueteRepository.countTotal();
        const numero_correlativo = `PAQ-${(totalPaquetes + 1).toString().padStart(6, '0')}`;

        const paquete = await this.paqueteRepository.create(paqueteDto, numero_correlativo);

        for (const item of pedidoItems) {
            const [errItem, itemDto] = CreatePaqueteItemDto.create({
                id_paquete: paquete.id_paquete,
                entidad: item.entidad,
                id_entidad: item.id_entidad,
                id_almacen: pedido.id_almacen,
                cantidad: item.cantidad,
                unidad_medida: getUnidadMedidaDefault(item.entidad),
            });
            if (errItem || !itemDto) throw new Error(errItem ?? 'Error al crear DTO de artículo de paquete');
            await this.paqueteItemRepository.create(itemDto);
        }

        await this.registrarHistorial({
            entidad: HistorialEntidad.PAQUETE,
            accion: HistorialAccion.CREATE,
            id_entidad: paquete.id_paquete,
            id_user: id_completado_por,
            id_pedido: pedido.id_pedido,
            comentario: `Paquete generado a partir de la Orden de Despacho ${pedido.id_pedido}`,
        });

        return this.pedidoRepository.completarPedido(pedidoId, id_completado_por);
    }

    async verifyIfUserHasLote(id_user: string | undefined, id_lote_origen: string, tipo_lote: string): Promise<string | null> {
       
        if (!id_user) return null;

        const lotes = await this.loteRepository.getLotesByUserId(id_user,true);
       
        const loteRelacionado = lotes.find(
            l => l.id_lote.includes(id_lote_origen) && l.tipo_lote === tipo_lote
        );



        return loteRelacionado?.id_lote ?? null;
    }

    private async registrarMovimiento(data: {
        tipo: TipoMovimiento;
        entidad: EntidadInventario;
        id_entidad_primario: string;
        id_entidad_secundario?: string;
        cantidad: number;
        id_user: string;
        id_almacen_origen?: string;
        id_almacen_destino?: string;
        comentario?: string;
        id_pedido?: string,
    }) {
        const [error, dto] = CreateMovimientoAlmacenDto.create(data);
        if (error || !dto) throw new Error(error ?? 'Error al crear movimiento');
        await this.movimientoAlmacenRepository.createMovimiento(dto);
    }

    private async registrarHistorial(data: {
        entidad: HistorialEntidad;
        id_entidad: string;
        id_user: string;
        accion: HistorialAccion;
        comentario?: string;
        objeto_antes?: unknown | null;
        objeto_despues?: unknown | null;
        id_pedido?: string,
    }) {
        const [error, dto] = CreateHistorialDto.create(data);
        if (error || !dto) throw new Error(error ?? 'Error al crear historial');
        await this.historialRepository.createHistorial(dto);
    }
}
