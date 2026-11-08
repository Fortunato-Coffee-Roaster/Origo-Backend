import { FusionarLotes } from './../../domain/usecases/lote/lote/fusionar-lote';
import { Request, Response } from "express";
import { CreateLoteDto } from "../../domain/dtos/lotes/lote/create";
import { LoteRepository } from "../../domain/repository/lote.repository";
import { CreateLote, CreateLoteUseCase } from "../../domain/usecases/lote/lote/create-lote";
import { GetLoteById } from "../../domain/usecases/lote/lote/get-lote";
import { UpdateLote } from '../../domain/usecases/lote/lote/update-lote';
import { UpdateLoteDto } from "../../domain/dtos/lotes/lote/update";
import { DeleteLote } from "../../domain/usecases/lote/lote/delete.lote";
import { GetLotes } from "../../domain/usecases/lote/lote/get-lotes";
import { CreateLoteFromMuestra } from "../../domain/usecases/lote/lote/create-lote-muestra";
import { MuestraRepository } from "../../domain/repository/muestra.repository";
import { GetALLLotesTostados } from "../../domain/usecases/lote/lote/get-lotes-tostados";
import { GetAllLotesVerdes } from "../../domain/usecases/lote/lote/get-lotes-verdes";
import { GetUserByLote } from "../../domain/usecases/lote/lote/get-user-lote";
import { AnalisisRepository } from "../../domain/repository/analisis.repository";
import { AnalisisFisicoRepository } from "../../domain/repository/analisisFisico.repository";
import { AnalisisSensorialRepository } from "../../domain/repository/analisisSensorial.repository";
import { LoteAnalisisRepository } from "../../domain/repository/lote-analisis.repository";
import { UserRepository } from "../../domain/repository/user.repository";
import { CreateLoteRapidoDto } from '../../domain/dtos/lotes/lote/create-rapido';
import { PedidoRepository } from '../../domain/repository/pedido.repository';
import { BlendLotes } from '../../domain/usecases/lote/lote/blend-lotes';
import { BlendLotesDto } from '../../domain/dtos/lotes/lote/blend-lotes';
import { FusionarLotesDto } from '../../domain/dtos/lotes/lote/fusionar-lotes';
import { GetLoteRoaster } from '../../domain/usecases/lote/lote/get-lote-roaster';
import { AnalisisDefectosRespository } from '../../domain/repository/analisisDefectos.repository';
import { HistorialRepository } from '../../domain/repository/historial.repository';
import { GetLoteInventario } from '../../domain/usecases/lote/lote/get-lote-inventario';
import { GetLoteInventarioById } from '../../domain/usecases/lote/lote/get-lote-inventario-id';
import { InventarioLoteRepository } from '../../domain/repository/inventario-lote.repository';
import { TipoMovimiento } from '../../enums/tipo-movimiento.enum';
import { EntidadInventario } from '../../enums/entidad-inventario.enum';
import { MovimientoAlmacenRepository } from '../../domain/repository/movimiento-almacen.repository';
import { GetLotesByUserId } from '../../domain/usecases/lote/lote/get-lotes-user';
import { GetLotesOwnedByStore } from '../../domain/usecases/lote/lote/get-lotes-owned-by-store';
import { OrigenRepository } from '../../domain/repository/origen.repository';
import { ProveedorRepository } from '../../domain/repository/proveedor.repository';
import { CompraCafeRepository } from "../../domain/repository/compra-cafe.repository";
import { AplicarCostoLotes } from "../../domain/usecases/lote/costo/aplicar-costo-lotes";

const PERMISO_VER_COSTO = "costeo.lotes-costo.read";


export class LoteController {

