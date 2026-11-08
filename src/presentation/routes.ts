import { Router } from "express";
import { AnalisisRoutes } from "./analisis/routes";
import { AnalisisFisicoRoutes } from "./analisisFisico/routes";
import { AnalisisRapidoRoutes } from "./analisisRapido/routes";
import { AnalisisSensorialRoutes } from "./analisisSensorial/routes";
import { LoteRoutes } from "./lote/routes";
import { MuestraRoutes } from "./muestra/routes";
import { TuesteRoutes } from "./tueste/routes";
import { UserRoutes } from "./users/routes";
import { PedidoRoutes } from "./pedido/routes";
import { LoteTostadoRoutes } from "./lote-tostado/routes";
import { HistorialRoutes } from "./historial/routes";
import { PersonalizadoRoutes } from "./personalizado/routes";
import { AnalisisDefectosRoutes } from "./analisisDefectos/routes";
import { VariedadRoutes } from "./variedad/routes";
import { EnvioRoutes } from "./envio/routes";
import { NotasRoutes } from "./notas/routes";
import { ProductoComponenteRoutes } from "./producto-componente/routes";
import { ProductoRoutes } from "./producto/routes";
import { InventarioProductosRoutes } from "./inventarios/inventario-producto/routes";
import { CategoriaRoutes } from "./categoria/routes";
import { BoxTemplateRoutes } from "./box-template/routes";
import { BoxOpcionRoutes } from "./box-opcion/routes";
import { BoxRespuestaRoutes } from "./box-respuesta/routes";
import { IngresoCafeRoutes } from "./ingreso-cafe/routes";
import { CambioRoutes } from "./cambio/routes";
import { RolRoutes } from "./roles-permiso/rol/routes";
import { PermisoRoutes } from "./roles-permiso/permiso/routes";
import { RolPermisoRoutes } from "./roles-permiso/rol-permiso/routes";
import { AlmacenRoutes } from "./almacen/almacen/routes";
import { MovimientoAlmacenRoutes } from "./almacen/almacen-movimiento/routes";
import { InventarioLoteRoutes } from "./inventarios/inventario-lote/routes";
import { InventarioLoteTostadoRoutes } from "./inventarios/inventarios-lote-tostado/routes";
import { InventarioInsumoRoutes } from "./inventarios/inventario-insumo/routes";
import { IngresoProductoRoutes } from "./ingreso-producto/routes";
import { InsumoRoutes } from "./insumo/routes";
import { InventarioMuestraRoutes } from "./inventarios/inventario-muestra/routes";
import { categoriaInsumoRoutes } from "./categoria-insumo.ts/routes";
import { MarcaRoutes } from "./marca/route";
import { IngresoInsumoRoutes } from "./ingreso-insumo/routes";
import { BalonGasRoutes } from "./balon-gas/routes";
import { BolsaRoutes } from "./bolsa/routes";
import { InventarioBolsaRoutes } from "./inventarios/inventario-bolsa/routes";
import { PedidoBolsaRoutes } from "./pedido-bolsa/routes";
import { PaqueteRoutes } from "./paquete/routes";
import { PedidoItemRoutes } from "./pedido-item/routes";
import { PaqueteItemRoutes } from "./paquete-item/routes";
import { ProveedorRoutes } from "./proveedor/routes";
import { OrigenRoutes } from "./origen/routes";


export class AppRoutes {

    static get routes(): Router {
        const router = Router();

        router.use('/analisis', AnalisisRoutes.routes);
        router.use('/analisisFisico', AnalisisFisicoRoutes.routes);
        router.use('/analisisRapido', AnalisisRapidoRoutes.routes);
        router.use('/analisisSensorial', AnalisisSensorialRoutes.routes);
        router.use('/analisisDefectos', AnalisisDefectosRoutes.routes);

        router.use('/lote', LoteRoutes.routes);
        router.use('/loteTostado', LoteTostadoRoutes.routes);
        router.use('/muestra', MuestraRoutes.routes);
        router.use('/proveedor', ProveedorRoutes.routes);
        router.use('/origen', OrigenRoutes.routes);
        router.use('/insumo', InsumoRoutes.routes);
        router.use('/bolsa', BolsaRoutes.routes);

        router.use('/producto', ProductoRoutes.routes);
        router.use('/marca', MarcaRoutes.routes);
        router.use('/categoria', CategoriaRoutes.routes);
        router.use('/categoria-insumo', categoriaInsumoRoutes.routes);
        router.use('/ingreso-insumo', IngresoInsumoRoutes.routes);
        router.use('/productoComponente', ProductoComponenteRoutes.routes);
        router.use('/ingreso-producto', IngresoProductoRoutes.routes);


        router.use('/almacen', AlmacenRoutes.routes);
        router.use('/movimiento-almacen', MovimientoAlmacenRoutes.routes);

        router.use('/inventario-bolsa', InventarioBolsaRoutes.routes);
        router.use('/inventario-muestra', InventarioMuestraRoutes.routes);
        router.use('/inventario-producto', InventarioProductosRoutes.routes);
        router.use('/inventario-lote', InventarioLoteRoutes.routes);
        router.use('/inventario-lote-tostado', InventarioLoteTostadoRoutes.routes);
        router.use('/inventario-insumo', InventarioInsumoRoutes.routes);

        router.use('/variedad', VariedadRoutes.routes);
        router.use('/notas', NotasRoutes.routes);

        router.use('/pedido', PedidoRoutes.routes);
        router.use('/pedido-bolsa', PedidoBolsaRoutes.routes);
        router.use('/pedido-item', PedidoItemRoutes.routes);
        router.use('/tueste', TuesteRoutes.routes);
        router.use('/balon-gas', BalonGasRoutes.routes);
        
        router.use('/envio', EnvioRoutes.routes);
        router.use('/paquete', PaqueteRoutes.routes);
        router.use('/paquete-item', PaqueteItemRoutes.routes);

        router.use('/historial', HistorialRoutes.routes);
        router.use('/cambio', CambioRoutes.routes);

        router.use('/user', UserRoutes.routes);
        router.use('/rol', RolRoutes.routes);
        router.use('/permiso', PermisoRoutes.routes);
        router.use('/rol-permiso', RolPermisoRoutes.routes);


        router.use('/p', PersonalizadoRoutes.routes);



        router.use('/box-template', BoxTemplateRoutes.routes);
        router.use('/box-opcion', BoxOpcionRoutes.routes);
        router.use('/box-respuesta', BoxRespuestaRoutes.routes);

        router.use('/ingreso-cafe', IngresoCafeRoutes.routes);

        return router;
    }


}