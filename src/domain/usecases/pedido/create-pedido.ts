import { UpdateLoteDto } from "../../dtos/lotes/lote/update";
import { CreatePedidoDto } from "../../dtos/pedido/create";
import { CreateTuesteDto } from "../../dtos/tueste/create";
import { PedidoEntity } from "../../entities/pedido.entity";
import { LoteRepository } from "../../repository/lote.repository";
import { PedidoRepository } from "../../repository/pedido.repository";
import { TuesteRepository } from "../../repository/tueste.repository";
import { UserRepository } from "../../repository/user.repository";
import { AnalisisRepository } from '../../repository/analisis.repository';
import { AnalisisFisicoRepository } from '../../repository/analisisFisico.repository';
import { AnalisisFisicoEntity } from '../../entities/analisisFisico.entity';
import { LoteTostadoRepository } from "../../repository/loteTostado.repository";
import { UpdateUserDto } from "../../dtos/user/update";
import { InventarioLoteRepository } from "../../repository/inventario-lote.repository";
import { InventarioLoteTostadoRepository } from "../../repository/inventario-lote-tostado.repository";
import { CreatePedidoBolsaDto } from "../../dtos/pedido-bolsa/create";
import { PedidoBolsaRepository } from "../../repository/pedido-bolsa.repository";
import { BolsaItemDto, CreateMaquilaDto } from "../../dtos/pedido/create-maquila";
import { CreatePedidoItemDto } from "../../dtos/pedido-item/create";
import { PedidoItemRepository } from "../../repository/pedido-item.repository";
import { InventarioGenericoRepository } from "../../repository/inventario-generico.repository";
import { CreateOrdenDespachoDto, PedidoItemInputDto } from "../../dtos/pedido/create-orden-despacho";

export interface CreatePedidoUseCase {
    execute(createPedidoDto: CreatePedidoDto, id_completado_por: string, bolsas?: BolsaItemDto[], items?: PedidoItemInputDto[]): Promise<PedidoEntity>;
}

export class CreatePedido implements CreatePedidoUseCase {
    constructor(
        private readonly pedidoRepository: PedidoRepository,
        private readonly loteRepository: LoteRepository,
        private readonly inventarioLoteRepository: InventarioLoteRepository,
        private readonly loteTostadoRepository: LoteTostadoRepository,
        private readonly inventarioLoteTostadoRepository: InventarioLoteTostadoRepository,
        private readonly clienteRepository: UserRepository,
        private readonly tuesteRepository: TuesteRepository,
        private readonly analisisRepository: AnalisisRepository,
        private readonly analisisFisicoRepository: AnalisisFisicoRepository,
        private readonly pedidoBolsaRepository: PedidoBolsaRepository,
        private readonly pedidoItemRepository: PedidoItemRepository,
        private readonly inventarioGenericoRepository: InventarioGenericoRepository,

    ) { }

    async execute(dto: CreatePedidoDto, id_completado_por: string, bolsas?: BolsaItemDto[], items?: PedidoItemInputDto[]): Promise<PedidoEntity> {

        switch (dto.tipo_pedido) {
            case 'Venta Verde':
                return this.ventaVerdeValidations(dto);
            case 'Tostado Verde':
                return this.tostadoVerdeValidations(dto);
            case 'Orden Tueste':
                return this.ordenTueste(dto);
            case 'Maquila':
                const [errMaquila, maquilaDto] = CreateMaquilaDto.create({ ...dto, bolsas });
                if (errMaquila || !maquilaDto) throw new Error(errMaquila ?? 'Error al crear DTO de maquila');
                return this.maquilaValidations(maquilaDto);
            case 'Suscripcion':
                return this.suscripcionValidations(dto, id_completado_por);
            case 'OrdenDespacho':
                const [errOD, ordenDespachoDto] = CreateOrdenDespachoDto.create({ ...dto, items });
                if (errOD || !ordenDespachoDto) throw new Error(errOD ?? 'Error al crear DTO de orden de despacho');
                return this.ordenDespachoValidations(ordenDespachoDto);
            default:
                throw new Error('Tipo de pedido inválido');
        }
    }

    async ventaVerdeValidations(dto: CreatePedidoDto): Promise<PedidoEntity> {
        const lote = await this.loteRepository.getLoteById(dto.id_lote!);
        if (!lote || lote.eliminado) throw new Error("Lote no válido");

        // verificar que el lote tenga un inventario
        // verificar que el lote tenga suficiente peso para la cantidad solicitada en su almacen correspondiente
        const inventarioLote = await this.inventarioLoteRepository.getByLoteAndAlmacen(lote.id_lote, dto.id_almacen!);
        if (!inventarioLote || inventarioLote.cantidad_g < dto.cantidad) {
            throw new Error("Stock insuficiente en el almacén");
        }


        const cliente = await this.clienteRepository.getUserById(dto.id_user!);
        if (!cliente || cliente.eliminado) throw new Error("Cliente no válido");

        return this.pedidoRepository.createPedido(dto);

    }

