import { UserRepository } from "../../repository/user.repository";
import { CreateUserDto } from '../../dtos/user/create';
import { Encryption } from "../../../config/bcrypt";
import { UserEntity } from "../../entities/user/user.entity";

export interface CreateUserUseCase {
    execute(createUserDto: CreateUserDto): Promise<UserEntity>;
}

export class CreateUser implements CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute( createUserDto: CreateUserDto): Promise<UserEntity> {
        const hashedPassword = await Encryption.hashPassword(createUserDto.password);
        const [,dto] = CreateUserDto.create({
            ...createUserDto,
            password: hashedPassword
        });
        if (!dto) {
            throw new Error('Invalid user data');
        }
        
        return this.userRepository.createUser(dto);
    }


}