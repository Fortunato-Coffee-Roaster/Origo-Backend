import { TipoUser } from '../../../enums/tipo-user.enum';
import { UserBase, UserEntity } from './user.entity';

// User + tabla UserCliente
export class UserClienteEntity extends UserEntity {
    constructor(
        base: UserBase,
        public nombre_comercial: string | null,
        public departamento: string | null,
        public direccion: string | null,
        public tuestes: number | null,
        public suscripcion: boolean,
        public cant_suscripcion: number | null,
        public fecha_primera_compra: Date | null,
    ) {
        super(base);
    }

    // Espera la fila de Prisma con include: { cliente: true }
    public static fromObject(obj: { [key: string]: any }): UserClienteEntity {
        const base = UserEntity.baseFromObject(obj, TipoUser.CLIENTE);
        const cliente = UserEntity.hijaFromObject(obj, 'cliente');

        return new UserClienteEntity(
            base,
            cliente.nombre_comercial ?? null,
            cliente.departamento ?? null,
            cliente.direccion ?? null,
            cliente.tuestes ?? null,
            cliente.suscripcion ?? false,
            cliente.cant_suscripcion ?? null,
            cliente.fecha_primera_compra ?? null,
        );
    }
}
