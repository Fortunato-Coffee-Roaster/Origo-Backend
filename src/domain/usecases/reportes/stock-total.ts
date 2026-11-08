import { UserRepositoryImpl } from './../../../infrastructure/repositories/user.repository.impl';

import { LoteRepository } from "../../repository/lote.repository";
import { UserRepository } from '../../repository/user.repository';

export interface StockTotalDto {
    total: number;
    totalFortunato: number;
    totalCliente: number;
}

export interface GetStockTotalUseCase {
    execute( ): Promise<StockTotalDto>;
}

export class GetStockTotal implements GetStockTotalUseCase {
  constructor(
    private readonly loteRepository: LoteRepository,
    private readonly userRepository: UserRepository
  ){}

  async execute(): Promise<StockTotalDto> {
    // 1) Traer todos los lotes
    const lotes = await this.loteRepository.getLotes();
    if (!lotes || lotes.length === 0) {
      throw new Error("No se encontraron lotes");
    }

    // 2) Calcular total global
    const total = lotes.reduce((acc, { peso_g = 0 }) => acc + peso_g, 0);

    // 3) Extraer IDs de usuario únicos (y filtrar nulos)
    const userIds = Array.from(
      new Set(
        lotes
          .map(lote => lote.id_user)
          .filter((id): id is string => typeof id === 'string')
      )
    );

    // 4) Hacer batch de getRole y mapear a un diccionario
    const roleMap = new Map<string, string>();
    await Promise.all(
      userIds.map(async userId => {
        const role = await this.userRepository.getRole(userId);
        roleMap.set(userId, role.toLowerCase());
      })
    );

    // 5) Sumarizaciones por rol
    let totalFortunato = 0;
    let totalCliente   = 0;

    for (const lote of lotes) {
      const peso = lote.peso_g ?? 0;
      const userId = lote.id_user;

      // Si no hay usuario, lo contamos como Fortunato
      if (!userId) {
        totalFortunato += peso;
        continue;
      }

      const role = roleMap.get(userId);
      if (role === "admin" || role === "fortunato") {
        totalFortunato += peso;
      } else if (role === "cliente") {
        totalCliente += peso;
      } else {
        // roles inesperados se consideran Fortunato
        totalFortunato += peso;
      }
    }

    // 6) Devolver el DTO
    return {
      total,
      totalFortunato,
      totalCliente
    };
  }
}