    async tostadoVerdeValidations(dto: CreatePedidoDto): Promise<PedidoEntity> {
        const lote = await this.loteRepository.getLoteById(dto.id_lote!);
        if (!lote || lote.eliminado) throw new Error("Lote no válido");


        // verificar que el lote tenga suficiente peso para la cantidad solicitada en su almacen correspondiente
        const cantidadVerde = dto.cantidad * 1.1765;
        const inventarioLote = await this.inventarioLoteRepository.getByLoteAndAlmacen(lote.id_lote, dto.id_almacen!);
        if (!inventarioLote || inventarioLote.cantidad_g < cantidadVerde) {
            throw new Error("Stock insuficiente en el almacén");
        }

        const cliente = await this.clienteRepository.getUserById(dto.id_user!);
        if (!cliente || cliente.eliminado) throw new Error("Cliente no válido");

        return this.pedidoRepository.createPedido(dto);
    }

    async ordenTueste(dto: CreatePedidoDto): Promise<PedidoEntity> {

        // 1. Validar cliente — solo si el pedido NO es de tienda
        if (!dto.owned_by_store) {
            const user = await this.clienteRepository.getUserById(dto.id_user!);
            if (!user || user.eliminado) {
                throw new Error('El cliente no existe o está eliminado');
            }
        }

        // 2. Validar lote
        if (!dto.id_lote) {
            throw new Error('El id_lote es requerido para una orden de tueste');
        }


        const lote = await this.loteRepository.getLoteById(dto.id_lote);
        if (!lote || lote.eliminado) {
            throw new Error('Lote no válido');
        }


        // 3. Validar almacén e inventario disponible
        if (!dto.id_almacen) {
            throw new Error('El id_almacen es requerido para una orden de tueste');
        }


        const inventarioLote = await this.inventarioLoteRepository.getByLoteAndAlmacen(
            lote.id_lote,
            dto.id_almacen
        );


        if (!inventarioLote) {
            throw new Error('No se encontró el inventario para el lote y almacén especificados');
        }


        const factor = 1.1765;

        // validar verde
        if (inventarioLote.cantidad_g < dto.cantidad) {
            throw new Error('No hay suficiente café verde disponible');
        }


        // // calcular tostado equivalente
        // const cantidadTostado = dto.cantidad / factor;


        // // // validar tostado
        // // if (lote.tipo_lote === 'Lote Tostado') {

        // //     if (inventarioLote.cantidad_tostado_kg == null || inventarioLote.cantidad_tostado_kg < cantidadTostado) {
        // //         throw new Error('No hay suficiente café tostado disponible');
        // //     }

        // //     const tostadoDisponible = inventarioLote.cantidad_tostado_kg ?? 0;

        // //     if (tostadoDisponible < dto.cantidad) {
        // //         throw new Error('No hay suficiente cantidad tostada en el lote');
        // //     }
        // // }



        // 4. Obtener análisis físico si existe
        let analisisFisico: AnalisisFisicoEntity | null = null;


        if (!lote.id_analisis) {
            console.warn('El lote no tiene un análisis asociado, usando valores por defecto');

        } else {
            const analisis = await this.analisisRepository.getAnalisisById(lote.id_analisis);

            if (!analisis) {
                console.warn(`No se encontró el análisis ${lote.id_analisis}, usando valores por defecto`);
            } else {
                // ✅ Guard: solo buscar si analisisFisico_id existe
                if (!analisis.analisisFisico_id) {
                    console.warn('El análisis no tiene un análisis físico asociado, usando valores por defecto');
                } else {
                    analisisFisico = await this.analisisFisicoRepository.getAnalisisFisicoById(
                        analisis.analisisFisico_id  // sin el ! ahora es seguro
                    );

                    if (!analisisFisico) {
                        console.warn(`No se encontró el análisis físico ${analisis.analisisFisico_id}`);
                    }

                }
            }
        }

        // 5. Crear pedido
        const pedido = await this.pedidoRepository.createPedido(dto);

        // 6. Generar tuestes
        if (!dto.pesos_g || dto.pesos_g.length === 0) {
            throw new Error('Los pesos son requeridos');
        }

        const density = analisisFisico?.densidad ?? 0;
        const humidity = analisisFisico?.humedad ?? 0;

        let cant = 1;
        for (const peso of dto.pesos_g) {

            const tuestePayload = {
                id_lote: lote.id_lote,
                num_batch: cant,
                fecha_tueste: dto.fecha_tueste,
                tostadora: dto.tostadora,
                id_cliente: dto.id_user,
                owned_by_store: dto.owned_by_store,
                densidad: density,
                humedad: humidity,
                peso_entrada_g: peso,
                id_pedido: pedido.id_pedido,
            };

            const [error, createTuesteDto] = CreateTuesteDto.create(tuestePayload);

            if (error || !createTuesteDto) {
                throw new Error(error ?? 'Error al crear DTO de tueste');
            }

            await this.tuesteRepository.createTueste(createTuesteDto);
            cant++;
        }

        return PedidoEntity.fromObject(pedido);
    }

