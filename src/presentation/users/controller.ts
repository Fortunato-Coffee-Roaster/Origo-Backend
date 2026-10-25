import { AssignRoleToUser } from './../../domain/usecases/user/assign-rol-user';
import { AuthUser } from './../../domain/usecases/user/auth-user';
import { Request, Response } from 'express';
import { UserRepository } from '../../domain/repository/user.repository';
import { CreateUser } from '../../domain/usecases/user/create-user';
import { CreateUserDto } from '../../domain/dtos/user/create';
import { GetUserById } from '../../domain/usecases/user/get-user';

import { UpdateUser } from '../../domain/usecases/user/update-user';
import { DeleteUser } from '../../domain/usecases/user/delete-user';
import { GetUsersRol } from '../../domain/usecases/user/get-user-rol';
import { UpdateUserDto } from '../../domain/dtos/user/update';

import { RefreshAccessToken } from '../../domain/usecases/user/refresh-token';
import { AuthUserByPin } from '../../domain/usecases/user/auth-user-pin';
import { ChangePassword } from '../../domain/usecases/user/change-password';
import { PasswordResetTokenRepository } from '../../domain/repository/passwordResetToken.repository';
import { EmailService } from '../../config/email';
import { ForgotPassword } from '../../domain/usecases/passwordResetToken/forgotPassword';
import { ResetPassword } from '../../domain/usecases/passwordResetToken/resetPassword';




export class UserController {


  // DI
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService
  ) { }

  private handleError = (res: Response, error: any) => {
    // ⚠️ nunca res.json({ error }) con un Error: se serializa como {}
    return res.status(400).json({ error: error?.message ?? String(error) });
  };

  // El body lleva `tipo` (CLIENTE, STAFF o ADMIN) y los campos de ese tipo.
  // CreateUserDto.create devuelve el DTO que corresponde.
  public createUser = async (req: Request, res: Response) => {
    const [error, createUserDto] = CreateUserDto.create(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    new CreateUser(this.userRepository)
      .execute(createUserDto!)
      .then(user => res.json(user))
      .catch(error => this.handleError(res, error));
  }

  public getUserById = async (req: Request, res: Response) => {
    new GetUserById(this.userRepository)
      .execute(req.params.id)
      .then(user => res.json(user))
      .catch(error => this.handleError(res, error));

  }

  // El body no lleva `tipo`: UpdateUser lo toma del usuario guardado y
  // rechaza campos que pertenezcan a la tabla de otro tipo.
  public updateUser = async (req: Request, res: Response) => {
    const user_id = req.params.id;
    const [error, updateUserDto] = UpdateUserDto.update({ ...req.body, id_user: user_id });
    if (error) {
      return res.status(400).json({ error });
    }
    new UpdateUser(this.userRepository)
      .execute(user_id, updateUserDto!)
      .then(user => res.json(user))
      .catch(error => this.handleError(res, error));

  }

  public deleteUser = async (req: Request, res: Response) => {
    const user_id = req.params.id;
    new DeleteUser(this.userRepository)
      .execute(user_id)
      .then(user => res.json(user))
      .catch(error => this.handleError(res, error));
  }

  // :role ahora es el tipo de usuario: cliente, staff o admin.
  public getUsersByRole = async (req: Request, res: Response) => {
    const role = req.params.role;
    new GetUsersRol(this.userRepository)
      .execute(role)
      .then(users => res.json(users))
      .catch(error => this.handleError(res, error));
  }

  public AssignRoleToUser = async (req: Request, res: Response) => {
    const user_id = req.params.id_user;
    const role_id = req.params.id_rol;
    new AssignRoleToUser(this.userRepository)
      .execute(user_id, role_id)
      .then(user => res.json(user))
      .catch(error => this.handleError(res, error));
  }

  public getAllUsers = async (req: Request, res: Response) => {
    this.userRepository.getAllUsers()
      .then(users => res.json(users))
      .catch(error => this.handleError(res, error));
  }

  public getUsersInternal = async (req: Request, res: Response) => {
    this.userRepository.getUsersInternal()
      .then(users => res.json(users))
      .catch(error => this.handleError(res, error));
  }


  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const { accessToken, refreshToken, user } =
        await new AuthUser(this.userRepository).execute(email, password);

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id_user: user.id_user,
          email: user.email,
          tipo: user.tipo,
          id_rol: user.id_rol
        }
      });

    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };


  public refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token no presente' });
    }

    try {
      const newAccessToken =
        await new RefreshAccessToken().execute(refreshToken);

      return res.json({
        accessToken: newAccessToken
      });

    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  };



  // ⚠️ PENDIENTE: este handler no envía respuesta cuando hay usuario.
  // La doc de GET /me espera { id_user, email, nombre, tipo, id_rol, permisos }.
  public getSessionInfo = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
  };

  public logout = async (req: Request, res: Response) => {
    try {
      // Limpiar cookies (debes usar los mismos nombres que al setearlas)
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });

      return res.json({ message: 'Logout exitoso' });

    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public loginPin = async (req: Request, res: Response) => {
    const { documento_identidad, pin } = req.body;

    if (!documento_identidad || !pin) {
      return res.status(400).json({ error: 'DNI y PIN son requeridos' });
    }

    try {
      const { accessToken, refreshToken, user } =
        await new AuthUserByPin(this.userRepository).execute(documento_identidad, pin);

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id_user: user.id_user,
          email: user.email,
          tipo: user.tipo,
          id_rol: user.id_rol
        }
      });

    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  public changePassword = async (req: Request, res: Response) => {
    const id_user = req.params.id;
    const requester = req.user;

    if (requester?.id_user !== id_user) {
      return res.status(403).json({ error: 'No tienes permiso para cambiar esta contraseña' });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      await new ChangePassword(this.userRepository)
        .execute(id_user, currentPassword, newPassword);

      return res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      await new ForgotPassword(this.userRepository, this.passwordResetTokenRepository, this.emailService)
        .execute(email, req.ip);

      return res.json({ message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
      await new ResetPassword(this.userRepository, this.passwordResetTokenRepository)
        .execute(token, newPassword);

      return res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
