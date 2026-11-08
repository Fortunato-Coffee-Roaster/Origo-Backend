import { HistorialRepositoryImpl } from './../../../../infrastructure/repositories/historial.repository.impl';
import { Historial } from '@prisma/client';
import { EntidadInventario } from "../../../../enums/entidad-inventario.enum";
import { HistorialAccion } from "../../../../enums/historial-accion.enum";
import { HistorialEntidad } from "../../../../enums/historial-entidad.enum";
import { TipoMovimiento } from "../../../../enums/tipo-movimiento.enum";

import { TrasladarStockAlmacenDto } from "../../../dtos/almacen/almacen/trasladar-stock";
import { CreateHistorialDto } from "../../../dtos/historial/create";
import { CreateMovimientoAlmacenDto } from "../../../dtos/almacen/movimiento-almacen/create";

import { CreateInventarioInsumoDto } from "../../../dtos/inventarios/inventario-insumo/create";
import { UpdateInventarioInsumoDto } from "../../../dtos/inventarios/inventario-insumo/update";
import { CreateInventarioLoteTostadoDto } from "../../../dtos/inventarios/inventario-lote-tostado/create";
import { UpdateInventarioLoteTostadoDto } from "../../../dtos/inventarios/inventario-lote-tostado/update";
import { CreateInventarioLoteDto } from "../../../dtos/inventarios/inventario-lote/create";
import { UpdateInventarioLoteDto } from "../../../dtos/inventarios/inventario-lote/update";
import { CreateInventarioMuestraDto } from "../../../dtos/inventarios/inventario-muestra/create";
import { UpdateInventarioMuestraDto } from "../../../dtos/inventarios/inventario-muestra/update";
import { CreateInventarioProductoDto } from "../../../dtos/inventarios/inventario-producto/create";
import { UpdateInventarioProductoDto } from "../../../dtos/inventarios/inventario-producto/update";

import { AlmacenRepository } from "../../../repository/almacen.repository";
import { HistorialRepository } from "../../../repository/historial.repository";
import { InventarioInsumoRepository } from "../../../repository/inventario-insumo.repository";
import { InventarioLoteTostadoRepository } from "../../../repository/inventario-lote-tostado.repository";
import { InventarioLoteRepository } from "../../../repository/inventario-lote.repository";
import { InventarioMuestraRepository } from "../../../repository/inventario-muestra.repository";
import { InventarioProductoRepository } from "../../../repository/inventario-producto.repository";
import { MovimientoAlmacenRepository } from "../../../repository/movimiento-almacen.repository";
import { InventarioBolsaRepository } from '../../../repository/inventario-bolsa.repository';
import { CreateInventarioBolsaDto } from '../../../dtos/inventarios/inventario-bolsa/create';
import { UpdateInventarioBolsaDto } from '../../../dtos/inventarios/inventario-bolsa/update';

export interface TrasladarStockAlmacenUseCase {
  execute(dto: TrasladarStockAlmacenDto): Promise<void>;
}

export class TrasladarStockAlmacen implements TrasladarStockAlmacenUseCase {
  constructor(
    private readonly almacenRepository: AlmacenRepository,
    private readonly historialRepository: HistorialRepository,
    private readonly movimientoAlmacenRepository: MovimientoAlmacenRepository,
    private readonly inventarioLoteRepository: InventarioLoteRepository,
    private readonly inventarioLoteTostadoRepository: InventarioLoteTostadoRepository,
    private readonly inventarioMuestraRepository: InventarioMuestraRepository,
    private readonly inventarioProductoRepository: InventarioProductoRepository,
    private readonly inventarioInsumoRepository: InventarioInsumoRepository,
    private readonly inventarioBolsaRepository: InventarioBolsaRepository, 
  ) { }

