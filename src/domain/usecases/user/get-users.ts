import { UserEntity } from "../../entities/user/user.entity";
import { UserRepository } from "../../repository/user.repository";

export interface GetAllUserUseCase{
    execute(): Promise<UserEntity[]>;
};

export class GetAllUsers implements GetAllUserUseCase{
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(): Promise<UserEntity[]>{ 
        return this.userRepository.getAllUsers();
    }
}