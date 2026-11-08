import { Router } from "express";
import { PrecioLoteController } from "./controller";
import { PrecioLoteDataSourceImpl } from "../../infrastructure/datasources/precio-lote.datasource.impl";
import { PrecioLoteRepositoryImpl } from "../../infrastructure/repositories/precio-lote.repository.impl";
import { LoteDataSourceImpl } from "../../infrastructure/datasources/lote.datasource.impl";
import { LoteRepositoryImpl } from "../../infrastructure/repositories/lote.repository.impl";
import { authMiddleware } from "../../infrastructure/middlewares/auth.middleware";
import { checkPermission } from "../../infrastructure/middlewares/permission.middleware";

// Se monta en /lote ANTES que LoteRoutes, para que /lote/precios no lo capture /lote/:id.
// Si la ruta no coincide, Express sigue con LoteRoutes.
export class PrecioLoteRoutes {
    static get routes(): Router {
        const router = Router();

        const precioLoteRepository = new PrecioLoteRepositoryImpl(new PrecioLoteDataSourceImpl());
        const loteRepository = new LoteRepositoryImpl(new LoteDataSourceImpl());
        const controller = new PrecioLoteController(precioLoteRepository, loteRepository);

        const leer = [authMiddleware, checkPermission('costeo.lotes-precios.read')];
        const editar = [authMiddleware, checkPermission('costeo.lotes-precios.update')];

        router.get('/precios', ...leer, controller.getListaPrecios);
        router.get('/:id/precios', ...leer, controller.getPrecio);
        router.put('/:id/precios', ...editar, controller.upsertPrecio);

        return router;
    }
}