  async execute(dto: TrasladarStockAlmacenDto): Promise<void> {
    if (!dto.id_user) {
      throw new Error("El id_user es requerido");
    }

    if (dto.id_almacen_origen === dto.id_almacen_destino) {
      throw new Error("El almacén origen y destino no pueden ser iguales");
    }

    if (dto.cantidad <= 0) {
      throw new Error("La cantidad a trasladar debe ser mayor a 0");
    }

    const almacenOrigen = await this.almacenRepository.getAlmacenById(dto.id_almacen_origen);
    if (!almacenOrigen) {
      throw new Error("El almacén origen no existe");
    }

    const almacenDestino = await this.almacenRepository.getAlmacenById(dto.id_almacen_destino);
    if (!almacenDestino) {
      throw new Error("El almacén destino no existe");
    }

    let inventarioOrigen: Record<string, any> | null = null;
    let inventarioDestino: Record<string, any> | null = null;

    let objetoAntes: Record<string, any> | null = null;
    let objetoDespues: Record<string, any> | null = null;

    switch (dto.entidad) {
      case "LOTE": {
        inventarioOrigen = await this.inventarioLoteRepository.getByLoteAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        if (!inventarioOrigen) {
          throw new Error("No existe inventario del lote en el almacén origen");
        }

        if (Number(inventarioOrigen.cantidad_g) < dto.cantidad) {
          throw new Error("Stock insuficiente en el almacén origen");
        }

        inventarioDestino = await this.inventarioLoteRepository.getByLoteAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_destino
        );

        objetoAntes = {
          origen: inventarioOrigen,
          destino: inventarioDestino,
        };

        const nuevaCantidadOrigen = Number(inventarioOrigen.cantidad_g) - dto.cantidad;

        const [errorOrigen, updateOrigenDto] = UpdateInventarioLoteDto.update({
          cantidad_g: nuevaCantidadOrigen,
        });

        if (errorOrigen || !updateOrigenDto) {
          throw new Error(errorOrigen ?? "No se pudo construir el DTO de actualización del lote origen");
        }

        await this.inventarioLoteRepository.updateInventario(
          inventarioOrigen.id_inventario,
          updateOrigenDto
        );

        if (inventarioDestino) {
          const nuevaCantidadDestino = Number(inventarioDestino.cantidad_g) + dto.cantidad;

          const [errorDestino, updateDestinoDto] = UpdateInventarioLoteDto.update({
            cantidad_g: nuevaCantidadDestino,
          });

          if (errorDestino || !updateDestinoDto) {
            throw new Error(errorDestino ?? "No se pudo construir el DTO de actualización del lote destino");
          }

          inventarioDestino = await this.inventarioLoteRepository.updateInventario(
            inventarioDestino.id_inventario,
            updateDestinoDto
          );
        } else {
          const [errorCreate, createDestinoDto] = CreateInventarioLoteDto.create({
            id_lote: dto.id_entidad,
            id_almacen: dto.id_almacen_destino,
            cantidad_g: dto.cantidad,
          });

          if (errorCreate || !createDestinoDto) {
            throw new Error(errorCreate ?? "No se pudo construir el DTO de creación del lote destino");
          }

          inventarioDestino = await this.inventarioLoteRepository.createInventario(createDestinoDto);
        }

        const inventarioOrigenActualizado = await this.inventarioLoteRepository.getByLoteAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        objetoDespues = {
          origen: inventarioOrigenActualizado,
          destino: inventarioDestino,
        };

        break;
      }

      case "LOTE_TOSTADO": {
        inventarioOrigen = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        if (!inventarioOrigen) {
          throw new Error("No existe inventario del lote tostado en el almacén origen");
        }

        if (Number(inventarioOrigen.cantidad_g) < dto.cantidad) {
          throw new Error("Stock insuficiente en el almacén origen");
        }

        inventarioDestino = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_destino
        );

        objetoAntes = {
          origen: inventarioOrigen,
          destino: inventarioDestino,
        };

        const nuevaCantidadOrigen = Number(inventarioOrigen.cantidad_g) - dto.cantidad;

        const [errorOrigen, updateOrigenDto] = UpdateInventarioLoteTostadoDto.update({
          cantidad_g: nuevaCantidadOrigen,
        });

        if (errorOrigen || !updateOrigenDto) {
          throw new Error(errorOrigen ?? "No se pudo construir el DTO de actualización del lote tostado origen");
        }

        await this.inventarioLoteTostadoRepository.updateInventario(
          inventarioOrigen.id_inventario,
          updateOrigenDto
        );

        if (inventarioDestino) {
          const nuevaCantidadDestino = Number(inventarioDestino.cantidad_g) + dto.cantidad;

          const [errorDestino, updateDestinoDto] = UpdateInventarioLoteTostadoDto.update({
            cantidad_g: nuevaCantidadDestino,
          });

          if (errorDestino || !updateDestinoDto) {
            throw new Error(errorDestino ?? "No se pudo construir el DTO de actualización del lote tostado destino");
          }

          inventarioDestino = await this.inventarioLoteTostadoRepository.updateInventario(
            inventarioDestino.id_inventario,
            updateDestinoDto
          );
        } else {
          const [errorCreate, createDestinoDto] = CreateInventarioLoteTostadoDto.create({
            id_lote_tostado: dto.id_entidad,
            id_almacen: dto.id_almacen_destino,
            cantidad_g: dto.cantidad,
          });

          if (errorCreate || !createDestinoDto) {
            throw new Error(errorCreate ?? "No se pudo construir el DTO de creación del lote tostado destino");
          }

          inventarioDestino = await this.inventarioLoteTostadoRepository.createInventario(createDestinoDto);
        }

        const inventarioOrigenActualizado = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        objetoDespues = {
          origen: inventarioOrigenActualizado,
          destino: inventarioDestino,
        };

        break;
      }

