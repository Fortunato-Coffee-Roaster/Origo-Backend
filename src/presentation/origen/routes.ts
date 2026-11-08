import { Router } from "express";
import { OrigenController } from "./controller";
import { OrigenDataSourceImpl } from "../../infrastructure/datasources/origen.datasource.impl";
import { OrigenRepositoryImpl } from "../../infrastructure/repositories/origen.repository.impl";
import { authMiddleware } from "../../infrastructure/middlewares/auth.middleware";
import { checkPermission } from "../../infrastructure/middlewares/permission.middleware";

// Catálogo de ubigeo, solo lectura.
export class OrigenRoutes {
    static get routes(): Router {
        const router = Router();

        const repository = new OrigenRepositoryImpl(new OrigenDataSourceImpl());
        const controller = new OrigenController(repository);

        const leer = [authMiddleware, checkPermission('inventario.origenes.read')];

        router.get('/', ...leer, controller.getAll);
        router.get('/:id', ...leer, controller.getById);

        return router;
    }
}
