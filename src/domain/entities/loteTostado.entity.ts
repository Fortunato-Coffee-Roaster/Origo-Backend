import { InventarioLoteTostadoEntity } from "./inventario-lote-tostado.entity";
import { LoteEntity } from "./lote.entity";

export class LoteTostadoEntity {
    constructor(
        public id_lote_tostado: string,
        public id_lote: string,
        public fecha_tostado: Date,
        public perfil_tostado: string,
        public peso_g: number,
        public fecha_registro: Date,
        public owned_by_store: boolean,
        public id_user?: string,
        public id_analisis_rapido?: string,
        public entregado?: Date,
        public eliminado?: boolean
    ) {}
  
    static fromObject(obj: { [key: string]: any }): LoteTostadoEntity {
        const {
            id_lote_tostado,
            id_lote,
            fecha_tostado,
            perfil_tostado,
            peso_g,
            fecha_registro,
            owned_by_store,
            id_user,
            id_analisis_rapido,
            entregado,
            eliminado
        } = obj;

        if(!id_lote_tostado) throw new Error('id_lote_tostado property is required');
        if(!id_lote) throw new Error('id_lote property is required');
        if(!perfil_tostado) throw new Error('perfil_tostado property is required');
        const newFechaRegistro = new Date(fecha_registro);
        if (isNaN(newFechaRegistro.getTime())) {
            throw new Error('fecha_registro no es válida');
        }
        const newFechaTostado = new Date(fecha_tostado);
        if (isNaN(newFechaTostado.getTime())) {
            throw new Error('fecha_tostado no es válida');
        }

        return new LoteTostadoEntity(
            id_lote_tostado,
            id_lote,
            newFechaTostado,
            perfil_tostado,
            peso_g,
            newFechaRegistro,
            owned_by_store ?? false,
            id_user,
            id_analisis_rapido,
            entregado,
            eliminado
        );
    }
  }
  

export class LoteTostadoConLoteEntity {
  constructor(
    public id_lote_tostado: string,
    public id_lote: string,
    public fecha_tostado: Date,
    public perfil_tostado: string,
    public peso_g: number,
    public fecha_registro: Date,
    public owned_by_store: boolean,

    // extra solo para estos casos
    public lote: LoteEntity,

    public id_user?: string,
    public id_analisis_rapido?: string,
    public entregado?: Date,
    public eliminado?: boolean
  ) {}

  static fromObject(obj: { [key: string]: any }): LoteTostadoConLoteEntity {
    const {
      id_lote_tostado,
      id_lote,
      fecha_tostado,
      perfil_tostado,
      peso_g,
      fecha_registro,
      owned_by_store,
      id_user,
      id_analisis_rapido,
      entregado,
      lote,
      eliminado
    } = obj;

    if (!id_lote_tostado) throw new Error('id_lote_tostado property is required');
    if (!id_lote) throw new Error('id_lote property is required');
    if (!perfil_tostado) throw new Error('perfil_tostado property is required');
    if (!lote) throw new Error('lote property is required');

    const newFechaRegistro = new Date(fecha_registro);
    if (isNaN(newFechaRegistro.getTime())) {
      throw new Error('fecha_registro no es válida');
    }

    const newFechaTostado = new Date(fecha_tostado);
    if (isNaN(newFechaTostado.getTime())) {
      throw new Error('fecha_tostado no es válida');
    }

    const newEntregado = entregado ? new Date(entregado) : undefined;
    if (entregado && isNaN(newEntregado!.getTime())) {
      throw new Error('entregado no es válida');
    }

    return new LoteTostadoConLoteEntity(
      id_lote_tostado,
      id_lote,
      newFechaTostado,
      perfil_tostado,
      peso_g,
      newFechaRegistro,
      owned_by_store ?? false,
      LoteEntity.fromObject(lote),
      id_user,
      id_analisis_rapido,
      newEntregado,
      eliminado
    );
  }
}

export class LoteTostadoConInventarioEntity {
  constructor(
    public id_lote_tostado: string,
    public id_lote: string,
    public fecha_tostado: Date,
    public perfil_tostado: string,
    public peso_g: number,
    public fecha_registro: Date,
    public owned_by_store: boolean,
    public lote: LoteEntity,
    public inventarioLotesTostados: InventarioLoteTostadoEntity[],
    public id_user?: string,
    public id_analisis_rapido?: string,
    public entregado?: Date,
    public eliminado?: boolean
  ) {}

  static fromObject(obj: { [key: string]: any }): LoteTostadoConInventarioEntity {
    const {
      id_lote_tostado,
      id_lote,
      fecha_tostado,
      perfil_tostado,
      peso_g,
      fecha_registro,
      owned_by_store,
      id_user,
      id_analisis_rapido,
      entregado,
      lote,
      inventarioLoteTostados = [],
      eliminado
    } = obj;

    if (!id_lote_tostado) throw new Error('id_lote_tostado property is required');
    if (!id_lote) throw new Error('id_lote property is required');
    if (!perfil_tostado) throw new Error('perfil_tostado property is required');
    if (!lote) throw new Error('lote property is required');

    const newFechaRegistro = new Date(fecha_registro);
    if (isNaN(newFechaRegistro.getTime())) {
      throw new Error('fecha_registro no es válida');
    }

    const newFechaTostado = new Date(fecha_tostado);
    if (isNaN(newFechaTostado.getTime())) {
      throw new Error('fecha_tostado no es válida');
    }

    const newEntregado = entregado ? new Date(entregado) : undefined;
    if (entregado && isNaN(newEntregado!.getTime())) {
      throw new Error('entregado no es válida');
    }

    return new LoteTostadoConInventarioEntity(
      id_lote_tostado,
      id_lote,
      newFechaTostado,
      perfil_tostado,
      peso_g,
      newFechaRegistro,
      owned_by_store ?? false,
      LoteEntity.fromObject(lote),
      inventarioLoteTostados.map((inv: any) =>
        InventarioLoteTostadoEntity.fromObject(inv)
      ),
      id_user,
      id_analisis_rapido,
      newEntregado,
      eliminado
    );
  }
}