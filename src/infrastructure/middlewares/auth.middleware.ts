import { Request, Response, NextFunction } from 'express';
import { Jwt } from '../../config/jwt';
import { TipoUser } from '../../enums/tipo-user.enum';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no presente' });
  }

  try {
    // Valida firma, expiración y estructura (id, email, tipo)
    const payload = Jwt.verifyAccess(authHeader.split(' ')[1]);

    // Solo STAFF necesita rol; ADMIN no lleva rol
    if (payload.tipo === TipoUser.STAFF && !payload.rolId) {
      return res.status(401).json({ message: 'Token inválido (STAFF sin rol)' });
    }

    req.user = {
      id_user: payload.id,
      email: payload.email,
      tipo: payload.tipo,
      id_rol: payload.rolId,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ message: err?.message ?? 'Token inválido o expirado' });
  }
};