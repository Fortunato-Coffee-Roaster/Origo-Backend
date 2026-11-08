import { Router } from "express";
import { TipoSuscripcionController } from "./controller";
import { TipoSuscripcionDataSourceImpl } from "../../../infrastructure/datasources/tipo-suscripcion.datasource.impl";
import { TipoSuscripcionRepositoryImpl } from "../../../infrastructure/repositories/tipo-suscripcion.repository.impl";
import { authMiddleware } from "../../../infrastructure/middlewares/auth.middleware";
import { checkPermission } from "../../../infrastructure/middlewares/permission.middleware";

export class TipoSuscripcionRoutes {
    static get routes() {
        const router = Router();

        const datasource = new TipoSuscripcionDataSourceImpl();
        const repository = new TipoSuscripcionRepositoryImpl(datasource);
        const controller = new TipoSuscripcionController(repository);

        router.get("/", authMiddleware, checkPermission('suscripcion.read'), controller.getAllTiposSuscripcion);
        router.post("/", authMiddleware, checkPermission('suscripcion.update'), controller.createTipoSuscripcion);
        router.put("/:id", authMiddleware, checkPermission('suscripcion.update'), controller.updateTipoSuscripcion);

        return router;
    }
}