      case "MUESTRA": {
        inventarioOrigen = await this.inventarioMuestraRepository.getByMuestraAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        if (!inventarioOrigen) {
          throw new Error("No existe inventario de la muestra en el almacén origen");
        }

        if (Number(inventarioOrigen.peso_g) < dto.cantidad) {
          throw new Error("Stock insuficiente en el almacén origen");
        }

        inventarioDestino = await this.inventarioMuestraRepository.getByMuestraAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_destino
        );

        objetoAntes = {
          origen: inventarioOrigen,
          destino: inventarioDestino,
        };

        const nuevaCantidadOrigen = Number(inventarioOrigen.peso_g) - dto.cantidad;

        const [errorOrigen, updateOrigenDto] = UpdateInventarioMuestraDto.update({
          peso_g: nuevaCantidadOrigen,
        });

        if (errorOrigen || !updateOrigenDto) {
          throw new Error(errorOrigen ?? "No se pudo construir el DTO de actualización de muestra origen");
        }

        await this.inventarioMuestraRepository.updateInventario(
          inventarioOrigen.id_inventario,
          updateOrigenDto
        );

        if (inventarioDestino) {
          const nuevaCantidadDestino = Number(inventarioDestino.peso_g) + dto.cantidad;

          const [errorDestino, updateDestinoDto] = UpdateInventarioMuestraDto.update({
            peso_g: nuevaCantidadDestino,
          });

          if (errorDestino || !updateDestinoDto) {
            throw new Error(errorDestino ?? "No se pudo construir el DTO de actualización de muestra destino");
          }

          inventarioDestino = await this.inventarioMuestraRepository.updateInventario(
            inventarioDestino.id_inventario,
            updateDestinoDto
          );
        } else {
          const [errorCreate, createDestinoDto] = CreateInventarioMuestraDto.create({
            id_muestra: dto.id_entidad,
            id_almacen: dto.id_almacen_destino,
            peso_g: dto.cantidad,
          });

          if (errorCreate || !createDestinoDto) {
            throw new Error(errorCreate ?? "No se pudo construir el DTO de creación de muestra destino");
          }

          inventarioDestino = await this.inventarioMuestraRepository.createInventario(createDestinoDto);
        }

        const inventarioOrigenActualizado = await this.inventarioMuestraRepository.getByMuestraAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        objetoDespues = {
          origen: inventarioOrigenActualizado,
          destino: inventarioDestino,
        };

