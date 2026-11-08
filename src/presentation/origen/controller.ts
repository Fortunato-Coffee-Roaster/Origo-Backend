import { Request, Response } from "express";
import { OrigenRepository } from "../../domain/repository/origen.repository";
import { FiltrosOrigenDto } from "../../domain/dtos/origen/filtros";
import { GetOrigenes } from "../../domain/usecases/origen/get-origenes";
import { GetOrigen } from "../../domain/usecases/origen/get-origen";

// Un Error serializa como {}: se envía su mensaje.
const mensajeError = (error: unknown) => error instanceof Error ? error.message : error;

export class OrigenController {

    constructor(
        private readonly origenRepository: OrigenRepository
    ) {}

    public getAll = (req: Request, res: Response) => {
        const [error, dto] = FiltrosOrigenDto.create(req.query);
        if (error) return res.status(400).json({ error });

        new GetOrigenes(this.origenRepository)
            .execute(dto!)
            .then(origenes => res.json(origenes))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getById = (req: Request, res: Response) => {
        new GetOrigen(this.origenRepository)
            .execute(req.params.id)
            .then(origen => res.json(origen))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };
}
