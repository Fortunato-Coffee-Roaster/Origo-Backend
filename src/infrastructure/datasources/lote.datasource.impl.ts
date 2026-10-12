import { prisma } from "../../data/postgres";
import { LoteDataSource } from "../../domain/datasources/lote.datasource";
import { CreateLoteDto } from '../../domain/dtos/lotes/lote/create';
import { CreateLoteRapidoDto } from "../../domain/dtos/lotes/lote/create-rapido";
import { UpdateLoteDto } from "../../domain/dtos/lotes/lote/update";
import { LoteConInventarioEntity, LoteEntity } from "../../domain/entities/lote.entity";


export class LoteDataSourceImpl implements LoteDataSource {


  async createLote(createLoteDto: CreateLoteDto): Promise<LoteEntity> {
    const lote = await prisma.lote.create({
      data: createLoteDto!
    });
    return LoteEntity.fromObject(lote);
  }

  async createLoteRapido(dto: CreateLoteRapidoDto): Promise<LoteEntity> {
    const lote = await prisma.lote.create({
      data: dto
    });

    return LoteEntity.fromObject(lote);
  }

  async getLoteById(id: string): Promise<LoteEntity | null> {
    const lote = await prisma.lote.findUnique({
      where: {
        id_lote: id
      }
    });
    if (!lote) return null;
    return LoteEntity.fromObject(lote);
  }

  async updateLote(id: string, updateLoteDto: UpdateLoteDto): Promise<LoteEntity> {
    const lote = await this.getLoteById(id);
    const updatedLote = await prisma.lote.update({
      where: { id_lote: id },
      data: { ...updateLoteDto.values, eliminado: false }
    });
    return LoteEntity.fromObject(updatedLote);
  }

  async deleteLote(id: string): Promise<LoteEntity> {
    const lote = await this.getLoteById(id);
    const deletedLote = await prisma.lote.update({
      where: { id_lote: id },
      data: { eliminado: true }
    });
    return LoteEntity.fromObject(deletedLote);
  }

  async getLotes(): Promise<LoteEntity[]> {
    const lotes = await prisma.lote.findMany({
      where: {
        eliminado: false,
      }
    });
    return lotes.map(lote => LoteEntity.fromObject(lote));

  }

  async createLoteFromMuestra(id: string, dto: CreateLoteDto): Promise<LoteEntity> {
    const Muestra = await prisma.muestra.findUnique({
      where: {
        id_muestra: id,
        eliminado: false
      }
    });
    if (!Muestra) throw new Error("No existe la muestra");

    const lote = await prisma.lote.create({
      data: dto!,
    });

    await prisma.muestra.update({
      where: { id_muestra: id },
      data: { eliminado: true }
    });

    return LoteEntity.fromObject(lote);
  }

  async getLotesByUserId(id: string, incluirEliminados: boolean = false): Promise<LoteEntity[]> {
    const user = await prisma.user.findUnique({
      where: {
        id_user: id,
        eliminado: false
      }
    });
    if (!user) throw new Error("No existe el usuario");

    const lotes = await prisma.lote.findMany({
      where: {
        id_user: id,
        ...(incluirEliminados ? {} : { eliminado: false })
      }
    });
    if (!lotes) throw new Error("No existen lotes para el usuario");
    return lotes.map(lote => LoteEntity.fromObject(lote));
  }
  
  async getLotesTostados(): Promise<LoteEntity[]> {
    const lotes = await prisma.lote.findMany({
      where: {
        eliminado: false,
        tipo_lote: 'Tostado Verde'
      }
    });
    return lotes.map(lote => LoteEntity.fromObject(lote));
  }
  async getLotesVerdes(): Promise<LoteEntity[]> {
    const lotes = await prisma.lote.findMany({
      where: {
        eliminado: false,
        tipo_lote: 'Lote Verde'
      }
    });
    return lotes.map(lote => LoteEntity.fromObject(lote));
  }

  async getUserByLote(id: string): Promise<string> {
    // Los lotes ahora cuelgan de UserCliente, y el nombre sigue en User.
    const user = await prisma.user.findFirst({
      where: {
        cliente: {
          lotes: {
            some: {
              id_lote: id,
            },
          },
        },
      },
    });
    if (!user) throw new Error("No se encontró el usuario para el lote");
    return user.nombre;
  }


  async getLotesConInventario(incluirEliminados: boolean = false): Promise<LoteConInventarioEntity[]> {
    const lotes = await prisma.lote.findMany({
      where: incluirEliminados
        ? {} // trae activos e inactivos
        : { eliminado: false },
      include: {
        inventarioLotes: {
          include: { almacen: true },
        },
      },
    });

    return lotes.map(l => LoteConInventarioEntity.fromObject(l));
  }

  async getLoteConInventarioById(id: string): Promise<LoteConInventarioEntity | null> {
    const lote = await prisma.lote.findFirst({
      where: {
        id_lote: id,
      },
      include: {
        inventarioLotes: {
          include: {
            almacen: true,
          },
        },
      },
    });

    if (!lote) return null;

    return LoteConInventarioEntity.fromObject(lote);
  }

  async getLotesOwnedByStore(incluirEliminados: boolean = false): Promise<LoteEntity[]> {
    const lotes = await prisma.lote.findMany({
      where: {
        owned_by_store: true,
        ...(incluirEliminados ? {} : { eliminado: false })
      }
    });
    return lotes.map(lote => LoteEntity.fromObject(lote));
  }



}
