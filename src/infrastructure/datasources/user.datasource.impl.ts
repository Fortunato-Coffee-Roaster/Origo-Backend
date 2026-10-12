import { Prisma } from "@prisma/client";
import { prisma } from "../../data/postgres";
import { UserDataSource } from "../../domain/datasources/user.datasource";
import { CreateUserAdminDto, CreateUserClienteDto, CreateUserDto, CreateUserStaffDto } from "../../domain/dtos/user/create";
import { UpdateUserClienteDto, UpdateUserDto, UpdateUserStaffDto } from '../../domain/dtos/user/update';
import { TipoUser } from "../../enums/tipo-user.enum";
import { UserEntity } from "../../domain/entities/user/user.entity";
import { UserFactory } from "../../domain/entities/user/user.factory";

// Toda lectura de User trae sus tablas hijas: UserFactory las necesita para
// armar UserClienteEntity / UserStaffEntity / UserAdminEntity.
const USER_INCLUDE = { cliente: true, staff: true, admin: true } as const;

export class UserDataSourceImpl implements UserDataSource {

  // Crea la fila de User y la de su tabla hija en una sola operación.
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const data: Prisma.UserCreateInput = { ...createUserDto.values };

    if (createUserDto instanceof CreateUserClienteDto) {
      data.cliente = { create: createUserDto.clienteValues };
    } else if (createUserDto instanceof CreateUserStaffDto) {
      data.staff = { create: createUserDto.staffValues };
    } else if (createUserDto instanceof CreateUserAdminDto) {
      data.admin = { create: {} };
    } else {
      throw new Error('Tipo de usuario no soportado');
    }

    const newUser = await prisma.user.create({
      data,
      include: USER_INCLUDE,
    });
    return UserFactory.fromObject(newUser);
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findFirst({
      where: {
        id_user: id,
        eliminado: false
      },
      include: USER_INCLUDE,
    });
    if (!user) return null;
    return UserFactory.fromObject(user);
  }

  // Actualiza User y, si el DTO es de cliente o de staff, también su tabla hija.
  // Un UpdateUserDto base (ej. el de ChangePassword) solo toca la tabla User.
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUserById(id);
    if (!user) throw new Error("Usuario no encontrado");

    // id_user es la PK: se usa en el where, no se reescribe.
    const { id_user: _, ...userValues } = updateUserDto.values;
    const data: Prisma.UserUpdateInput = { ...userValues };

    if (updateUserDto instanceof UpdateUserClienteDto) {
      if (user.tipo !== TipoUser.CLIENTE) throw new Error('El usuario no es de tipo CLIENTE');
      const clienteValues = updateUserDto.clienteValues;
      if (Object.keys(clienteValues).length > 0) {
        data.cliente = { upsert: { create: clienteValues, update: clienteValues } };
      }
    }

    if (updateUserDto instanceof UpdateUserStaffDto) {
      if (user.tipo !== TipoUser.STAFF) throw new Error('El usuario no es de tipo STAFF');
      const staffValues = updateUserDto.staffValues;
      if (Object.keys(staffValues).length > 0) {
        data.staff = { upsert: { create: staffValues, update: staffValues } };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id_user: id },
      data,
      include: USER_INCLUDE,
    });
    return UserFactory.fromObject(updatedUser);
  }

  async deleteUser(id: string): Promise<UserEntity> {
    const deletedUser = await prisma.user.update({
      where: { id_user: id },
      data: { eliminado: true },
      include: USER_INCLUDE,
    });
    return UserFactory.fromObject(deletedUser);
  }

  // `role` ahora es el tipo de usuario: CLIENTE, STAFF o ADMIN (acepta minúsculas).
  async getUsersByRole(role: string): Promise<UserEntity[]> {
    const tipo = String(role ?? '').toUpperCase() as TipoUser;
    if (!Object.values(TipoUser).includes(tipo)) {
      throw new Error('Tipo de usuario inválido: debe ser CLIENTE, STAFF o ADMIN');
    }

    const users = await prisma.user.findMany({
      where: {
        tipo,
        eliminado: false
      },
      include: USER_INCLUDE,
    });
    return users.map(UserFactory.fromObject);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: USER_INCLUDE,
    });
    if (!user) return null;
    return UserFactory.fromObject(user);
  }

  async getAllUsers(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: {
        eliminado: false
      },
      include: USER_INCLUDE,
    });
    return users.map(UserFactory.fromObject);
  }

  // Antes devolvía el texto de `rol`; ahora devuelve el tipo del usuario.
  async getRole(id: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id_user: id }
    });
    if (!user) throw new Error("Usuario no encontrado");
    return user.tipo;
  }

  // El rol de permisos vive en UserStaff, así que solo se asigna a usuarios STAFF.
  async assignRoleToUser(id_user: string, id_rol: string): Promise<UserEntity> {
    const user = await this.getUserById(id_user);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.tipo !== TipoUser.STAFF) {
      throw new Error('Solo se puede asignar un rol a usuarios de tipo STAFF');
    }

    const role = await prisma.rol.findUnique({
      where: { id_rol }
    });
    if (!role) throw new Error("Rol no encontrado");

    const updatedUser = await prisma.user.update({
      where: { id_user },
      data: {
        staff: {
          upsert: {
            create: { id_rol },
            update: { id_rol },
          },
        },
      },
      include: USER_INCLUDE,
    });
    return UserFactory.fromObject(updatedUser);
  }

  // Internos = todo lo que no es cliente (staff y admin).
  async getUsersInternal(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: {
        eliminado: false,
        tipo: {
          not: TipoUser.CLIENTE
        }
      },
      include: USER_INCLUDE,
    });

    return users.map(UserFactory.fromObject);
  }

  async findByDocumento(documento_identidad: string): Promise<UserEntity | null> {
    const user = await prisma.user.findFirst({
      where: {
        documento_identidad,
        eliminado: false,
      },
      include: USER_INCLUDE,
    });
    if (!user) return null;
    return UserFactory.fromObject(user);
  }

}