        break;
      }

      case "PRODUCTO": {
        inventarioOrigen = await this.inventarioProductoRepository.getByProductoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen,
          // dto.gramaje ?? null,
          // dto.molienda ?? null
        );

        if (!inventarioOrigen) {
          throw new Error("No existe inventario del producto en el almacén origen");
        }

        if (Number(inventarioOrigen.cantidad) < dto.cantidad) {
          throw new Error("Stock insuficiente en el almacén origen");
        }


        inventarioDestino = await this.inventarioProductoRepository.getByProductoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_destino,
          // dto.gramaje ?? null,
          // dto.molienda ?? null
        );

        objetoAntes = {
          origen: inventarioOrigen,
          destino: inventarioDestino,
        };

        const nuevaCantidadOrigen = Number(inventarioOrigen.cantidad) - dto.cantidad;

        const [errorOrigen, updateOrigenDto] = UpdateInventarioProductoDto.update({
          cantidad: nuevaCantidadOrigen,
        });

        if (errorOrigen || !updateOrigenDto) {
          throw new Error(errorOrigen ?? "No se pudo construir el DTO de actualización de producto origen");
        }


        await this.inventarioProductoRepository.updateInventario(
          inventarioOrigen.id_inventario,
          updateOrigenDto
        );

        if (inventarioDestino) {
          const nuevaCantidadDestino = Number(inventarioDestino.cantidad) + dto.cantidad;

          const [errorDestino, updateDestinoDto] = UpdateInventarioProductoDto.update({
            cantidad: nuevaCantidadDestino,
          });

          if (errorDestino || !updateDestinoDto) {
            throw new Error(errorDestino ?? "No se pudo construir el DTO de actualización de producto destino");
          }

          inventarioDestino = await this.inventarioProductoRepository.updateInventario(
            inventarioDestino.id_inventario,
            updateDestinoDto
          );
        } else {
          const [errorCreate, createDestinoDto] = CreateInventarioProductoDto.create({
            id_producto: dto.id_entidad,
            id_almacen: dto.id_almacen_destino,
            cantidad: dto.cantidad,
            // gramaje: dto.gramaje ?? null,
            // molienda: dto.molienda ?? null,
          });

          if (errorCreate || !createDestinoDto) {
            throw new Error(errorCreate ?? "No se pudo construir el DTO de creación de producto destino");
          }

          inventarioDestino = await this.inventarioProductoRepository.createInventario(createDestinoDto);
        }

        const inventarioOrigenActualizado = await this.inventarioProductoRepository.getByProductoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen,
          // dto.gramaje ?? null,
          // dto.molienda ?? null
        );

        objetoDespues = {
          origen: inventarioOrigenActualizado,
          destino: inventarioDestino,
        };

        break;
      }

      case "INSUMO": {
        inventarioOrigen = await this.inventarioInsumoRepository.getByInsumoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        if (!inventarioOrigen) {
          throw new Error("No existe inventario del insumo en el almacén origen");
        }

        if (Number(inventarioOrigen.cantidad) < dto.cantidad) {
          throw new Error("Stock insuficiente en el almacén origen");
        }

        inventarioDestino = await this.inventarioInsumoRepository.getByInsumoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_destino
        );

        objetoAntes = {
          origen: inventarioOrigen,
          destino: inventarioDestino,
        };

        const nuevaCantidadOrigen = Number(inventarioOrigen.cantidad) - dto.cantidad;

        const [errorOrigen, updateOrigenDto] = UpdateInventarioInsumoDto.update({
          cantidad: nuevaCantidadOrigen,
        });

        if (errorOrigen || !updateOrigenDto) {
          throw new Error(errorOrigen ?? "No se pudo construir el DTO de actualización de insumo origen");
        }

        await this.inventarioInsumoRepository.updateInventario(
          inventarioOrigen.id_inventario,
          updateOrigenDto
        );

        if (inventarioDestino) {
          const nuevaCantidadDestino = Number(inventarioDestino.cantidad) + dto.cantidad;

          const [errorDestino, updateDestinoDto] = UpdateInventarioInsumoDto.update({
            cantidad: nuevaCantidadDestino,
          });

          if (errorDestino || !updateDestinoDto) {
            throw new Error(errorDestino ?? "No se pudo construir el DTO de actualización de insumo destino");
          }

          inventarioDestino = await this.inventarioInsumoRepository.updateInventario(
            inventarioDestino.id_inventario,
            updateDestinoDto
          );
        } else {
          const [errorCreate, createDestinoDto] = CreateInventarioInsumoDto.create({
            id_insumo: dto.id_entidad,
            id_almacen: dto.id_almacen_destino,
            cantidad: dto.cantidad,
          });

          if (errorCreate || !createDestinoDto) {
            throw new Error(errorCreate ?? "No se pudo construir el DTO de creación de insumo destino");
          }

          inventarioDestino = await this.inventarioInsumoRepository.createInventario(createDestinoDto);
        }

        const inventarioOrigenActualizado = await this.inventarioInsumoRepository.getByInsumoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        objetoDespues = {
          origen: inventarioOrigenActualizado,
          destino: inventarioDestino,
        };

        break;
      }

      case "BOLSA": {
        inventarioOrigen = await this.inventarioBolsaRepository.getByBolsaAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        if (!inventarioOrigen) {
          throw new Error("No existe inventario de la bolsa en el almacén origen");
        }

        if (Number(inventarioOrigen.cantidad) < dto.cantidad) {
          throw new Error("Stock insuficiente en el almacén origen");
        }

        inventarioDestino = await this.inventarioBolsaRepository.getByBolsaAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_destino
        );

        objetoAntes = {
          origen: inventarioOrigen,
          destino: inventarioDestino,
        };

        const nuevaCantidadOrigen = Number(inventarioOrigen.cantidad) - dto.cantidad;

        const [errorOrigen, updateOrigenDto] = UpdateInventarioBolsaDto.update({
          cantidad: nuevaCantidadOrigen,
        });

        if (errorOrigen || !updateOrigenDto) {
          throw new Error(errorOrigen ?? "No se pudo construir el DTO de actualización de bolsa origen");
        }

        await this.inventarioBolsaRepository.updateInventario(
          inventarioOrigen.id_inventario,
          updateOrigenDto
        );

        if (inventarioDestino) {
          const nuevaCantidadDestino = Number(inventarioDestino.cantidad) + dto.cantidad;

          const [errorDestino, updateDestinoDto] = UpdateInventarioBolsaDto.update({
            cantidad: nuevaCantidadDestino,
          });

          if (errorDestino || !updateDestinoDto) {
            throw new Error(errorDestino ?? "No se pudo construir el DTO de actualización de bolsa destino");
          }

          inventarioDestino = await this.inventarioBolsaRepository.updateInventario(
            inventarioDestino.id_inventario,
            updateDestinoDto
          );
        } else {
          const [errorCreate, createDestinoDto] = CreateInventarioBolsaDto.create({
            id_bolsa: dto.id_entidad,
            id_almacen: dto.id_almacen_destino,
            cantidad: dto.cantidad,
          });

          if (errorCreate || !createDestinoDto) {
            throw new Error(errorCreate ?? "No se pudo construir el DTO de creación de bolsa destino");
          }

          inventarioDestino = await this.inventarioBolsaRepository.createInventario(createDestinoDto);
        }

        const inventarioOrigenActualizado = await this.inventarioBolsaRepository.getByBolsaAndAlmacen(
          dto.id_entidad,
          dto.id_almacen_origen
        );

        objetoDespues = {
          origen: inventarioOrigenActualizado,
          destino: inventarioDestino,
        };

        break;
      }

      default:
        throw new Error("Entidad no soportada para traslado de stock");
    }

    const [movError, movimientoDto] = CreateMovimientoAlmacenDto.create({
      tipo: TipoMovimiento.TRASLADO,
      entidad: this.mapEntidadInventario(dto.entidad),
      id_user: dto.id_user,
      id_entidad_primario: dto.id_entidad,
      cantidad: dto.cantidad,
      id_pedido: null,
      id_almacen_origen: dto.id_almacen_origen,
      id_almacen_destino: dto.id_almacen_destino,
      comentario: dto.motivo ?? `Traslado de ${dto.cantidad} entre almacenes`,
    });

    if (movError || !movimientoDto) {
      throw new Error(movError ?? "No se pudo construir el movimiento de almacén");
    }

    await this.movimientoAlmacenRepository.createMovimiento(movimientoDto);

    const [histError, historialDto] = CreateHistorialDto.create({
      id_entidad: dto.id_entidad,
      id_user: dto.id_user,
      entidad: this.mapHistorialEntidad(dto.entidad),
      accion: HistorialAccion.TRASLADO,
      id_pedido: null,
      comentario: dto.motivo ?? `Traslado de ${dto.cantidad} del almacén ${dto.id_almacen_origen} al ${dto.id_almacen_destino}`,
      objeto_antes: objetoAntes,
      objeto_despues: objetoDespues,
    });

    if (histError || !historialDto) {
      throw new Error(histError ?? "No se pudo construir el historial");
    }

    await this.historialRepository.createHistorial(historialDto);
  }

  private mapEntidadInventario(entidad: TrasladarStockAlmacenDto["entidad"]): EntidadInventario {
    switch (entidad) {
      case "LOTE": return EntidadInventario.LOTE;
      case "LOTE_TOSTADO": return EntidadInventario.LOTE_TOSTADO;
      case "PRODUCTO": return EntidadInventario.PRODUCTO;
      case "MUESTRA": return EntidadInventario.MUESTRA;
      case "INSUMO": return EntidadInventario.INSUMO;
      case "BOLSA": return EntidadInventario.BOLSA; 
      default: throw new Error("Entidad de inventario no soportada");
    }
  }

  private mapHistorialEntidad(entidad: TrasladarStockAlmacenDto["entidad"]): HistorialEntidad {
    switch (entidad) {
      case "LOTE": return HistorialEntidad.LOTE;
      case "LOTE_TOSTADO": return HistorialEntidad.LOTE_TOSTADO;
      case "PRODUCTO": return HistorialEntidad.PRODUCTO;
      case "MUESTRA": return HistorialEntidad.MUESTRA;
      case "INSUMO": return HistorialEntidad.INSUMO;
      case "BOLSA": return HistorialEntidad.BOLSA; 
      default: throw new Error("Entidad de historial no soportada");
    }
  }
}