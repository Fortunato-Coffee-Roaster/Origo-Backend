import { UpdatePedidoDto } from "../../dtos/pedido/update";
import { PedidoEntity } from "../../entities/pedido.entity";
import { LoteRepository } from "../../repository/lote.repository";
import { PedidoRepository } from "../../repository/pedido.repository";
import { TuesteRepository } from "../../repository/tueste.repository";
import { UserRepository } from "../../repository/user.repository";
import { CreateTuesteDto } from "../../dtos/tueste/create";
import { AnalisisRepository } from "../../repository/analisis.repository";
import { AnalisisFisicoRepository } from "../../repository/analisisFisico.repository";
import { AnalisisFisicoEntity } from "../../entities/analisisFisico.entity";
import { LoteTostadoRepository } from "../../repository/loteTostado.repository";
import { InventarioLoteRepository } from '../../repository/inventario-lote.repository';
import { InventarioLoteTostadoRepository } from "../../repository/inventario-lote-tostado.repository";
import { PedidoBolsaRepository } from "../../repository/pedido-bolsa.repository";
import { PedidoItemRepository } from "../../repository/pedido-item.repository";
import { InventarioGenericoRepository } from "../../repository/inventario-generico.repository";

export interface UpdatePedidoUseCase {
  execute(id_pedido: string, updateDto: UpdatePedidoDto): Promise<PedidoEntity>;
}