    constructor(
        private readonly createLoteUseCase: CreateLoteUseCase,
        private readonly loteAnalisisRepository: LoteAnalisisRepository,
        private readonly muestraRepository: MuestraRepository,
        private readonly analisisRepository: AnalisisRepository,
        private readonly analisisFisicoRepository: AnalisisFisicoRepository,
        private readonly analisisSensorialRepository: AnalisisSensorialRepository,
        private readonly analisisDefectosRepository: AnalisisDefectosRespository,
        private readonly loteRepository: LoteRepository,
        private readonly userRepository: UserRepository,
        private readonly pedidoRepository: PedidoRepository,
        private readonly historialRepository: HistorialRepository,
        private readonly inventarioLoteRepository: InventarioLoteRepository,
        private readonly movimientoAlmacenRepository: MovimientoAlmacenRepository,
        private readonly origenRepository: OrigenRepository,
        private readonly proveedorRepository: ProveedorRepository,
        private readonly compraCafeRepository: CompraCafeRepository,
    ) { }

    // Quita o calcula el costo según req.permisos (lo marca marcarPermiso en las rutas).
    private conCosto = <T extends Parameters<AplicarCostoLotes["execute"]>[0]>(req: Request, lotes: T): Promise<T> =>
        new AplicarCostoLotes(this.compraCafeRepository).execute(lotes, req.permisos?.[PERMISO_VER_COSTO] === true);

