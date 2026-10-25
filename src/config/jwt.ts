import jsonwebtoken, { SignOptions } from "jsonwebtoken";
import { envs } from "./envs";
import { TipoUser } from "../enums/tipo-user.enum";

// Datos del usuario que viajan dentro del token.
export interface TokenPayload {
  id: string;
  email: string;
  rolId: string | null; // rol de permisos: solo STAFF tiene, en ADMIN va null
  tipo: TipoUser;
}

export class Jwt {
  // Token de acceso: el que viaja en Authorization: Bearer <token>.
  static signAccess(payload: TokenPayload, expiresIn: SignOptions["expiresIn"] = "1d"): string {
    return jsonwebtoken.sign(Jwt.limpiar(payload), envs.JWT_SECRET, { expiresIn });
  }

  // Token de refresco: solo sirve para pedir un token de acceso nuevo.
  static signRefresh(payload: TokenPayload, expiresIn: SignOptions["expiresIn"] = "1d"): string {
    return jsonwebtoken.sign(Jwt.limpiar(payload), envs.JWT_REFRESH_SECRET, { expiresIn });
  }

  // Lanza Error si el token es inválido, expiró o le faltan datos.
  static verifyAccess(token: string): TokenPayload {
    return Jwt.verify(token, envs.JWT_SECRET);
  }

  static verifyRefresh(token: string): TokenPayload {
    return Jwt.verify(token, envs.JWT_REFRESH_SECRET);
  }

  private static verify(token: string, secret: string): TokenPayload {
    let decoded: any;
    try {
      decoded = jsonwebtoken.verify(token, secret);
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }

    // rolId no es obligatorio (un ADMIN no tiene); lo que identifica al usuario es `tipo`.
    if (!decoded || !decoded.id || !decoded.email || !decoded.tipo) {
      throw new Error("Token inválido (estructura incompleta)");
    }

    return Jwt.limpiar(decoded);
  }

  // Deja solo los datos del usuario (sin iat ni exp de un token anterior).
  private static limpiar(payload: TokenPayload): TokenPayload {
    return {
      id: payload.id,
      email: payload.email,
      rolId: payload.rolId ?? null,
      tipo: payload.tipo,
    };
  }
}