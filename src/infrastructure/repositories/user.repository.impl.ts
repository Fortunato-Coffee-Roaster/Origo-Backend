import { UserDataSource } from "../../domain/datasources/user.datasource";
import { CreateUserDto } from "../../domain/dtos/user/create";
import { UpdateUserDto } from "../../domain/dtos/user/update";
import { UserEntity } from "../../domain/entities/user/user.entity";
import { UserRepository } from "../../domain/repository/user.repository";


export class UserRepositoryImpl implements UserRepository {

  constructor(
    private readonly datasource: UserDataSource
  ) { }
  getAllUsers(): Promise<UserEntity[]> {
    return this.datasource.getAllUsers();
  }
  createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.datasource.createUser(createUserDto);
  }
  getUserById(id: string): Promise<UserEntity | null> {
    return this.datasource.getUserById(id);
  }
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.datasource.updateUser(id, updateUserDto);
  }
  deleteUser(id: string): Promise<UserEntity> {
    return this.datasource.deleteUser(id);
  }
  getUsersByRole(role: string): Promise<UserEntity[]> {
    return this.datasource.getUsersByRole(role);
  }
  findByEmail(email: string): Promise<UserEntity | null> {
    return this.datasource.findByEmail(email);
  }
  getRole(id: string): Promise<string> {
    return this.datasource.getRole(id);
  }
  assignRoleToUser(id_user: string, id_rol: string): Promise<UserEntity> {
    return this.datasource.assignRoleToUser(id_user, id_rol);
  }
  getUsersInternal(): Promise<UserEntity[]> {
    return this.datasource.getUsersInternal();
  }

  findByDocumento(documento_identidad: string): Promise<UserEntity | null> {
    return this.datasource.findByDocumento(documento_identidad);
  }

}