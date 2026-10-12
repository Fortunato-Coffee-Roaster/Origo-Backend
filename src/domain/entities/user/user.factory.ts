import { TipoUser } from '../../../enums/tipo-user.enum';
import { UserEntity } from './user.entity';
import { UserClienteEntity } from './user-cliente.entity';
import { UserStaffEntity } from './user-staff.entity';
import { UserAdminEntity } from './user-admin.entity';

// Punto único para convertir una fila de Prisma en la entity que corresponde.
// La consulta debe traer: include: { cliente: true, staff: true, admin: true }
//
// Vive en un archivo aparte porque user.entity.ts no puede importar a sus
// subclases (ellas ya lo importan a él y se formaría un import circular).
export class UserFactory {
    public static fromObject(obj: { [key: string]: any }): UserEntity {
        const tipo = obj?.tipo;
        if (tipo === undefined || tipo === null) throw new Error('tipo property is required');

        switch (tipo) {
            case TipoUser.CLIENTE: return UserClienteEntity.fromObject(obj);
            case TipoUser.STAFF: return UserStaffEntity.fromObject(obj);
            case TipoUser.ADMIN: return UserAdminEntity.fromObject(obj);
            default: throw new Error('tipo is not a valid value');
        }
    }
}
