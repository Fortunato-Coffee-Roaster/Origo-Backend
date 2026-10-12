import { UserRepository } from "../../repository/user.repository";
import { TipoUser } from "../../../enums/tipo-user.enum";
import { UserEntity } from "../../entities/user/user.entity";

export interface GetUsersRolUseCase {
    execute(rol:string): Promise<UserEntity[]>;
}

export class GetUsersRol implements GetUsersRolUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    // El parámetro se sigue llamando `rol` para no romper el controller ni la ruta,
    // pero ahora filtra por `tipo`. Acepta "cliente" o "CLIENTE".
    async execute(rol: string): Promise<UserEntity[]> {
        const tipo = String(rol ?? '').toUpperCase();
        if (!Object.values(TipoUser).includes(tipo as TipoUser)) {
            throw new Error('Tipo de usuario inválido: debe ser CLIENTE, STAFF o ADMIN');
        }

        return this.userRepository.getUsersByRole(tipo);
    }
}
