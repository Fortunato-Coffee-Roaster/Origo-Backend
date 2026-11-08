import { Router } from "express";
import { IngresoCafeDataSourceImpl } from "../../infrastructure/datasources/ingreso-cafe.datasource.impl";
import { IngresoCafeRepositoryImpl } from "../../infrastructure/repositories/ingreso-cafe.repository.impl";
import { IngresoCafeController } from "./controller";

// @deprecated Reemplazado por CompraCafe (/compra-cafe). No usar en código nuevo; pendiente traspasar sus datos.
export class IngresoCafeRoutes {
  static get routes() {
    const router = Router();

    const datasource = new IngresoCafeDataSourceImpl();
    const repository = new IngresoCafeRepositoryImpl(datasource);
    const controller = new IngresoCafeController(repository);

    router.post("/", controller.createIngresoCafe);
    router.get("/", controller.getAllIngresosCafe);
    router.get("/:id", controller.getIngresoCafeById);
    router.get("/lote/:id_lote", controller.getIngresosByLote);
    router.delete("/:id", controller.deleteIngresoCafe);

    return router;
  }

}
