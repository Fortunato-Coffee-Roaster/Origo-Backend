
import { Request, Response } from "express";
import { MuestraRepository } from "../../domain/repository/muestra.repository";
import { CreateMuestraDto } from "../../domain/dtos/muestra/create";
import { CreateMuestra } from "../../domain/usecases/muestra/create-muestra";
import { GetMuestra } from "../../domain/usecases/muestra/get-muestra";
import { UpdateMuestraDto } from "../../domain/dtos/muestra/update";
import { UpdateMuestra } from "../../domain/usecases/muestra/update-muestra";
import { DeleteMuestra } from "../../domain/usecases/muestra/detele-muestra";
import { GetMuestras as GetAllMuestra } from "../../domain/usecases/muestra/get-muestras";
import { UserRepository } from "../../domain/repository/user.repository";
import { HistorialRepository } from "../../domain/repository/historial.repository";
import { GetMuestrasConInventario } from "../../domain/usecases/muestra/muestra-inventario";
import { InventarioMuestraRepository } from "../../domain/repository/inventario-muestra.repository";
import { GetMuestrasOwnedByStore } from "../../domain/usecases/muestra/get-muestras-owned-by-store";
import { GetMuestrasByUserId } from "../../domain/usecases/muestra/get-muestras-user";
import { TipoUser } from "../../enums/tipo-user.enum";

export class MuestraController {

  constructor(
    private readonly muestraRepository: MuestraRepository,
    private readonly userRepository: UserRepository,
    private readonly historialRepository: HistorialRepository,
    private readonly inventarioMuestraRepository: InventarioMuestraRepository

  ) { }

  public createMuestra = (req: Request, res: Response) => {
    // 1. Verifica que req.user esté presente
    if (!req.user?.id_user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // 2. Un cliente no puede crear muestras (no debería ni tener acceso al ERP,
    //    pero se valida igual como defensa en profundidad)
    if (req.user.tipo === TipoUser.CLIENTE) {
      return res.status(403).json({ error: 'No tienes permisos para crear muestras' });
    }

    const idUserFromBody = req.body.id_user as string | undefined;
    const ownedByStoreFromBody = req.body.owned_by_store as boolean | undefined;

    let effectiveOwnedByStore: boolean;
    let effectiveUserId: string | undefined;

    if (ownedByStoreFromBody === true && idUserFromBody) {
      return res.status(400).json({
        error: 'Una muestra no puede ser de tienda y de cliente al mismo tiempo'
      });
    }

    if (ownedByStoreFromBody === true) {
      effectiveOwnedByStore = true;
      effectiveUserId = undefined;
    } else if (idUserFromBody) {
      effectiveOwnedByStore = false;
      effectiveUserId = idUserFromBody;
    } else {
      return res.status(400).json({
        error: 'Debes indicar si la muestra es de tienda (owned_by_store) o seleccionar un cliente (id_user)'
      });
    }

    const bodyWithUser = {
      ...req.body,
      owned_by_store: effectiveOwnedByStore,
      id_user: effectiveUserId,
    };

    const [error, createMuestraDto] = CreateMuestraDto.create(bodyWithUser);

    if (error) {
      return res.status(400).json({ error });
    }

    new CreateMuestra(this.muestraRepository, this.userRepository)
      .execute(createMuestraDto!)
      .then((muestra) => {
        res.json(muestra);
      })
      .catch((error) => res.status(400).json({ error }));
  };

  public updateMuestra = (req: Request, res: Response) => {
    const id_muestra = req.params.id;
    const [error, updateMuestraDto] = UpdateMuestraDto.update({ ...req.body, 'id_muestra': id_muestra });
    if (error) {
      return res.status(400).json({ error });
    }
    const muestra_before = this.muestraRepository.getMuestraById(id_muestra);
    new UpdateMuestra(this.muestraRepository)
      .execute(id_muestra, updateMuestraDto!)
      .then((muestra) => {
        res.json(muestra);
      })
      .catch(error => res.status(400).json({ error }));


  }

  public completeMuestra = (req: Request, res: Response) => {
    const id_muestra = req.params.id;
    this.muestraRepository.completeMuestra(id_muestra)
      .then((muestra) => {
        res.json(muestra);
      })
      .catch(error => res.status(400).json({ error }));
  }

  public deleteMuestra = (req: Request, res: Response) => {
    const id_muestra = req.params.id;
    new DeleteMuestra(this.muestraRepository)
      .execute(id_muestra)
      .then((muestra) => {
        res.json(muestra);
      })
      .catch(error => res.status(400).json({ error }));
  }

  public getAllMuestra = (req: Request, res: Response) => {
    new GetAllMuestra(this.muestraRepository)
      .execute()
      .then(muestras => res.json(muestras))
      .catch(error => res.status(400).json({ error }));
  }

  public getMuestraById = (req: Request, res: Response) => {
    new GetMuestra(this.muestraRepository)
      .execute(req.params.id)
      .then(muestra => res.json(muestra))
      .catch(error => res.status(400).json({ error }));

  }

  public getMuestrasConInventario = (req: Request, res: Response) => {
    const incluirEliminados = req.query.incluirEliminados === 'true';

    new GetMuestrasConInventario(this.muestraRepository)
      .execute(incluirEliminados)
      .then(muestras => res.json(muestras))
      .catch(error => res.status(400).json({ error: error.message ?? error }));
  }

  public getMuestrasOwnedByStore = (req: Request, res: Response) => {
    const incluirEliminados = req.query.incluirEliminados === 'true';

    new GetMuestrasOwnedByStore(this.muestraRepository)
      .execute(incluirEliminados)
      .then((muestras) => res.json(muestras))
      .catch((error) => res.status(400).json({ error: error.message ?? error }));
  };

  public getMuestrasByUserId = (req: Request, res: Response) => {
    const incluirEliminados = req.query.incluirEliminados === 'true';

    new GetMuestrasByUserId(this.muestraRepository)
      .execute(req.params.id, incluirEliminados)
      .then((muestras) => res.json(muestras))
      .catch((error) => res.status(400).json({ error: error.message ?? error }));
  };


}