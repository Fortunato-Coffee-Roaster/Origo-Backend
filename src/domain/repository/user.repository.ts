import { CreateUserDto } from "../dtos/user/create";
import { UpdateUserDto } from "../dtos/user/update";
import { UserEntity } from "../entities/user/user.entity";

export abstract class UserRepository {
    abstract createUser(createUserDto : CreateUserDto): Promise<UserEntity>;
    abstract getUserById(id: string): Promise<UserEntity | null>;
    abstract updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity>;
    abstract deleteUser(id: string): Promise<UserEntity>;
    abstract getUsersByRole(role: string): Promise<UserEntity[]>;
    abstract getUsersInternal(): Promise<UserEntity[]>;
    abstract findByEmail(email: string): Promise<UserEntity | null>;
    abstract getAllUsers(): Promise<UserEntity[]>;
    abstract getRole(id:string): Promise<string>;
    abstract assignRoleToUser(id_user: string, id_rol: string): Promise<UserEntity>;
    abstract findByDocumento(documento_identidad: string): Promise<UserEntity | null>;

  }