import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { envs } from '../../config/envs';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no presente' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, envs.JWT_SECRET) as any;

    if (!decoded.id || !decoded.email || !decoded.tipo) {
      return res.status(401).json({ message: 'Token inválido (estructura incompleta)' });
    }

    // Solo STAFF necesita rol; ADMIN no lleva rol
    if (decoded.tipo === 'STAFF' && !decoded.rolId) {
      return res.status(401).json({ message: 'Token inválido (STAFF sin rol)' });
    }

    req.user = {
      id_user: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo,
      id_rol: decoded.rolId ?? null,
      rol: decoded.rol ?? ''
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};