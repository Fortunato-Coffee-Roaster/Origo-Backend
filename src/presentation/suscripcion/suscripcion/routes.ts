import { Router } from "express";
import { SuscripcionController } from "./controller";
import { SuscripcionDataSourceImpl } from "../../../infrastructure/datasources/suscripcion.datasource.impl";
import { SuscripcionRepositoryImpl } from "../../../infrastructure/repositories/suscripcion.repository.impl";
import { TipoSuscripcionDataSourceImpl } from "../../../infrastructure/datasources/tipo-suscripcion.datasource.impl";
import { TipoSuscripcionRepositoryImpl } from "../../../infrastructure/repositories/tipo-suscripcion.repository.impl";
import { authMiddleware } from "../../../infrastructure/middlewares/auth.middleware";
import { checkPermission } from "../../../infrastructure/middlewares/permission.middleware";

export class SuscripcionRoutes {
    static get routes() {
        const router = Router();

        const suscripcionRepository = new SuscripcionRepositoryImpl(new SuscripcionDataSourceImpl());
        const tipoSuscripcionRepository = new TipoSuscripcionRepositoryImpl(new TipoSuscripcionDataSourceImpl());
        const controller = new SuscripcionController(suscripcionRepository, tipoSuscripcionRepository);

        const leer = [authMiddleware, checkPermission('suscripcion.read')];
        const editar = [authMiddleware, checkPermission('suscripcion.update')];

        router.post("/", ...editar, controller.create);
        router.get("/", ...leer, controller.getAll);
        router.get("/cliente/:id_cliente", ...leer, controller.getByCliente); // antes de /:id
        router.get("/:id", ...leer, controller.getById);

        router.post("/:id/renovar", ...editar, controller.renovar);
        router.post("/:id/finalizar", ...editar, controller.finalizar);
        router.post("/:id/cancelar", ...editar, controller.cancelar);
        router.post("/:id/congelar", ...editar, controller.congelar);
        router.post("/:id/reactivar", ...editar, controller.reactivar);

        return router;
    }
}
