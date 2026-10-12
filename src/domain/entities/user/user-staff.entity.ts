import { TipoUser } from '../../../enums/tipo-user.enum';
import { UserBase, UserEntity } from './user.entity';

// User + tabla UserStaff
export class UserStaffEntity extends UserEntity {
    constructor(
        base: UserBase,
        public cargo: string | null,
        public id_rol: string | null,
    ) {
        super(base);
    }

    // Espera la fila de Prisma con include: { staff: true }
    public static fromObject(obj: { [key: string]: any }): UserStaffEntity {
        const base = UserEntity.baseFromObject(obj, TipoUser.STAFF);
        const staff = UserEntity.hijaFromObject(obj, 'staff');

        return new UserStaffEntity(
            base,
            staff.cargo ?? null,
            staff.id_rol ?? null,
        );
    }
}
