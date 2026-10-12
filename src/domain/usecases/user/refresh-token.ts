// src/domain/usecases/user/refresh-token.ts
import jwt from 'jsonwebtoken';
import { envs } from '../../../config/envs';

interface RefreshTokenUseCase {
  execute(refreshToken: string): string;
}

export class RefreshAccessToken implements RefreshTokenUseCase {
  execute(refreshToken: string): string {
    try {
      const payload = jwt.verify(refreshToken, envs.JWT_REFRESH_SECRET) as any;

      const newAccessToken = jwt.sign(
        {
          id: payload.id,
          email: payload.email,
          tipo: payload.tipo, // reemplaza al claim `rol`
        },
        envs.JWT_SECRET,
        { expiresIn: '50m' }
      );

      return newAccessToken;
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }
}
