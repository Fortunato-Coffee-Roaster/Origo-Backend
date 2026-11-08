import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../data/postgres';
import { envs } from '../../config/envs';

export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user; // JwtPayload | undefined

      // 1️⃣ No autenticado
      if (!user) {
        return res.status(401).json({
          message: 'No autenticado',
        });
      }

      // 🔓 Super admin: bypass total por id_rol, no consulta RolPermiso
      if (envs.SUPER_ADMIN_ROL_ID && user.id_rol === envs.SUPER_ADMIN_ROL_ID) {
        return next();
      }

      // 2️⃣ Sin rol
      if (!user.id_rol) {
        return res.status(403).json({
          message: 'Usuario sin rol asignado',
        });
      }

      const permiso = await prisma.permiso.findUnique({
        where: {
          codigo: permissionCode,
        },
      });

      // validar que el permiso exista 

      if (!permiso) {
        return res.status(500).json({
          message: 'Permiso no existe en la base de datos',
          permissionCode,
        });
      }

      // Validar permiso
      const rol_permiso = await prisma.rolPermiso.findFirst({
        where: {
          id_rol: user.id_rol,
          id_permiso:  permiso.id_permiso
          
      }});

      if (!rol_permiso) {
        return res.status(403).json({
          message: 'No tienes permiso para esta acción',
          permissionRequired: permissionCode,
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        message: 'Error validando permisos',
      });
    }
  };
};
// No bloquea: deja en req.permisos[codigo] si el usuario tiene el permiso.
// Sin usuario, sin rol o permiso inexistente en la BD = false. Úsalo después de authMiddleware.
export const marcarPermiso = (permissionCode: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    req.permisos = req.permisos ?? {};
    try {
      const user = req.user;

      if (user && envs.SUPER_ADMIN_ROL_ID && user.id_rol === envs.SUPER_ADMIN_ROL_ID) {
        req.permisos[permissionCode] = true;
        return next();
      }

      if (!user?.id_rol) {
        req.permisos[permissionCode] = false;
        return next();
      }

      const rol_permiso = await prisma.rolPermiso.findFirst({
        where: {
          id_rol: user.id_rol,
          permiso: { codigo: permissionCode },
        },
      });

      req.permisos[permissionCode] = !!rol_permiso;
      next();
    } catch (error) {
      console.error('marcarPermiso error:', error);
      req.permisos[permissionCode] = false;
      next();
    }
  };
};
