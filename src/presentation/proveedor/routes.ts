import { Router } from "express";
import { ProveedorController } from "./controller";
import { ProveedorDataSourceImpl } from "../../infrastructure/datasources/proveedor.datasource.impl";
import { ProveedorRepositoryImpl } from "../../infrastructure/repositories/proveedor.repository.impl";
import { authMiddleware } from "../../infrastructure/middlewares/auth.middleware";
import { checkPermission } from "../../infrastructure/middlewares/permission.middleware";

export class ProveedorRoutes {
    static get routes(): Router {
        const router = Router();

        const repository = new ProveedorRepositoryImpl(new ProveedorDataSourceImpl());
        const controller = new ProveedorController(repository);

        const leer = [authMiddleware, checkPermission('inventario.proveedores.read')];
        const editar = [authMiddleware, checkPermission('inventario.proveedores.update')];

        router.post('/', ...editar, controller.create);
        router.put('/:id', ...editar, controller.update);

        router.get('/', ...leer, controller.getAll);
        router.get('/activos', ...leer, controller.getActivos); // antes de /:id
        router.get('/:id', ...leer, controller.getById);

        return router;
    }
}