    public createLote = async (req: Request, res: Response) => {
        if (!req.user?.id_user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const idUserFromBody = req.body.id_user as string | undefined;
        const ownedByStoreFromBody = req.body.owned_by_store as boolean | undefined;

        // ← falta este bloque acá también
        if (ownedByStoreFromBody === true && idUserFromBody) {
            return res.status(400).json({
                error: 'Un lote no puede ser de tienda y de cliente al mismo tiempo'
            });
        }

        let ownedByStore: boolean;
        let effectiveUserId: string | undefined;

        if (ownedByStoreFromBody === true) {
            ownedByStore = true;
            effectiveUserId = undefined;
        } else if (idUserFromBody) {
            ownedByStore = false;
            effectiveUserId = idUserFromBody;
        } else {
            return res.status(400).json({
                error: 'Debes indicar si el lote es de tienda (owned_by_store) o seleccionar un cliente (id_user)'
            });
        }

        const bodyWithUser = {
            ...req.body,
            id_user: effectiveUserId,
            owned_by_store: ownedByStore,
        };

        const idAlmacen = req.body.almacen as string | undefined;

        const [error, createLoteDto] = CreateLoteDto.create(bodyWithUser);
        if (error) {
            return res.status(400).json({ error });
        }

        this.createLoteUseCase
            .execute(createLoteDto!, undefined, undefined, idAlmacen, undefined, req.user.id_user)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error: error.message ?? error }));
    }



    public updateLote = async (req: Request, res: Response) => {
        const id_lote = req.params.id;
        const [error, updateLoteDto] = UpdateLoteDto.update({ ...req.body });
        if (error) {
            return res.status(400).json({ error });
        }
        const lote_before = await this.loteRepository.getLoteById(id_lote);
        new UpdateLote(this.loteRepository, this.origenRepository, this.proveedorRepository)
            .execute(req.params.id, updateLoteDto!)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error }));
    }

    public deleteLote = (req: Request, res: Response) => {
        new DeleteLote(this.loteRepository)
            .execute(req.params.id)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error }));
    }

    public createLoteFromMuestra = (req: Request, res: Response) => {
        const id_muestra = req.params.id;

        if (!req.user?.id_user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }


        const idUserFromBody = req.body.id_user as string | undefined;
        const ownedByStoreFromBody = req.body.owned_by_store === true;

        let effectiveUserId: string | undefined;

        if (ownedByStoreFromBody === true && idUserFromBody) {
            return res.status(400).json({
                error: 'Un lote no puede ser de tienda y de cliente al mismo tiempo'
            });
        }
        if (ownedByStoreFromBody) {
            effectiveUserId = undefined;
        } else if (idUserFromBody) {
            effectiveUserId = idUserFromBody;
        } else {
            return res.status(400).json({
                error: 'Debes indicar si el lote es de tienda (owned_by_store) o seleccionar un cliente (id_user)'
            });
        }

        const bodyWithUser = {
            ...req.body,
            id_user: effectiveUserId,
            owned_by_store: ownedByStoreFromBody
        };

        const [error, createLoteDto] = CreateLoteDto.create(bodyWithUser);
        if (!createLoteDto) return res.status(400).json({ error });

        const idAlmacen = req.body.almacen as string | undefined;

        new CreateLoteFromMuestra(
            this.createLoteUseCase,
            this.loteAnalisisRepository,
            this.muestraRepository,
            this.analisisRepository,
            this.analisisFisicoRepository,
            this.analisisSensorialRepository,
            this.analisisDefectosRepository,
            this.loteRepository
        )
            .execute(id_muestra, createLoteDto, req.user.id_user, idAlmacen)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => {
                console.log('Error en createLoteFromMuestra:', error);
                res.status(400).json({ error: error.message ?? String(error) });
            });
    }

    public blendLotes = async (req: Request, res: Response) => {
        console.log('hola');
        const [error, dto] = BlendLotesDto.create(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        new BlendLotes(
            this.loteRepository,
            this.pedidoRepository,
            this.userRepository
        )
            .execute(dto!)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error }));
    }

    public FusionarLotes = async (req: Request, res: Response) => {
        const [error, dto] = FusionarLotesDto.create(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        new FusionarLotes(
            this.loteRepository
        )
            .execute(dto!)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error }));
    }

    public getLoteById = (req: Request, res: Response) => {
        new GetLoteById(this.loteRepository)
            .execute(req.params.id)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error }));
    }
    public getLotesByUserId = (req: Request, res: Response) => {
        const incluirEliminados = req.query.incluirEliminados === 'true';
        new GetLotesByUserId(this.loteRepository)
            .execute(req.params.id, incluirEliminados)
            .then(lotes => this.conCosto(req, lotes))
            .then(lotes => res.json(lotes))
            .catch(error => res.status(400).json({ error: error?.message ?? String(error) }));
    }

    public getAllTostados = async (req: Request, res: Response) => {
        new GetALLLotesTostados(this.loteRepository)
            .execute()
            .then(tuestes => this.conCosto(req, tuestes))
            .then(tuestes => res.json(tuestes))
            .catch(error => res.status(400).json({ error }));
    }
    public getAllVerdes = async (req: Request, res: Response) => {
        new GetAllLotesVerdes(this.loteRepository)
            .execute()
            .then(tuestes => this.conCosto(req, tuestes))
            .then(tuestes => res.json(tuestes))
            .catch(error => res.status(400).json({ error }));
    }
    public getUserByLote = async (req: Request, res: Response) => {
        const id = req.params.id;
        new GetUserByLote(this.loteRepository)
            .execute(id)
            .then(user => res.json(user))
            .catch(error => res.status(400).json({ error }));

    }
    public getLotes = (req: Request, res: Response) => {
        new GetLotes(this.loteRepository)
            .execute()
            .then(lotes => this.conCosto(req, lotes))
            .then(lotes => res.json(lotes))
            .catch(error => res.status(400).json({ error }));
    }
    public getLotesRoaster = async (req: Request, res: Response) => {
        new GetLoteRoaster(
            this.loteRepository,
            this.userRepository
        )
            .execute()
            .then(lotes => this.conCosto(req, lotes))
            .then(lotes => res.json(lotes))
            .catch(error => res.status(400).json({ error })
            )
    }
    public getLoteInventario = async (req: Request, res: Response) => {
        const incluirEliminados = req.query.incluirEliminados === 'true';
        new GetLoteInventario(this.loteRepository)
            .execute(incluirEliminados)
            .then(lotes => this.conCosto(req, lotes))
            .then(lotes => res.json(lotes))
            .catch(error => res.status(400).json({ error })
            )
    }

    public getLoteInventarioById = async (req: Request, res: Response) => {
        const id = req.params.id;
        new GetLoteInventarioById(this.loteRepository)
            .execute(id)
            .then(lote => this.conCosto(req, lote))
            .then(lote => res.json(lote))
            .catch(error => res.status(400).json({ error })
            )
    }
    public getLotesOwnedByStore = async (req: Request, res: Response) => {
        const incluirEliminados = req.query.incluirEliminados === 'true';
        new GetLotesOwnedByStore(this.loteRepository)
            .execute(incluirEliminados)
            .then(lotes => this.conCosto(req, lotes))
            .then(lotes => res.json(lotes))
            .catch(error => res.status(400).json({ error }));
    }

}