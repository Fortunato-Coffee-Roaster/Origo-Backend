import { LoteRepository } from '../../repository/lote.repository';
import { UserRepository } from '../../repository/user.repository';
import { TipoUser } from '../../../enums/tipo-user.enum';

export interface StockTotalResult {
  total: number;
  admin: number;
  cliente: number;
}

export interface GetStockTotalUseCase {
  execute(): Promise<StockTotalResult>;
}

export class GetStockTotal implements GetStockTotalUseCase {
  constructor(
    private readonly loteRepository: LoteRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async execute(): Promise<StockTotalResult> {
    const lotes = await this.loteRepository.getLotes();
    const users = await this.userRepository.getAllUsers();

    const userMap = new Map<string, TipoUser>(); // id_user -> tipo
    for (const user of users) {
      if (!user.eliminado) userMap.set(user.id_user, user.tipo);
    }

    let total = 0;
    let totalAdmin = 0;
    let totalCliente = 0;

    for (const lote of lotes) {
      if (lote.eliminado) continue;

      const peso = lote.peso || 0;
      total += peso;

      // "admin" = stock de la tienda. Un lote ya no puede pertenecer a un
      // usuario interno (id_user apunta a UserCliente), así que la tienda se
      // identifica por owned_by_store.
      const tipo = lote.id_user ? userMap.get(lote.id_user) : null;
      if (lote.owned_by_store) {
        totalAdmin += peso;
      } else if (tipo === TipoUser.CLIENTE) {
        totalCliente += peso;
      }
    }

    return { total, admin: totalAdmin, cliente: totalCliente };
  }
}