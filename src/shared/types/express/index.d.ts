import { JwtPayload } from '../../../domain/entities/jwt-payload.entity';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;

      // Permisos consultados sin bloquear (marcarPermiso).
      permisos?: Record<string, boolean>;

      auditContext?: {
        entidad: string;
        accion: string;
      };
    }
  }
}
