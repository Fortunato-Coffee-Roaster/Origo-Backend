import { Request, Response } from "express";
import { CompraCafeRepository } from "../../domain/repository/compra-cafe.repository";
import { LoteRepository } from "../../domain/repository/lote.repository";
import { AlmacenRepository } from "../../domain/repository/almacen.repository";
import { ProveedorRepository } from "../../domain/repository/proveedor.repository";
import { CreateCompraCafeDto } from "../../domain/dtos/lotes/compra-cafe/create";
import { FiltrosComprasCafeDto } from "../../domain/dtos/lotes/compra-cafe/filtros";
import { RegistrarCompraCafe } from "../../domain/usecases/compra-cafe/registrar-compra-cafe";
import { GetComprasLote } from "../../domain/usecases/compra-cafe/get-compras-lote";
import { GetCompras } from "../../domain/usecases/compra-cafe/get-compras";

// Un Error serializa como {}: se envía su mensaje.
const mensajeError = (error: unknown) => error instanceof Error ? error.message : error;

export class CompraCafeController {

    constructor(
        private readonly compraCafeRepository: CompraCafeRepository,
        private readonly loteRepository: LoteRepository,
        private readonly almacenRepository: AlmacenRepository,
        private readonly proveedorRepository: ProveedorRepository,
    ) {}

    public registrarCompra = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = CreateCompraCafeDto.create({ ...req.body, id_user: req.user.id_user });
        if (error) return res.status(400).json({ error });

        new RegistrarCompraCafe(
            this.compraCafeRepository,
            this.loteRepository,
            this.almacenRepository,
            this.proveedorRepository,
        )
            .execute(dto!)
            .then(compra => res.json(compra))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getComprasByLote = (req: Request, res: Response) => {
        new GetComprasLote(this.compraCafeRepository, this.loteRepository)
            .execute(req.params.id_lote)
            .then(compras => res.json(compras))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getCompras = (req: Request, res: Response) => {
        const [error, dto] = FiltrosComprasCafeDto.create(req.query);
        if (error) return res.status(400).json({ error });

        new GetCompras(this.compraCafeRepository)
            .execute(dto!)
            .then(compras => res.json(compras))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };
}
