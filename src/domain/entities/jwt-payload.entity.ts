import { TipoUser } from '../../enums/tipo-user.enum';

export interface JwtPayload {
  id_user: string;
  email: string;
  tipo: TipoUser;
  id_rol: string | null; // solo STAFF tiene rol; ADMIN va null
}
 