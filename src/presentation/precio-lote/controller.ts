import { Request, Response } from "express";
import { PrecioLoteRepository } from "../../domain/repository/precio-lote.repository";
import { LoteRepository } from "../../domain/repository/lote.repository";
import { UpsertPrecioLoteDto } from "../../domain/dtos/lotes/precio-lote/upsert";
import { FiltrosListaPreciosDto } from "../../domain/dtos/lotes/precio-lote/filtros";
import { UpsertPrecioLote } from "../../domain/usecases/precio-lote/upsert-precio-lote";
import { GetPrecioLote } from "../../domain/usecases/precio-lote/get-precio-lote";
import { GetListaPrecios } from "../../domain/usecases/precio-lote/get-lista-precios";

// Un Error serializa como {}: se envía su mensaje.
const mensajeError = (error: unknown) => error instanceof Error ? error.message : error;

export class PrecioLoteController {

    constructor(
        private readonly precioLoteRepository: PrecioLoteRepository,
        private readonly loteRepository: LoteRepository,
    ) {}

    public getListaPrecios = (req: Request, res: Response) => {
        const [error, dto] = FiltrosListaPreciosDto.create(req.query);
        if (error) return res.status(400).json({ error });

        new GetListaPrecios(this.precioLoteRepository)
            .execute(dto!)
            .then(lotes => res.json(lotes))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getPrecio = (req: Request, res: Response) => {
        new GetPrecioLote(this.precioLoteRepository, this.loteRepository)
            .execute(req.params.id)
            .then(precio => res.json(precio))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public upsertPrecio = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = UpsertPrecioLoteDto.create({
            ...req.body,
            id_lote: req.params.id,
            id_user: req.user.id_user,
            tipo_user: req.user.tipo,
        });
        if (error) return res.status(400).json({ error });

        new UpsertPrecioLote(this.precioLoteRepository, this.loteRepository)
            .execute(dto!)
            .then(precio => res.json(precio))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };
}
