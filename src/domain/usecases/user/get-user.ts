import { UserEntity } from "../../entities/user/user.entity";
import { UserRepository } from "../../repository/user.repository";

export interface GetUserUseByIdcase{
    execute(id: string): Promise<UserEntity| null>;
};

export class GetUserById implements GetUserUseByIdcase{
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(id: string): Promise<UserEntity| null>{ 
        return this.userRepository.getUserById(id);
    }
}