export class UpdatePedido implements UpdatePedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly loteRepository: LoteRepository,
    private readonly loteTostadoRepository: LoteTostadoRepository,
    private readonly tuesteRepository: TuesteRepository,
    private readonly userRepository: UserRepository,
    private readonly analisisRepository: AnalisisRepository,
    private readonly analisisFisicoRepository: AnalisisFisicoRepository,
    private readonly inventarioLoteRepository: InventarioLoteRepository,
    private readonly inventarioLoteTostadoRepository: InventarioLoteTostadoRepository,
    private readonly pedidoBolsaRepository: PedidoBolsaRepository,
    private readonly pedidoItemRepository: PedidoItemRepository,
    private readonly inventarioGenericoRepository: InventarioGenericoRepository,

  ) { }


  async execute(id_pedido: string, updateDto: UpdatePedidoDto): Promise<PedidoEntity> {
    const pedido = await this.pedidoRepository.getPedidoById(id_pedido);
    if (!pedido || pedido.eliminado) throw new Error('El pedido no existe o fue eliminado');
    if (pedido.estado_pedido === 'Completado') throw new Error('No se puede modificar un pedido completado');


    if (pedido.tipo_pedido === 'Venta Verde') {

      return this.actualizarVentaVerde(pedido, updateDto);
    }

    if (pedido.tipo_pedido === 'Tostado Verde') {

      return this.actualizarTostadoVerde(pedido, updateDto);
    }

    if (pedido.tipo_pedido === 'Orden Tueste') {
      return this.editarOrdenTueste(pedido, updateDto);
    }

    if (pedido.tipo_pedido === 'Maquila') {
      return this.editarMaquila(pedido, updateDto);
    }

    if (pedido.tipo_pedido === 'OrdenDespacho') {
      return this.editarOrdenDespacho(pedido, updateDto);
    }

    throw new Error('Tipo de pedido inválido');
  }

  private async actualizarVentaVerde(pedido: PedidoEntity, dto: UpdatePedidoDto): Promise<PedidoEntity> {
    const idAlmacen = dto.id_almacen ?? pedido.id_almacen;
    if (!idAlmacen) throw new Error('El pedido no tiene almacén');

    const idLote = dto.id_lote ?? pedido.id_lote;
    if (!idLote) throw new Error('El pedido no tiene lote');

    const inventario = await this.inventarioLoteRepository.getByLoteAndAlmacen(idLote, idAlmacen);
    if (!inventario) throw new Error('Inventario del lote no encontrado');

    const nuevaCantidad = dto.cantidad ?? pedido.cantidad;

    if (inventario.cantidad_g < nuevaCantidad) {
      throw new Error('No hay suficiente cantidad disponible en el lote original');
    }

    const pedidoActualizado = await this.pedidoRepository.updatePedido(pedido.id_pedido, dto);
    return PedidoEntity.fromObject(pedidoActualizado!);
  }

  private async actualizarTostadoVerde(pedido: PedidoEntity, dto: UpdatePedidoDto): Promise<PedidoEntity> {
    const idAlmacen = dto.id_almacen ?? pedido.id_almacen;
    if (!idAlmacen) throw new Error('El pedido no tiene almacén');

    const idLote = dto.id_lote ?? pedido.id_lote;
    if (!idLote) throw new Error('El pedido no tiene lote');

    const inventario = await this.inventarioLoteRepository.getByLoteAndAlmacen(idLote, idAlmacen);
    if (!inventario) throw new Error('Inventario del lote no encontrado');

    const nuevaCantidad = dto.cantidad ?? pedido.cantidad;
    const cantidadVerdeNecesaria = Math.ceil(nuevaCantidad * 1.1765);

    if (inventario.cantidad_g < cantidadVerdeNecesaria) {
      throw new Error('No hay suficiente cantidad verde disponible en el lote original');
    }

    const pedidoActualizado = await this.pedidoRepository.updatePedido(pedido.id_pedido, dto);
    return PedidoEntity.fromObject(pedidoActualizado!);
  }

  async editarOrdenTueste(pedido: PedidoEntity, dto: UpdatePedidoDto): Promise<PedidoEntity> {
    const idLote = dto.id_lote ?? pedido.id_lote;
    if (!idLote) throw new Error('Lote original no encontrado');

    const lote = await this.loteRepository.getLoteById(idLote);
    if (!lote) throw new Error('Lote original no encontrado');

    const idAlmacen = dto.id_almacen ?? pedido.id_almacen;
    if (!idAlmacen) throw new Error('El pedido no tiene almacén');

    const inventario = await this.inventarioLoteRepository.getByLoteAndAlmacen(idLote, idAlmacen);
    if (!inventario) throw new Error('Inventario del lote no encontrado');

    const nuevaCantidad = dto.cantidad ?? pedido.cantidad;

    if (inventario.cantidad_g < nuevaCantidad) {
      throw new Error('No hay suficiente café verde disponible en el lote original');
    }

    // if (lote.tipo_lote === 'Lote Tostado') {
    //   const tostadoDisponible = inventario.cantidad_tostado_kg ?? 0;
    //   if (tostadoDisponible < nuevaCantidad) {
    //     throw new Error('No hay suficiente cantidad tostada disponible en el lote');
    //   }
    // }

    const pedidoActualizado = await this.pedidoRepository.updatePedido(pedido.id_pedido, dto);

    const tuestes = await this.tuesteRepository.getTostadosByPedido(pedido.id_pedido);
    let debeRecrearTuestes = false;

    if (!tuestes || tuestes.length === 0) {
      debeRecrearTuestes = true;
    } else if (!dto.pesos_g) {
      debeRecrearTuestes = false;
    } else if (tuestes.length !== dto.pesos_g.length) {
      debeRecrearTuestes = true;
    } else {
      const pesosActuales = tuestes.map(t => t.peso_entrada_g);
      for (let i = 0; i < pesosActuales.length; i++) {
        if (pesosActuales[i] !== dto.pesos_g[i]) {
          debeRecrearTuestes = true;
          break;
        }
      }
    }

    if (debeRecrearTuestes) {
      for (const tueste of tuestes ?? []) {
        await this.tuesteRepository.deleteTueste(tueste.id_tueste);
      }

      let analisisFisico: AnalisisFisicoEntity | null = null;

      if (lote.id_analisis) {
        const analisis = await this.analisisRepository.getAnalisisById(lote.id_analisis);
        if (analisis) {
          analisisFisico = await this.analisisFisicoRepository
            .getAnalisisFisicoById(analisis.analisisFisico_id!);
        }
      }

      if (!dto.pesos_g) throw new Error('Los pesos son requeridos');

      const density = analisisFisico?.densidad ?? 0;
      const humidity = analisisFisico?.humedad ?? 0;

      let cant = 1;
      for (const peso of dto.pesos_g) {
        const [error, createTuesteDto] = CreateTuesteDto.create({
          id_lote: lote.id_lote,
          num_batch: cant,
          fecha_tueste: dto.fecha_tueste ?? pedido.fecha_tueste,
          tostadora: dto.tostadora ?? pedido.tostadora,
          id_cliente: dto.id_user ?? pedido.id_user,
          owned_by_store: pedido.owned_by_store,
          densidad: density,
          humedad: humidity,
          peso_entrada_g: peso,
          id_pedido: pedido.id_pedido,
        });

        if (error || !createTuesteDto) {
          throw new Error(error ?? 'Error al crear DTO de tueste');
        }

        await this.tuesteRepository.createTueste(createTuesteDto);
        cant++;
      }
    }

    return PedidoEntity.fromObject(pedidoActualizado!);
  }

  async editarMaquila(pedido: PedidoEntity, dto: UpdatePedidoDto): Promise<PedidoEntity> {

    // 1. Validar lote tostado (puede venir uno nuevo en el DTO o usar el actual)
    const idLoteTostado = pedido.id_lote_tostado;
    if (!idLoteTostado) throw new Error('El pedido de maquila no tiene lote tostado de origen');

    const loteTostado = await this.loteTostadoRepository.getLoteTostadoById(idLoteTostado);
    if (!loteTostado || loteTostado.eliminado) throw new Error('Lote tostado no válido o eliminado');

    // 2. Validar cantidad
    const nuevaCantidad = dto.cantidad ?? pedido.cantidad;
    if (nuevaCantidad <= 0) throw new Error('La cantidad de bolsas debe ser mayor a 0');

    // 3. Leer PedidoBolsas actuales para calcular el stock real que se necesita
    const pedidoBolsas = await this.pedidoBolsaRepository.getByPedido(pedido.id_pedido);
    if (!pedidoBolsas || pedidoBolsas.length === 0)
      throw new Error('El pedido no tiene combinaciones de bolsas definidas');

    // 4. Validar que la nueva cantidad coincida con la suma de PedidoBolsas
    const totalUnidades = pedidoBolsas.reduce((acc, b) => acc + b.cantidad, 0);
    if (nuevaCantidad !== totalUnidades) {
      throw new Error(
        `La cantidad del pedido (${nuevaCantidad}) no coincide con la suma de bolsas definidas (${totalUnidades}). ` +
        `Edita primero las combinaciones de bolsas en /pedido-bolsa/pedido/${pedido.id_pedido}`
      );
    }

    // 5. Calcular total en gramos que se necesita del inventario
    const totalSolicitadoGr = pedidoBolsas.reduce(
      (acc, b) => acc + b.gramaje * b.cantidad, 0
    );

    // 6. Validar stock en el almacén (puede haber cambiado en el DTO)
    const idAlmacen = dto.id_almacen ?? pedido.id_almacen;
    if (!idAlmacen) throw new Error('El pedido no tiene almacén');

    const inventarioLoteTostado = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
      loteTostado.id_lote_tostado,
      idAlmacen
    );
    if (!inventarioLoteTostado)
      throw new Error('No se encontró inventario para el lote tostado en el almacén');
    if (inventarioLoteTostado.cantidad_g < totalSolicitadoGr) {
      throw new Error(
        `Stock insuficiente. Se necesitan ${totalSolicitadoGr}gr, ` +
        `solo hay ${inventarioLoteTostado.cantidad_g}gr disponibles`
      );
    }

    // 7. Actualizar pedido
    const pedidoActualizado = await this.pedidoRepository.updatePedido(pedido.id_pedido, dto);
    return PedidoEntity.fromObject(pedidoActualizado!);
  }


  async editarOrdenDespacho(pedido: PedidoEntity, dto: UpdatePedidoDto): Promise<PedidoEntity> {
    const idAlmacen = dto.id_almacen ?? pedido.id_almacen;
    if (!idAlmacen) throw new Error('El almacén es requerido para una Orden de Despacho');

    if (dto.id_almacen && dto.id_almacen !== pedido.id_almacen) {
      const items = await this.pedidoItemRepository.getByPedido(pedido.id_pedido);

      for (const item of items) {
        const disponible = await this.inventarioGenericoRepository.obtenerStockDisponible({
          entidad: item.entidad,
          id_entidad: item.id_entidad,
          id_almacen: idAlmacen,
          cantidad: item.cantidad,
        });
        if (disponible < item.cantidad) {
          throw new Error(`Stock insuficiente para ${item.entidad} ${item.id_entidad} en el nuevo almacén`);
        }
      }
    }

    const pedidoActualizado = await this.pedidoRepository.updatePedido(pedido.id_pedido, dto);
    return PedidoEntity.fromObject(pedidoActualizado!);
  }


}
