import { prisma } from "../../data/postgres";
import { ProveedorDataSource } from "../../domain/datasources/proveedor.datasource";
import { CreateProveedorDto } from "../../domain/dtos/proveedor/create";
import { UpdateProveedorDto } from "../../domain/dtos/proveedor/update";
import { ProveedorEntity } from "../../domain/entities/proveedor.entity";

export class ProveedorDataSourceImpl implements ProveedorDataSource {

    async createProveedor(dto: CreateProveedorDto): Promise<ProveedorEntity> {
        const proveedor = await prisma.proveedor.create({
            data: {
                nombre: dto.nombre,
                documento: dto.documento,
                telefono: dto.telefono,
                activo: dto.activo,
            },
        });
        return ProveedorEntity.fromObject(proveedor);
    }

    async updateProveedor(id: string, dto: UpdateProveedorDto): Promise<ProveedorEntity> {
        const proveedor = await prisma.proveedor.update({
            where: { id_proveedor: id },
            data: dto.values,
        });
        return ProveedorEntity.fromObject(proveedor);
    }

    async getProveedorById(id: string): Promise<ProveedorEntity | null> {
        const proveedor = await prisma.proveedor.findUnique({ where: { id_proveedor: id } });
        if (!proveedor) return null;
        return ProveedorEntity.fromObject(proveedor);
    }

    async getProveedorByNombre(nombre: string): Promise<ProveedorEntity | null> {
        const proveedor = await prisma.proveedor.findFirst({
            where: { nombre: { equals: nombre, mode: 'insensitive' } },
        });
        if (!proveedor) return null;
        return ProveedorEntity.fromObject(proveedor);
    }

    async getProveedores(soloActivos: boolean): Promise<ProveedorEntity[]> {
        const proveedores = await prisma.proveedor.findMany({
            where: soloActivos ? { activo: true } : undefined,
            orderBy: { nombre: 'asc' },
        });
        return proveedores.map(p => ProveedorEntity.fromObject(p));
    }
}
