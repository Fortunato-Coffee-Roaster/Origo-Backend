import { TipoUser } from "../../../enums/tipo-user.enum";
import { CreateMuestraDto } from "../../dtos/muestra/create";
import { MuestraEntity } from "../../entities/muestra.entity";
import { MuestraRepository } from "../../repository/muestra.repository";
import { UserRepository } from "../../repository/user.repository";

export interface CreateMuestraUseCase {
    execute(createMuestraDto: CreateMuestraDto): Promise<MuestraEntity>;
}

export class CreateMuestra implements CreateMuestraUseCase {
    constructor(
        private readonly muestraRepository: MuestraRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async execute(createMuestraDto: CreateMuestraDto): Promise<MuestraEntity> {
        const id = await this.generarId(createMuestraDto);
        const [error, dto] = CreateMuestraDto.create({
            ...createMuestraDto,
            id_muestra: id,
        });
        return this.muestraRepository.createMuestra(dto!);
    }

    generarId = async (dto: CreateMuestraDto): Promise<string> => {
        // 1. Identificar si es cliente 
        const user = dto.id_user
            ? await this.userRepository.getUserById(dto.id_user)
            : null;
        const esCliente = user?.tipo === TipoUser.CLIENTE;


        // 2. Lógica de siglas base 
        const { productor, variedades, proceso } = dto;
        const nombres = productor.trim().split(' ');
        const inicialNombre = nombres[0]?.charAt(0).toUpperCase() || '';
        const inicialApellido = nombres[1]?.charAt(0).toUpperCase() || '';

        let inicialVariedad = '';
        if (variedades.length >= 3) {
            inicialVariedad = 'BL';
        } else {
            for (const variedad of variedades) {
                const palabras = variedad.trim().split(' ');
                if (palabras.length > 0) {
                    inicialVariedad += palabras[0].slice(0, 2).toUpperCase();
                    for (let i = 1; i < palabras.length; i++) {
                        inicialVariedad += palabras[i].charAt(0).toUpperCase();
                    }
                }
            }
        }

        let inicialProceso = '';
        if (proceso.toLowerCase() === 'natural') {
            inicialProceso = 'NA';
        } else if (proceso.toLowerCase() === 'honey') {
            inicialProceso = 'HO';
        } else if (proceso.toLowerCase() === 'lavado') {
            inicialProceso = '';
        }

        let idGenerado = `${inicialNombre}${inicialApellido}${inicialVariedad}${inicialProceso}`;

        // 3. NUMERO FINAL 
        // Usa getMuestrasOwnedByStore si es tienda, o por usuario si es cliente
        const numeroMuestraFinal = dto.owned_by_store
            ? (await this.muestraRepository.getMuestrasOwnedByStore(true)).length + 1
            : (await this.muestraRepository.getMuestrasByUserId(dto.id_user!, true)).length + 1;

        idGenerado = `${idGenerado}-${numeroMuestraFinal}`;

        // 4. LOTE PARA CLIENTE
        if (esCliente && !dto.owned_by_store) {
            const partesNombre = user!.nombre.trim().split(' ');
            const inicialNombreUser = partesNombre[0]?.charAt(0).toUpperCase() || '';
            const inicialApellidoUser = partesNombre[1]?.charAt(0).toUpperCase() || '';

            idGenerado = `${inicialNombreUser}${inicialApellidoUser}-${idGenerado}`;
        }

        return idGenerado;
    }
}