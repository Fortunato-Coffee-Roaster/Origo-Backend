import { Request, Response } from "express";
import { ProveedorRepository } from "../../domain/repository/proveedor.repository";
import { CreateProveedorDto } from "../../domain/dtos/proveedor/create";
import { UpdateProveedorDto } from "../../domain/dtos/proveedor/update";
import { CreateProveedor } from "../../domain/usecases/proveedor/create-proveedor";
import { UpdateProveedor } from "../../domain/usecases/proveedor/update-proveedor";
import { GetProveedores } from "../../domain/usecases/proveedor/get-proveedores";
import { GetProveedoresActivos } from "../../domain/usecases/proveedor/get-proveedores-activos";
import { GetProveedor } from "../../domain/usecases/proveedor/get-proveedor";

// Un Error serializa como {}: se envía su mensaje.
const mensajeError = (error: unknown) => error instanceof Error ? error.message : error;

export class ProveedorController {

    constructor(
        private readonly proveedorRepository: ProveedorRepository
    ) {}

    public create = (req: Request, res: Response) => {
        const [error, dto] = CreateProveedorDto.create(req.body);
        if (error) return res.status(400).json({ error });

        new CreateProveedor(this.proveedorRepository)
            .execute(dto!)
            .then(proveedor => res.json(proveedor))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public update = (req: Request, res: Response) => {
        const { id } = req.params;
        const [error, dto] = UpdateProveedorDto.update({ ...req.body, id_proveedor: id });
        if (error) return res.status(400).json({ error });

        new UpdateProveedor(this.proveedorRepository)
            .execute(id, dto!)
            .then(proveedor => res.json(proveedor))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getAll = (_req: Request, res: Response) => {
        new GetProveedores(this.proveedorRepository)
            .execute()
            .then(proveedores => res.json(proveedores))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getActivos = (_req: Request, res: Response) => {
        new GetProveedoresActivos(this.proveedorRepository)
            .execute()
            .then(proveedores => res.json(proveedores))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getById = (req: Request, res: Response) => {
        new GetProveedor(this.proveedorRepository)
            .execute(req.params.id)
            .then(proveedor => res.json(proveedor))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };
}
