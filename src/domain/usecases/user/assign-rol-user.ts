import { UpdateUserDto } from "../../dtos/user/update";
import { UserRepository } from "../../repository/user.repository";
import { TipoUser } from "../../../enums/tipo-user.enum";
import { UserEntity } from "../../entities/user/user.entity";

export interface AssignRoleToUserUseCase {
    execute(id_user: string , id_rol: string): Promise<UserEntity>;
}

export class AssignRoleToUser implements AssignRoleToUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(id_user: string, id_rol: string): Promise<UserEntity> {
        // El rol de permisos vive en UserStaff: un cliente no entra al sistema
        // y un admin tiene acceso total, así que ninguno de los dos lleva rol.
        const user = await this.userRepository.getUserById(id_user);
        if (!user) throw new Error('Usuario no encontrado');
        if (user.tipo !== TipoUser.STAFF) {
            throw new Error('Solo se puede asignar un rol a usuarios de tipo STAFF');
        }

        return this.userRepository.assignRoleToUser(id_user, id_rol);
    }
}
