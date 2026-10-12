
import { PedidoConLoteEntity, PedidoEntity } from "../../domain/entities/pedido.entity";
import { CreatePedidoDto } from '../../domain/dtos/pedido/create';
import { prisma } from "../../data/postgres";
import { UpdatePedidoDto } from '../../domain/dtos/pedido/update';
import { PedidoDatasource } from "../../domain/datasources/pedido.datasource";
import { LoteEntity } from "../../domain/entities/lote.entity";
import { CreatePedido } from '../../domain/usecases/pedido/create-pedido';



// El cliente de un pedido es un UserCliente, y su nombre vive en User (un nivel
// más adentro). Se pide así y se aplana a { id_user, nombre }, que es la forma
// que ya esperan PedidoEntity y PedidoConLoteEntity.
const CLIENTE_SELECT = {
    select: {
        id_user: true,
        user: {
            select: {
                nombre: true,
            },
        },
    },
} as const;

type PedidoConCliente = { cliente: { id_user: string; user: { nombre: string } } | null };

const aplanarCliente = <T extends PedidoConCliente>(pedido: T) => ({
    ...pedido,
    cliente: pedido.cliente
        ? { id_user: pedido.cliente.id_user, nombre: pedido.cliente.user.nombre }
        : null,
});

export class PedidoDataSourceImpl implements PedidoDatasource {


    async createPedido(createPedidoDto: CreatePedidoDto): Promise<PedidoEntity> {
        const newPedido = await prisma.pedido.create({
            data: createPedidoDto
        });
        return PedidoEntity.fromObject(newPedido);
    }


