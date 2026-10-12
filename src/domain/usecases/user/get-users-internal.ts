import { UserEntity } from "../../entities/user/user.entity";
import { UserRepository } from "../../repository/user.repository";

export interface GetUsersInternalUseCase {
    execute(): Promise<UserEntity[]>;
}

export class GetUsersInternal implements GetUsersInternalUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(): Promise<UserEntity[]> {
        return this.userRepository.getUsersInternal();
    }
}