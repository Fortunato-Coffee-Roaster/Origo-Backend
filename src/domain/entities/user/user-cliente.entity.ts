import { TipoUser } from '../../../enums/tipo-user.enum';
import { SuscripcionEntity } from '../suscripcion.entity';
import { UserBase, UserEntity } from './user.entity';

// User + tabla UserCliente
export class UserClienteEntity extends UserEntity {
    constructor(
        base: UserBase,
        public nombre_comercial: string | null,
        public departamento: string | null,
        public direccion: string | null,
        public tuestes: number | null,
        public fecha_primera_compra: Date | null,
        // Suscripción ACTIVA del cliente (con vencida / dias_restantes). null si no tiene.
        public suscripcion_actual: SuscripcionEntity | null,
    ) {
        super(base);
    }

    // Espera la fila de Prisma con include: { cliente: { include: { suscripciones } } }
    // (las suscripciones filtradas a la ACTIVA, con tipo y congelamientos).
    public static fromObject(obj: { [key: string]: any }): UserClienteEntity {
        const base = UserEntity.baseFromObject(obj, TipoUser.CLIENTE);
        const cliente = UserEntity.hijaFromObject(obj, 'cliente');

        const activa = Array.isArray(cliente.suscripciones)
            ? cliente.suscripciones.find((s: any) => s.estado === 'ACTIVA')
            : undefined;

        return new UserClienteEntity(
            base,
            cliente.nombre_comercial ?? null,
            cliente.departamento ?? null,
            cliente.direccion ?? null,
            cliente.tuestes ?? null,
            cliente.fecha_primera_compra ?? null,
            activa ? SuscripcionEntity.fromObject(activa) : null,
        );
    }
}
