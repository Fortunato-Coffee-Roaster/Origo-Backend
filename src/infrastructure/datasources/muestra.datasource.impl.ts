import { MuestraDataSource } from "../../domain/datasources/muestra.datasource";
import { MuestraConInventarioEntity, MuestraEntity } from "../../domain/entities/muestra.entity";
import { prisma } from "../../data/postgres";
import { UpdateMuestraDto } from '../../domain/dtos/muestra/update';
import { CreateMuestraDto } from "../../domain/dtos/muestra/create";

// Muestra se devuelve con su origen y un resumen del proveedor.
const MUESTRA_RELACIONES = {
    origen: true,
    proveedor: { select: { id_proveedor: true, nombre: true } },
} as const;


export class MuestraDataSourceImpl implements MuestraDataSource {

    async createMuestra(createMuestraDto: CreateMuestraDto): Promise<MuestraEntity> {
        const newMuestra = await prisma.muestra.create({
            include: MUESTRA_RELACIONES,
            data: createMuestraDto!
        });
        return MuestraEntity.fromObject(newMuestra);

    }

    async getMuestraById(id: string): Promise<MuestraEntity | null> {
        const muestra = await prisma.muestra.findFirst({
            include: MUESTRA_RELACIONES,
            where: {
                id_muestra: id,
                eliminado: false
            }
        });
        if (!muestra) return null;
        return MuestraEntity.fromObject(muestra);
    }
    async updateMuestra(id: string, updateMuestraDto: UpdateMuestraDto): Promise<MuestraEntity> {
        const muestra = await this.getMuestraById(id);
        const updateMuestra = await prisma.muestra.update({
            include: MUESTRA_RELACIONES,
            where: {
                id_muestra: id
            },
            data: updateMuestraDto.values
        });
        return MuestraEntity.fromObject(updateMuestra);
    }
    async deleteMuestra(id: string): Promise<MuestraEntity> {
        const muestra = await this.getMuestraById(id);
        const muestraDeleted = await prisma.muestra.update({
            include: MUESTRA_RELACIONES,
            where: {
                id_muestra: id
            },
            data: {
                eliminado: true
            }
        });
        return MuestraEntity.fromObject(muestraDeleted);
    }

    async getMuestras(): Promise<MuestraEntity[]> {
        const muestras = await prisma.muestra.findMany({
            include: MUESTRA_RELACIONES,
            where: {
                eliminado: false,
            }
        });
        return muestras.map(muestra => MuestraEntity.fromObject(muestra));
    }

    async getAllMuestras(): Promise<MuestraEntity[]> {
        const muestras = await prisma.muestra.findMany({ include: MUESTRA_RELACIONES });
        return muestras.map(muestra => MuestraEntity.fromObject(muestra));
    }

    async completeMuestra(id: string): Promise<MuestraEntity> {
        const muestra = await this.getMuestraById(id);
        const completedMuestra = await prisma.muestra.update({
            include: MUESTRA_RELACIONES,
            where: {
                id_muestra: id
            },
            data: {
                completado: true
            }
        });
        return MuestraEntity.fromObject(completedMuestra);
    }

    async getMuestrasConInventario(incluirEliminados: boolean = false): Promise<MuestraConInventarioEntity[]> {

        const muestras = await prisma.muestra.findMany({
            where: {
                ...(incluirEliminados ? {} : { eliminado: false })
            },
            include: {
                ...MUESTRA_RELACIONES,
                inventarioMuestras: {
                    include: { almacen: true }
                }
            }
        });

        return muestras.map(m => MuestraConInventarioEntity.fromObject(m));
    }

    async getMuestrasOwnedByStore(incluirEliminados: boolean = false): Promise<MuestraEntity[]> {
        const muestras = await prisma.muestra.findMany({
            include: MUESTRA_RELACIONES,
            where: {
                owned_by_store: true,
                ...(incluirEliminados ? {} : { eliminado: false }) // Si es false, solo trae activos
            }
        });
        return muestras.map(MuestraEntity.fromObject);
    }

    async getMuestrasByUserId(id_user: string, incluirEliminados: boolean = false): Promise<MuestraEntity[]> {
        const muestras = await prisma.muestra.findMany({
            include: MUESTRA_RELACIONES,
            where: {
                id_user,
                owned_by_store: false,
                ...(incluirEliminados ? {} : { eliminado: false })
            }
        });
        return muestras.map(MuestraEntity.fromObject);
    }



}