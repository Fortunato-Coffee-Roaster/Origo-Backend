import { Router } from "express";
import { CompraCafeController } from "./controller";
import { CompraCafeDataSourceImpl } from "../../infrastructure/datasources/compra-cafe.datasource.impl";
import { CompraCafeRepositoryImpl } from "../../infrastructure/repositories/compra-cafe.repository.impl";
import { LoteDataSourceImpl } from "../../infrastructure/datasources/lote.datasource.impl";
import { LoteRepositoryImpl } from "../../infrastructure/repositories/lote.repository.impl";
import { AlmacenDataSourceImpl } from "../../infrastructure/datasources/almacen.datasource.impl";
import { AlmacenRepositoryImpl } from "../../infrastructure/repositories/almacen.repository.impl";
import { ProveedorDataSourceImpl } from "../../infrastructure/datasources/proveedor.datasource.impl";
import { ProveedorRepositoryImpl } from "../../infrastructure/repositories/proveedor.repository.impl";
import { authMiddleware } from "../../infrastructure/middlewares/auth.middleware";
import { checkPermission } from "../../infrastructure/middlewares/permission.middleware";

export class CompraCafeRoutes {
    static get routes(): Router {
        const router = Router();

        const controller = new CompraCafeController(
            new CompraCafeRepositoryImpl(new CompraCafeDataSourceImpl()),
            new LoteRepositoryImpl(new LoteDataSourceImpl()),
            new AlmacenRepositoryImpl(new AlmacenDataSourceImpl()),
            new ProveedorRepositoryImpl(new ProveedorDataSourceImpl()),
        );

        const crear = [authMiddleware, checkPermission('inventario.compras-cafe.create')];
        const leer = [authMiddleware, checkPermission('inventario.compras-cafe.read')];

        router.post('/', ...crear, controller.registrarCompra);
        router.get('/lote/:id_lote', ...leer, controller.getComprasByLote);
        router.get('/', ...leer, controller.getCompras);

        return router;
    }
}
