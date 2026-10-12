import { BlendLotesDto } from './../../../dtos/lotes/lote/blend-lotes';
import { create } from 'domain';
import { CreateLoteDto } from "../../../dtos/lotes/lote/create";
import { UpdateLoteDto } from "../../../dtos/lotes/lote/update";
import { LoteRepository } from "../../../repository/lote.repository";
import { PedidoRepository } from "../../../repository/pedido.repository";
import { UserRepository } from "../../../repository/user.repository";
import { LoteEntity } from '../../../entities/lote.entity';
import { TipoUser } from "../../../../enums/tipo-user.enum";

export interface BlendLotesUseCase {
    execute(dto: BlendLotesDto): Promise<LoteEntity>;
}

export class BlendLotes implements BlendLotesUseCase {
    constructor(
        private readonly loteRepository: LoteRepository,
        private readonly pedidoRepository: PedidoRepository,
        private readonly userRepository: UserRepository
    ) { }

    async execute(dto: BlendLotesDto): Promise<LoteEntity> {
        const lotes: [string, number][] = dto.lotes;
        const id_user: string = dto.id_user;
        const idc: string = dto.idc ? dto.idc : '';

        // 1) Validaciones
        if (lotes.length === 0) throw new Error('Debes enviar al menos un lote');
        if (lotes.length > 3) throw new Error('Sólo puedes mezclar hasta 3 lotes');

        // 2) Obtener y chequear lotes
        const ids = lotes.map(([id]) => id);
        const fetched = await Promise.all(ids.map(id => this.loteRepository.getLoteById(id)));
        // Filtramos nulos (ya que si alguno es null, lanzamos)
        const allLotes = lotes.map(([id, pesoRequerido]) => {
            const lote = fetched.find(l => l?.id_lote === id);
            if (!lote) throw new Error(`El lote ${id} no existe`);
            if (lote.eliminado) throw new Error(`El lote ${id} está eliminado`);
            if (lote.peso <= 0) throw new Error(`El lote ${id} tiene peso inválido`);
            if (lote.peso < pesoRequerido) {
                throw new Error(
                    `El lote ${id} no tiene suficiente peso: ` +
                    `disponible ${lote.peso} kg, pero solicitaste ${pesoRequerido} kg`
                );
            }
            return lote;
        });

        // 3) Actualizar pesos de orígenes
        await Promise.all(
            lotes.map(async ([id, peso]) => {
                const lote = allLotes.find(l => l.id_lote === id)!;
                const nuevoPeso = lote.peso - peso;
                const [_, updateDto] = UpdateLoteDto.update({ peso: nuevoPeso });
                await this.loteRepository.updateLote(id, updateDto!);
                if (nuevoPeso <= 0) {
                    await this.loteRepository.deleteLote(id);
                }
            })
        );

        // 4) Crear blend
        const pesoTotal = lotes.reduce((sum, [, p]) => sum + p, 0);

        // 4.1) Arrays únicos para ID
        const productoresArr = Array.from(new Set(allLotes.map(l => l.productor)));
        const procesosArr = Array.from(new Set(allLotes.map(l => l.proceso)));
        const variedadesArr = Array.from(new Set(allLotes.flatMap(l => l.variedades)));

        // 4.2) Strings para el DTO
        const productoresStr = productoresArr.join(', ');
        const fincasStr = Array.from(new Set(allLotes.map(l => l.finca))).join(', ');
        const distritoStr = Array.from(new Set(allLotes.map(l => l.distrito))).join(', ');
        const departamentosStr = Array.from(new Set(allLotes.map(l => l.departamento))).join(', ');
        const procesosStr = procesosArr.join(', ');

        // 4.3) Generar ID pasándole los arrays
        const blendId = await this.generateBlendId(
            productoresArr,
            variedadesArr,
            procesosArr,
            id_user,
            idc
        );
        // const existingBlend = await this.loteRepository.getLoteById(blendId);
        // if (existingBlend) {
        //     // Si ya existía, le sumamos el nuevo peso
        //     const nuevoPesoBlend = existingBlend.peso + pesoTotal;
        //     const [_, updateBlendDto] = UpdateLoteDto.update({ peso: nuevoPesoBlend });
        //     return this.loteRepository.updateLote(blendId, updateBlendDto!);
        // }

        // 5) Crear DTO con los strings ya formateados
        const [_, createDto] = CreateLoteDto.create({
            id_lote: blendId,
            productor: productoresStr,
            finca: fincasStr,
            distrito: distritoStr,
            departamento: departamentosStr,
            peso: pesoTotal,
            variedades: { set: variedadesArr },
            proceso: procesosStr,
            tipo_lote: 'Lote Verde',
            id_user,
        });

        return this.loteRepository.createLote(createDto!);
    }

    private async generateBlendId(
        productores: string[],
        variedadesFlat: string[],
        procesos: string[],
        id_user: string,
        idc?: string
    ): Promise<string> {
        // 0) Si nos pasan idc, lo usamos directamente
        if (idc) return idc;

        // 1) Iniciales de hasta 3 productores
        const prodInit = productores
            .slice(0, 3)
            .map(p => {
                const [n, a] = p.trim().split(' ');
                return `${n?.[0]?.toUpperCase() || ''}${a?.[0]?.toUpperCase() || ''}`;
            })
            .join('');

        // 2) Iniciales de variedades
        let varInit = '';
        if (variedadesFlat.length >= 3) {
            varInit = 'BL';
        } else {
            varInit = variedadesFlat
                .map(v => {
                    const parts = v.trim().split(' ');
                    let s = parts[0].slice(0, 2).toUpperCase();
                    for (let i = 1; i < parts.length; i++) {
                        s += parts[i][0].toUpperCase();
                    }
                    return s;
                })
                .join('');
        }

        // 3) Iniciales de procesos (hasta 3)
        const procInit = procesos
            .slice(0, 3)
            .map(p =>
                p.toLowerCase() === 'lavado'
                    ? ''
                    : p.toLowerCase() === 'natural'
                        ? 'NA'
                        : 'HO'
            )
            .join('');

        // 4) Sufijo numérico
        const totalLotes = (await this.loteRepository.getLotes()).length;
        const pedidosIds = await this.pedidoRepository.getLotesCreados();
        const uniquePedidos = new Set(pedidosIds);
        const suffix = totalLotes - uniquePedidos.size + 1;

        let idGenerado = `${prodInit}-${varInit}${procInit}-${suffix}`;

        // 5) Prefijo de cliente (si aplica)
        const user = await this.userRepository.getUserById(id_user);
        if (user?.tipo === TipoUser.CLIENTE) {
            const [n, a] = user.nombre.trim().split(' ');
            const uInit = `${n?.[0]?.toUpperCase() || ''}${a?.[0]?.toUpperCase() || ''}`;
            idGenerado = `${uInit}-${idGenerado}`;
        }

        return idGenerado;
    }
}
