import { EntidadInventario } from "../../../../enums/entidad-inventario.enum";
import { HistorialAccion } from "../../../../enums/historial-accion.enum";
import { HistorialEntidad } from "../../../../enums/historial-entidad.enum";
import { TipoMovimiento } from "../../../../enums/tipo-movimiento.enum";

import { AjustarStockAlmacenDto } from "../../../dtos/almacen/almacen/ajustar-stock";
import { CreateMovimientoAlmacenDto } from "../../../dtos/almacen/movimiento-almacen/create";
import { CreateHistorialDto } from "../../../dtos/historial/create";

import { UpdateInventarioInsumoDto } from "../../../dtos/inventarios/inventario-insumo/update";
import { UpdateInventarioLoteTostadoDto } from "../../../dtos/inventarios/inventario-lote-tostado/update";
import { UpdateInventarioLoteDto } from "../../../dtos/inventarios/inventario-lote/update";
import { UpdateInventarioMuestraDto } from "../../../dtos/inventarios/inventario-muestra/update";
import { UpdateInventarioProductoDto } from "../../../dtos/inventarios/inventario-producto/update";

import { AlmacenRepository } from "../../../repository/almacen.repository";
import { HistorialRepository } from "../../../repository/historial.repository";
import { InventarioInsumoRepository } from "../../../repository/inventario-insumo.repository";
import { InventarioLoteTostadoRepository } from "../../../repository/inventario-lote-tostado.repository";
import { InventarioLoteRepository } from "../../../repository/inventario-lote.repository";
import { InventarioMuestraRepository } from "../../../repository/inventario-muestra.repository";
import { InventarioProductoRepository } from "../../../repository/inventario-producto.repository";
import { MovimientoAlmacenRepository } from "../../../repository/movimiento-almacen.repository";
import { LoteRepository } from '../../../repository/lote.repository';
import { LoteTostadoRepository } from '../../../repository/loteTostado.repository';
import { InventarioBolsaRepository } from "../../../repository/inventario-bolsa.repository";
import { UpdateInventarioBolsaDto } from "../../../dtos/inventarios/inventario-bolsa/update";

export interface AjustarStockAlmacenUseCase {
  execute(dto: AjustarStockAlmacenDto): Promise<void>;
}

