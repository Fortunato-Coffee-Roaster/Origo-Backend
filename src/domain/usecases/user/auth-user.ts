// src/domain/usecases/user/auth-user.ts
import { Encryption } from "../../../config/bcrypt";
import { Jwt, TokenPayload } from "../../../config/jwt";
import { UserRepository } from "../../repository/user.repository";
import { TipoUser } from '../../../enums/tipo-user.enum';
import { UserStaffEntity } from "../../entities/user/user-staff.entity";
import { UserEntity } from "../../entities/user/user.entity";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  // Usuario sin password. id_rol va siempre: el del staff, o null si es admin.
  user: Omit<UserEntity, 'password'> & { id_rol: string | null };
}

export interface AuthUserUseCase {
  execute(email: string, password: string): Promise<AuthResult>;
}

export class AuthUser implements AuthUserUseCase {
  constructor(
    private readonly userRepository: UserRepository
  ) { }

  async execute(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');

    // Caso 1: Clientes no pueden autenticarse
    if (user.tipo === TipoUser.CLIENTE) {
      throw new Error('No tienes permisos para acceder');
    }
    
    // si el usuario se encuentra eliminado o inactivo, no se le permite autenticarse
    if (user.eliminado) {
      throw new Error('Usuario no activo o eliminado');
    }

    const valid = await Encryption.comparePassword(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    const payload: TokenPayload = {
      id: user.id_user,
      email: user.email,
      // UUID del rol de permisos. Solo STAFF tiene rol; en ADMIN va null.
      rolId: user instanceof UserStaffEntity ? user.id_rol : null,
      tipo: user.tipo,
    };

    const accessToken = Jwt.signAccess(payload);
    const refreshToken = Jwt.signRefresh(payload);

    const { password: _, ...userData } = user;
    return { accessToken, refreshToken, user: { ...userData, id_rol: payload.rolId } };
  }
}