    async getPedidoById(id: string): Promise<PedidoEntity | null> {
        const pedido = await prisma.pedido.findFirst({
            where: {
                id_pedido: id,
                eliminado: false
            }
        });
        if (!pedido) return null;
        return PedidoEntity.fromObject(pedido);
    }
    async updatePedido(id: string, updatePedidoDto: UpdatePedidoDto): Promise<PedidoEntity> {
        const pedido = this.getPedidoById(id);
        const updatedPedido = await prisma.pedido.update({
            where: { id_pedido: id },
            data: updatePedidoDto.values
        });
        return PedidoEntity.fromObject(updatedPedido);
    }
    async deletePedido(id: string): Promise<PedidoEntity> {
        const pedido = this.getPedidoById(id);
        const pedidoEliminado = await prisma.pedido.update({
            where: { id_pedido: id },
            data: { eliminado: true }
        });
        return PedidoEntity.fromObject(pedidoEliminado);

    }
    async getPedidosByEstado(estado: string): Promise<PedidoEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                estado_pedido: estado,
                eliminado: false
            },
            orderBy: {
                fecha_tueste: 'desc'
            }
        });
        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }
    async getPedidosByCliente(id_user: string): Promise<PedidoEntity[]> {
        const user = prisma.user.findFirst({
            where: {
                id_user: id_user,
            }
        });

        if (!user) throw new Error('El cliente no existe');
        const pedidos = await prisma.pedido.findMany({
            where: {
                id_user: id_user,
                eliminado: false
            }
        });
        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }


    async completarPedido(id: string, id_completado_por: string): Promise<PedidoEntity> {
        const pedido = await this.getPedidoById(id);
        const pedidoCompletado = await prisma.pedido.update({
            where: { id_pedido: id },
            data: {
                estado_pedido: 'Completado',
                completado_por_id: id_completado_por,
                fecha_completado: new Date()
            }
        });
        return PedidoEntity.fromObject(pedidoCompletado);




    }

    async getAllPedidos(): Promise<PedidoEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
            },
            include: {
                cliente: CLIENTE_SELECT,
            },
        });

        return pedidos.map((pedido) =>
            PedidoEntity.fromObject({
                ...aplanarCliente(pedido),
                usuario_nombre: pedido.cliente?.user.nombre ?? null,
            })
        );
    }

    async getHistoricoPedidos(): Promise<PedidoEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
            }
        });
        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }


    async getPedidosOrdenTueste(): Promise<PedidoEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
                tipo_pedido: {
                    equals: 'Orden Tueste',
                    mode: 'insensitive'
                },
                estado_pedido: { not: 'Completado' }
            }
        });

        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }

    async GetPedidosOrdenTuesteByFecha(fecha: Date): Promise<PedidoEntity[]> {
        const inicio = new Date(fecha);
        inicio.setHours(0, 0, 0, 0);

        const fin = new Date(fecha);
        fin.setHours(23, 59, 59, 999);

        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
                tipo_pedido: {
                    equals: 'Orden Tueste',
                    mode: 'insensitive'
                },
                fecha_tueste: {
                    gte: inicio,
                    lte: fin,
                }
            }
        });

        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }

    async getPedidosByLote(id_lote: string): Promise<PedidoEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                id_lote: id_lote,
                eliminado: false
            }
        });
        if (!pedidos) throw new Error('No se encontraron pedidos para el lote especificado');
        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }

    async getLotesCreados(): Promise<string[]> {
        const registros = await prisma.pedido.findMany({
            where: {
                tipo_pedido: { in: ['Tostado Verde', 'Venta Verde'] },
                eliminado: false
            },
            select: {
                id_nuevoLote: true
            }
        });

        // Extraigo solo el campo id_nuevoLote de cada registro, filtrando los nulos
        return registros.map(r => r.id_nuevoLote).filter((id): id is string => id !== null);
    }


    async getLotesTostadoCreados(): Promise<string[]> {
        const registros = await prisma.pedido.findMany({
            where: {
                tipo_pedido: 'Orden Tueste',
                eliminado: false
            },
            select: {
                id_nuevoLote_tostado: true
            }
        });

        // Extraigo solo el campo id_lote_tostado de cada registro, filtrando los nulos
        return registros.map(r => r.id_nuevoLote_tostado).filter((id): id is string => id !== null);
    }

    async setFacturado(state: boolean, id_pedido: string): Promise<PedidoEntity> {
        const pedido = await prisma.pedido.update({
            where: {
                id_pedido: id_pedido
            },
            data: {
                facturado: state
            }
        })
        return PedidoEntity.fromObject(pedido);
    }

    async getPedidosConLote(): Promise<PedidoConLoteEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
            },
            include: {
                lote: true,
                cliente: CLIENTE_SELECT,
            },
            orderBy: {
                fecha_registro: 'desc',
            },
        });

        return pedidos.map(pedido => PedidoConLoteEntity.fromObject(aplanarCliente(pedido)));
    }

    async getPedidoConLote(id: string): Promise<PedidoConLoteEntity> {
        const pedido = await prisma.pedido.findFirst({
            where: {
                id_pedido: id,
                eliminado: false,
            },
            include: {
                lote: true,
                cliente: CLIENTE_SELECT,
            },
        });

        if (!pedido) {
            throw new Error("No existe el pedido");
        }

        return PedidoConLoteEntity.fromObject(aplanarCliente(pedido));
    }

    async getPedidosConLoteByEstadoYTipo(
        estado: string,
        tipo: string
    ): Promise<PedidoConLoteEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
                estado_pedido: estado,
                tipo_pedido: tipo,
            },
            include: {
                lote: true,
                cliente: CLIENTE_SELECT,
            },
            orderBy: {
                fecha_registro: 'desc',
            },
        });

        return pedidos.map(pedido => PedidoConLoteEntity.fromObject(aplanarCliente(pedido)));
    }

    async getPedidosByRango(desde: Date, hasta: Date): Promise<PedidoEntity[]> {
        const inicio = new Date(desde);
        inicio.setHours(0, 0, 0, 0);

        const fin = new Date(hasta);
        fin.setHours(23, 59, 59, 999);

        const pedidos = await prisma.pedido.findMany({
            where: {
                eliminado: false,
                fecha_registro: {
                    gte: inicio,
                    lte: fin,
                }
            }
        });

        return pedidos.map(PedidoEntity.fromObject);
    }

    async getPedidosOwnedByStore(incluirEliminados: boolean = false): Promise<PedidoEntity[]> {
        const pedidos = await prisma.pedido.findMany({
            where: {
                owned_by_store: true,
                ...(incluirEliminados ? {} : { eliminado: false })
            }
        });
        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }

    async getPedidosByUserId(id_user: string, incluirEliminados: boolean = false): Promise<PedidoEntity[]> {
        const user = await prisma.user.findUnique({
            where: { id_user, eliminado: false }
        });
        if (!user) throw new Error('El cliente no existe');

        const pedidos = await prisma.pedido.findMany({
            where: {
                id_user,
                owned_by_store: false,
                ...(incluirEliminados ? {} : { eliminado: false })
            }
        });
        return pedidos.map((pedido) => PedidoEntity.fromObject(pedido));
    }
}