export class AjustarStockAlmacen implements AjustarStockAlmacenUseCase {
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
    private readonly loteRepository: LoteRepository,
    private readonly loteTostadoRepository: LoteTostadoRepository
  ) {}

  async execute(dto: AjustarStockAlmacenDto): Promise<void> {
    const almacen = await this.almacenRepository.getAlmacenById(dto.id_almacen);
    if (!almacen) throw new Error("El almacén no existe");
    if (!dto.id_user) throw new Error("El id_user es requerido");
    if (dto.nueva_cantidad < 0) throw new Error("La nueva cantidad no puede ser negativa");

    let inventarioActual: Record<string, any> | null = null;
    let objetoDespues: Record<string, any> | null = null;
    let cantidadAnterior = 0;

    switch (dto.entidad) {
      case "LOTE": {
        inventarioActual = await this.inventarioLoteRepository.getByLoteAndAlmacen(
          dto.id_entidad,
          dto.id_almacen
        );

        if (!inventarioActual) {
          throw new Error("No existe inventario del lote en el almacén indicado");
        }

        cantidadAnterior = Number(inventarioActual.cantidad_g);

        if (cantidadAnterior === dto.nueva_cantidad) {
          throw new Error("No hay cambios que aplicar al inventario");
        }

        const [error, updateDto] = UpdateInventarioLoteDto.update({
          cantidad_g: dto.nueva_cantidad,
        });

        if (error || !updateDto) {
          throw new Error(error ?? "No se pudo construir el DTO de actualización del lote");
        }

        objetoDespues = await this.inventarioLoteRepository.updateInventario(
          inventarioActual.id_inventario,
          updateDto
        );

        if (dto.nueva_cantidad === 0) {
          const todosInventarios = await this.inventarioLoteRepository.getByLote(dto.id_entidad);
          const stockTotal = todosInventarios.reduce(
            (sum, inv) => sum + Number(inv.cantidad_g), 0
          );

          if (stockTotal === 0) {
            const loteAntes = await this.loteRepository.getLoteById(dto.id_entidad);
            await this.loteRepository.deleteLote(dto.id_entidad);

            const [histDeleteError, histDeleteDto] = CreateHistorialDto.create({
              id_entidad: dto.id_entidad,
              id_user: dto.id_user,
              entidad: HistorialEntidad.LOTE,
              accion: HistorialAccion.DELETE,
              comentario: `Lote eliminado automáticamente por stock agotado en todos los almacenes.${dto.motivo ? ' Motivo: ' + dto.motivo : ''}`,
              objeto_antes: loteAntes,
              objeto_despues: null,
            });

            if (histDeleteError || !histDeleteDto) {
              throw new Error(histDeleteError ?? "No se pudo construir el historial de eliminación del lote");
            }

            await this.historialRepository.createHistorial(histDeleteDto);
          }
        }

        break;
      }

      case "LOTE_TOSTADO": {
        inventarioActual = await this.inventarioLoteTostadoRepository.getByLoteTostadoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen
        );

        if (!inventarioActual) {
          throw new Error("No existe inventario del lote tostado en el almacén indicado");
        }

        cantidadAnterior = Number(inventarioActual.cantidad_g);

        if (cantidadAnterior === dto.nueva_cantidad) {
          throw new Error("No hay cambios que aplicar al inventario");
        }

        const [error, updateDto] = UpdateInventarioLoteTostadoDto.update({
          cantidad_g: dto.nueva_cantidad,
        });

        if (error || !updateDto) {
          throw new Error(error ?? "No se pudo construir el DTO de actualización del lote tostado");
        }

        objetoDespues = await this.inventarioLoteTostadoRepository.updateInventario(
          inventarioActual.id_inventario,
          updateDto
        );

        if (dto.nueva_cantidad === 0) {
          const todosInventarios = await this.inventarioLoteTostadoRepository.getByLote(dto.id_entidad);
          const stockTotal = todosInventarios.reduce(
            (sum, inv) => sum + Number(inv.cantidad_g), 0
          );

          if (stockTotal === 0) {
            const loteTostadoAntes = await this.loteTostadoRepository.getLoteTostadoById(dto.id_entidad);
            await this.loteTostadoRepository.deleteLoteTostado(dto.id_entidad);

            const [histDeleteError, histDeleteDto] = CreateHistorialDto.create({
              id_entidad: dto.id_entidad,
              id_user: dto.id_user,
              entidad: HistorialEntidad.LOTE_TOSTADO,
              accion: HistorialAccion.DELETE,
              comentario: `Lote tostado eliminado automáticamente por stock agotado en todos los almacenes.${dto.motivo ? ' Motivo: ' + dto.motivo : ''}`,
              objeto_antes: loteTostadoAntes,
              objeto_despues: null,
            });

            if (histDeleteError || !histDeleteDto) {
              throw new Error(histDeleteError ?? "No se pudo construir el historial de eliminación del lote tostado");
            }

            await this.historialRepository.createHistorial(histDeleteDto);
          }
        }

        break;
      }

      case "MUESTRA": {
        inventarioActual = await this.inventarioMuestraRepository.getByMuestraAndAlmacen(
          dto.id_entidad,
          dto.id_almacen
        );

        if (!inventarioActual) {
          throw new Error("No existe inventario de la muestra en el almacén indicado");
        }

        cantidadAnterior = Number(inventarioActual.peso_g);

        if (cantidadAnterior === dto.nueva_cantidad) {
          throw new Error("No hay cambios que aplicar al inventario");
        }

        const [error, updateDto] = UpdateInventarioMuestraDto.update({
          peso_g: dto.nueva_cantidad,
        });

        if (error || !updateDto) {
          throw new Error(error ?? "No se pudo construir el DTO de actualización de muestra");
        }

        objetoDespues = await this.inventarioMuestraRepository.updateInventario(
          inventarioActual.id_inventario,
          updateDto
        );

        break;
      }

      case "PRODUCTO": {
        inventarioActual = await this.inventarioProductoRepository.getByProductoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen,
          dto.gramaje ?? null,
          dto.molienda ?? null
        );

        if (!inventarioActual) {
          throw new Error("No existe inventario del producto en el almacén indicado");
        }

        cantidadAnterior = Number(inventarioActual.cantidad);

        if (cantidadAnterior === dto.nueva_cantidad) {
          throw new Error("No hay cambios que aplicar al inventario");
        }

        const [error, updateDto] = UpdateInventarioProductoDto.update({
          cantidad: dto.nueva_cantidad,
        });

        if (error || !updateDto) {
          throw new Error(error ?? "No se pudo construir el DTO de actualización de producto");
        }

        objetoDespues = await this.inventarioProductoRepository.updateInventario(
          inventarioActual.id_inventario,
          updateDto
        );

        break;
      }

      case "INSUMO": {
        inventarioActual = await this.inventarioInsumoRepository.getByInsumoAndAlmacen(
          dto.id_entidad,
          dto.id_almacen
        );

        if (!inventarioActual) {
          throw new Error("No existe inventario del insumo en el almacén indicado");
        }

        cantidadAnterior = Number(inventarioActual.cantidad);

        if (cantidadAnterior === dto.nueva_cantidad) {
          throw new Error("No hay cambios que aplicar al inventario");
        }

        const [error, updateDto] = UpdateInventarioInsumoDto.update({
          cantidad: dto.nueva_cantidad,
        });

        if (error || !updateDto) {
          throw new Error(error ?? "No se pudo construir el DTO de actualización de insumo");
        }

        objetoDespues = await this.inventarioInsumoRepository.updateInventario(
          inventarioActual.id_inventario,
          updateDto
        );

        break;
      }


      case "BOLSA": {
        inventarioActual = await this.inventarioBolsaRepository.getByBolsaAndAlmacen(
          dto.id_entidad,
          dto.id_almacen
        );

        if (!inventarioActual) {
          throw new Error("No existe inventario de la bolsa en el almacén indicado");
        }

        cantidadAnterior = Number(inventarioActual.cantidad);

        if (cantidadAnterior === dto.nueva_cantidad) {
          throw new Error("No hay cambios que aplicar al inventario");
        }

        const [error, updateDto] = UpdateInventarioBolsaDto.update({
          cantidad: dto.nueva_cantidad,
        });

        if (error || !updateDto) {
          throw new Error(error ?? "No se pudo construir el DTO de actualización de bolsa");
        }

        objetoDespues = await this.inventarioBolsaRepository.updateInventario(
          inventarioActual.id_inventario,
          updateDto
        );
        break;
      }

      default:
        throw new Error("Entidad no soportada para ajuste de stock");
    }

    const delta = dto.nueva_cantidad - cantidadAnterior;

    const [movError, movimientoDto] = CreateMovimientoAlmacenDto.create({
      tipo: TipoMovimiento.AJUSTE,
      entidad: this.mapEntidadInventario(dto.entidad),
      id_user: dto.id_user,
      id_entidad_primario: dto.id_entidad,
      cantidad: delta,
      id_almacen_origen: dto.id_almacen,
      id_almacen_destino: dto.id_almacen,
      comentario: `De ${cantidadAnterior} a ${dto.nueva_cantidad}${dto.motivo ? ' — ' + dto.motivo : ''}`,
    });

    if (movError || !movimientoDto) {
      throw new Error(movError ?? "No se pudo construir el movimiento de almacén");
    }

    await this.movimientoAlmacenRepository.createMovimiento(movimientoDto);

    const [histError, historialDto] = CreateHistorialDto.create({
      id_entidad: dto.id_entidad,
      id_user: dto.id_user,
      entidad: this.mapHistorialEntidad(dto.entidad),
      accion: HistorialAccion.AJUSTE,
      comentario: `De ${cantidadAnterior} a ${dto.nueva_cantidad}${dto.motivo ? ' — ' + dto.motivo : ''}`,
      objeto_antes: inventarioActual,
      objeto_despues: objetoDespues,
    });

    if (histError || !historialDto) {
      throw new Error(histError ?? "No se pudo construir el historial");
    }

    await this.historialRepository.createHistorial(historialDto);
  }

  private mapEntidadInventario(entidad: AjustarStockAlmacenDto["entidad"]): EntidadInventario {
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

  private mapHistorialEntidad(entidad: AjustarStockAlmacenDto["entidad"]): HistorialEntidad {
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