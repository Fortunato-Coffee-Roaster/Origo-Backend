import { Request, Response } from "express";
import { TipoSuscripcionRepository } from "../../../domain/repository/tipo-suscripcion.repository";
import { CreateTipoSuscripcionDto } from "../../../domain/dtos/suscripcion/tipo-suscripcion/create";
import { UpdateTipoSuscripcionDto } from "../../../domain/dtos/suscripcion/tipo-suscripcion/update";
import { CreateTipoSuscripcion } from "../../../domain/usecases/suscripciones/tipo-suscripcion/create-tipo-suscripcion";
import { UpdateTipoSuscripcion } from "../../../domain/usecases/suscripciones/tipo-suscripcion/update-tipo-suscripcion";
import { GetTiposSuscripcion } from "../../../domain/usecases/suscripciones/tipo-suscripcion/get-tipos-suscripcion";

// Un Error serializa como {}: se envía su mensaje.
const mensajeError = (error: unknown) => error instanceof Error ? error.message : error;

export class TipoSuscripcionController {

    constructor(
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository
    ) {}

    public createTipoSuscripcion = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = CreateTipoSuscripcionDto.create({ ...req.body, id_user: req.user.id_user });
        if (error) return res.status(400).json({ error });

        new CreateTipoSuscripcion(this.tipoSuscripcionRepository)
            .execute(dto!)
            .then(tipo => res.json(tipo))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getAllTiposSuscripcion = (_req: Request, res: Response) => {
        new GetTiposSuscripcion(this.tipoSuscripcionRepository)
            .execute()
            .then(tipos => res.json(tipos))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public updateTipoSuscripcion = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const { id } = req.params;
        const [error, dto] = UpdateTipoSuscripcionDto.update({
            ...req.body,
            id_tipo_suscripcion: id,
            id_user: req.user.id_user,
        });
        if (error) return res.status(400).json({ error });

        new UpdateTipoSuscripcion(this.tipoSuscripcionRepository)
            .execute(id, dto!)
            .then(tipo => res.json(tipo))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };
}
