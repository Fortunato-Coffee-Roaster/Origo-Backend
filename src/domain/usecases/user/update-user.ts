// src/domain/usecases/user/update-user.ts
import { UpdateUserDto } from "../../dtos/user/update";
import { UserRepository } from "../../repository/user.repository";
import { Encryption } from "../../../config/bcrypt";
import { UserEntity } from "../../entities/user/user.entity";

export interface UpdateUserUseCase {
    execute(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity>;
}

export class UpdateUser implements UpdateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        // El tipo no viene en el body ni se puede editar: sale del usuario guardado.
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new Error('Usuario no encontrado');

        const cambios: { [key: string]: any } = { id_user: id };
        if (updateUserDto.password) {
            cambios.password = await Encryption.hashPassword(updateUserDto.password);
        }

        // Arma el DTO de su tipo (cliente, staff o admin) y rechaza datos que
        // pertenezcan a la tabla de otro tipo.
        const [error, dto] = updateUserDto.paraTipo(user.tipo, cambios);
        if (error || !dto) {
            throw new Error(error ?? 'No se pudo construir el DTO de actualización');
        }

        return this.userRepository.updateUser(id, dto);
    }
}
