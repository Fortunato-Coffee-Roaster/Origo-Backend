import { prisma } from "../../data/postgres";
import { OrigenDataSource } from "../../domain/datasources/origen.datasource";
import { FiltrosOrigenDto } from "../../domain/dtos/origen/filtros";
import { OrigenEntity } from "../../domain/entities/origen.entity";

export class OrigenDataSourceImpl implements OrigenDataSource {

    async getOrigenes(filtros: FiltrosOrigenDto): Promise<OrigenEntity[]> {
        const origenes = await prisma.origen.findMany({
            where: {
                ...(filtros.departamento && { departamento: { equals: filtros.departamento, mode: 'insensitive' } }),
                ...(filtros.provincia && { provincia: { equals: filtros.provincia, mode: 'insensitive' } }),
            },
            orderBy: [{ departamento: 'asc' }, { provincia: 'asc' }, { distrito: 'asc' }],
        });
        return origenes.map(o => OrigenEntity.fromObject(o));
    }

    async getOrigenById(id: string): Promise<OrigenEntity | null> {
        const origen = await prisma.origen.findUnique({ where: { id_origen: id } });
        if (!origen) return null;
        return OrigenEntity.fromObject(origen);
    }
}
