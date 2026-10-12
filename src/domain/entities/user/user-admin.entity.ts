import { TipoUser } from '../../../enums/tipo-user.enum';
import { UserBase, UserEntity } from './user.entity';

// User + tabla UserAdmin
export class UserAdminEntity extends UserEntity {
    constructor(base: UserBase) {
        super(base);
    }

    public static fromObject(obj: { [key: string]: any }): UserAdminEntity {
        return new UserAdminEntity(UserEntity.baseFromObject(obj, TipoUser.ADMIN));
    }
}
