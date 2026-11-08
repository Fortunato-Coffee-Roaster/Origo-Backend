import { Request, Response } from "express";
import { SuscripcionRepository } from "../../../domain/repository/suscripcion.repository";
import { TipoSuscripcionRepository } from "../../../domain/repository/tipo-suscripcion.repository";
import { CreateSuscripcionDto } from "../../../domain/dtos/suscripcion/suscripcion/create";
import { RenovarSuscripcionDto } from "../../../domain/dtos/suscripcion/suscripcion/renovar";
import { CambiarEstadoSuscripcionDto } from "../../../domain/dtos/suscripcion/suscripcion/cambiar-estado";
import { CongelarSuscripcionDto } from "../../../domain/dtos/suscripcion/suscripcion/congelar";
import { ReactivarSuscripcionDto } from "../../../domain/dtos/suscripcion/suscripcion/reactivar";
import { FiltrosSuscripcionDto } from "../../../domain/dtos/suscripcion/suscripcion/filtros";
import { CreateSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/create-suscripcion";
import { GetSuscripciones } from "../../../domain/usecases/suscripciones/suscripcion/get-suscripciones";
import { GetSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/get-suscripcion";
import { GetSuscripcionesCliente } from "../../../domain/usecases/suscripciones/suscripcion/get-suscripciones-cliente";
import { RenovarSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/renovar-suscripcion";
import { FinalizarSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/finalizar-suscripcion";
import { CancelarSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/cancelar-suscripcion";
import { CongelarSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/congelar-suscripcion";
import { ReactivarSuscripcion } from "../../../domain/usecases/suscripciones/suscripcion/reactivar-suscripcion";

// Un Error serializa como {}: se envía su mensaje.
const mensajeError = (error: unknown) => error instanceof Error ? error.message : error;

export class SuscripcionController {

    constructor(
        private readonly suscripcionRepository: SuscripcionRepository,
        private readonly tipoSuscripcionRepository: TipoSuscripcionRepository,
    ) {}

    public create = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = CreateSuscripcionDto.create({ ...req.body, created_by: req.user.id_user });
        if (error) return res.status(400).json({ error });

        new CreateSuscripcion(this.suscripcionRepository, this.tipoSuscripcionRepository)
            .execute(dto!)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getAll = (req: Request, res: Response) => {
        const [error, dto] = FiltrosSuscripcionDto.create(req.query);
        if (error) return res.status(400).json({ error });

        new GetSuscripciones(this.suscripcionRepository)
            .execute(dto!)
            .then(suscripciones => res.json(suscripciones))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getByCliente = (req: Request, res: Response) => {
        new GetSuscripcionesCliente(this.suscripcionRepository)
            .execute(req.params.id_cliente)
            .then(suscripciones => res.json(suscripciones))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public getById = (req: Request, res: Response) => {
        new GetSuscripcion(this.suscripcionRepository)
            .execute(req.params.id)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public renovar = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = RenovarSuscripcionDto.create({
            ...req.body,
            id_suscripcion: req.params.id,
            created_by: req.user.id_user,
        });
        if (error) return res.status(400).json({ error });

        new RenovarSuscripcion(this.suscripcionRepository, this.tipoSuscripcionRepository)
            .execute(dto!)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public finalizar = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = CambiarEstadoSuscripcionDto.create({
            ...req.body,
            id_suscripcion: req.params.id,
            id_user: req.user.id_user,
        });
        if (error) return res.status(400).json({ error });

        new FinalizarSuscripcion(this.suscripcionRepository)
            .execute(dto!)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public cancelar = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = CambiarEstadoSuscripcionDto.create({
            ...req.body,
            id_suscripcion: req.params.id,
            id_user: req.user.id_user,
        });
        if (error) return res.status(400).json({ error });

        new CancelarSuscripcion(this.suscripcionRepository)
            .execute(dto!)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public congelar = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = CongelarSuscripcionDto.create({
            ...req.body,
            id_suscripcion: req.params.id,
            congelado_por: req.user.id_user,
        });
        if (error) return res.status(400).json({ error });

        new CongelarSuscripcion(this.suscripcionRepository)
            .execute(dto!)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };

    public reactivar = (req: Request, res: Response) => {
        if (!req.user?.id_user) return res.status(401).json({ error: 'Usuario no autenticado' });

        const [error, dto] = ReactivarSuscripcionDto.create({
            ...req.body,
            id_suscripcion: req.params.id,
            reactivado_por: req.user.id_user,
        });
        if (error) return res.status(400).json({ error });

        new ReactivarSuscripcion(this.suscripcionRepository)
            .execute(dto!)
            .then(suscripcion => res.json(suscripcion))
            .catch(error => res.status(400).json({ error: mensajeError(error) }));
    };
}
