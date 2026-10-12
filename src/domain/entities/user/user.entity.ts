import { TipoUser } from '../../../enums/tipo-user.enum';

// Campos de la tabla User
export interface UserBase {
    id_user: string;
    nombre: string;
    email: string;
    documento_tipo: string | null;
    documento_identidad: string | null;
    fecha_nacimiento: Date | null;
    numero_telefono: number | null;
    tipo: TipoUser;
    password: string;
    eliminado: boolean;
    fecha_registro: Date;
    fecha_editado?: Date | null;
}

// Entity base. Es abstracta: todo usuario es UserClienteEntity, UserStaffEntity
// o UserAdminEntity. Para construir uno desde una fila de Prisma se usa
// UserFactory.fromObject(), que elige la clase según `tipo`.
export abstract class UserEntity implements UserBase {
    public id_user: string;
    public nombre: string;
    public email: string;
    public documento_tipo: string | null;
    public documento_identidad: string | null;
    public fecha_nacimiento: Date | null;
    public numero_telefono: number | null;
    public tipo: TipoUser;
    public password: string;
    public eliminado: boolean;
    public fecha_registro: Date;
    public fecha_editado?: Date | null;

    protected constructor(base: UserBase) {
        this.id_user = base.id_user;
        this.nombre = base.nombre;
        this.email = base.email;
        this.documento_tipo = base.documento_tipo;
        this.documento_identidad = base.documento_identidad;
        this.fecha_nacimiento = base.fecha_nacimiento;
        this.numero_telefono = base.numero_telefono;
        this.tipo = base.tipo;
        this.password = base.password;
        this.eliminado = base.eliminado;
        this.fecha_registro = base.fecha_registro;
        this.fecha_editado = base.fecha_editado;
    }

    // Valida y devuelve los campos de la tabla User. Lo usan las tres subclases.
    protected static baseFromObject(obj: { [key: string]: any }, tipoEsperado: TipoUser): UserBase {
        const {
            id_user,
            nombre,
            email,
            documento_tipo,
            documento_identidad,
            fecha_nacimiento,
            numero_telefono,
            tipo,
            password,
            eliminado,
            fecha_registro,
            fecha_editado,
        } = obj;

        if (!id_user) throw new Error('id_user property is required');
        if (!nombre) throw new Error('nombre property is required');
        if (!email) throw new Error('email property is required');
        if (tipo === undefined || tipo === null) throw new Error('tipo property is required');
        if (tipo !== tipoEsperado) throw new Error(`tipo must be ${tipoEsperado}`);
        if (!password) throw new Error('password property is required');
        if (eliminado === undefined || eliminado === null) throw new Error('eliminado property is required');
        if (!fecha_registro) throw new Error('fecha_registro property is required');
        if (fecha_editado === undefined) throw new Error('fecha_editado property is required');

        const newFechaRegistro = new Date(fecha_registro);
        if (isNaN(newFechaRegistro.getTime())) {
            throw new Error('fecha_registro is not a valid date');
        }

        if (fecha_editado) {
            const newFechaEditado = new Date(fecha_editado);
            if (isNaN(newFechaEditado.getTime())) {
                throw new Error('fecha_editado is not a valid date');
            }
        }

        return {
            id_user,
            nombre,
            email,
            documento_tipo: documento_tipo ?? null,
            documento_identidad: documento_identidad ?? null,
            fecha_nacimiento: fecha_nacimiento ?? null,
            numero_telefono: numero_telefono ?? null,
            tipo,
            password,
            eliminado,
            fecha_registro,
            fecha_editado,
        };
    }

    // Devuelve la fila de la tabla hija (obj.cliente u obj.staff).
    // undefined = la consulta no trajo la relación: es un error de código, así
    //             que lanza en vez de devolver campos vacíos en silencio.
    // null      = el usuario no tiene fila en la tabla hija: devuelve {} y la
    //             subclase usa sus valores por defecto.
    protected static hijaFromObject(obj: { [key: string]: any }, relacion: 'cliente' | 'staff'): { [key: string]: any } {
        if (obj[relacion] === undefined) {
            throw new Error(`${relacion} property is required: falta include: { ${relacion}: true } en la consulta`);
        }
        return obj[relacion] ?? {};
    }
}
