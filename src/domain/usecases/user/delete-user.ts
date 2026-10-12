import { UserEntity } from "../../entities/user/user.entity";
import { UserRepository } from "../../repository/user.repository";

export interface DeleteUserUseCase {
    execute(id:string): Promise<UserEntity>
}

export class DeleteUser implements DeleteUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(id: string): Promise<UserEntity> {
        return this.userRepository.deleteUser(id);
    }
}