    async maquilaValidations(dto: CreateMaquilaDto): Promise<PedidoEntity> {

        // 1. Validar cliente — solo si el pedido NO es de tienda
        if (!dto.pedido.owned_by_store) {
            const cliente = await this.clienteRepository.getUserById(dto.pedido.id_user!);
            if (!cliente || cliente.eliminado) throw new Error("Cliente no válido");
        }

        // 2. Validar lote tostado
        const loteTostado = await this.loteTostadoRepository.getLoteTostadoById(dto.pedido.id_lote_tostado!);
        if (!loteTostado || loteTostado.eliminado) throw new Error("Lote tostado no válido o eliminado");

        // 3. Validar cantidad total de bolsas
        const totalSolicitadoGr = dto.bolsas.reduce(
            (acc, b) => acc + b.gramaje * b.cantidad, 0
        );

        // 4. Verificar stock
        const inventarioLoteTostado = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
            loteTostado.id_lote_tostado,
            dto.pedido.id_almacen!
        );
        if (!inventarioLoteTostado) throw new Error('No se encontró el inventario para el lote tostado y almacén especificados');
        if (inventarioLoteTostado.cantidad_g < totalSolicitadoGr) {
            throw new Error(`Stock insuficiente. Se necesitan ${totalSolicitadoGr}gr, solo hay ${inventarioLoteTostado.cantidad_g}gr`);
        }

        // 5. Crear pedido — ahora dto.pedido es el CreatePedidoDto limpio, sin bolsas
        const pedido = await this.pedidoRepository.createPedido(dto.pedido);

        // 6. Guardar las combinaciones de bolsas
        for (const item of dto.bolsas) {
            const [errBolsa, createBolsaDto] = CreatePedidoBolsaDto.create({
                id_pedido: pedido.id_pedido,
                gramaje: item.gramaje,
                molienda: item.molienda,
                cantidad: item.cantidad,
            });
            if (errBolsa || !createBolsaDto) throw new Error(errBolsa ?? 'Error al crear DTO de pedido bolsa');
            await this.pedidoBolsaRepository.createPedidoBolsa(createBolsaDto);
        }

        return pedido;
    }

    async suscripcionValidations(dto: CreatePedidoDto, id_completado_por: string): Promise<PedidoEntity> {

        // Validar cliente
        const cliente = await this.clienteRepository.getUserById(dto.id_user!);
        if (!cliente || cliente.eliminado) {
            throw new Error("Cliente no válido");
        }
        const [error, usdto] = UpdateUserDto.update({
            suscripcion: true,
            cant_suscripcion: dto.cantidad
        });
        await this.clienteRepository.updateUser(dto.id_user!, usdto!);

        // Crear pedido de suscripción
        const pedido = await this.pedidoRepository.createPedido(dto);

        // completar el pedido automáticamente
        await this.pedidoRepository.completarPedido(pedido.id_pedido, id_completado_por);

        return pedido;

    }

    async ordenDespachoValidations(dto: CreateOrdenDespachoDto): Promise<PedidoEntity> {
        const cliente = await this.clienteRepository.getUserById(dto.pedido.id_user!);
        if (!cliente || cliente.eliminado) throw new Error("Cliente no válido");

        if (!dto.pedido.id_almacen) throw new Error('El almacén es requerido para una Orden de Despacho');

        const pedidoItemDtos: CreatePedidoItemDto[] = [];
        for (const [i, item] of dto.items.entries()) {
            const [errItem, itemDto] = CreatePedidoItemDto.create(item);
            if (errItem || !itemDto) throw new Error(`items[${i}]: ${errItem}`);

            const disponible = await this.inventarioGenericoRepository.obtenerStockDisponible({
                entidad: itemDto.entidad,
                id_entidad: itemDto.id_entidad,
                id_almacen: dto.pedido.id_almacen,
                cantidad: itemDto.cantidad,
            });
            if (disponible < itemDto.cantidad) {
                throw new Error(`items[${i}]: stock insuficiente para ${itemDto.entidad} ${itemDto.id_entidad} (disponible ${disponible}, solicitado ${itemDto.cantidad})`);
            }

            pedidoItemDtos.push(itemDto);
        }

        const pedido = await this.pedidoRepository.createPedido(dto.pedido);
        await this.pedidoItemRepository.createMany(pedido.id_pedido, pedidoItemDtos);

        return pedido;
    }

}



