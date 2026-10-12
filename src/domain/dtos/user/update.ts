// src/domain/dtos/user/update.ts
import { TipoUser } from "../../../enums/tipo-user.enum";

const ERROR_CAMPOS_CLIENTE = 'Los datos de cliente (nombre comercial, departamento, dirección, tuestes, suscripción, primera compra) solo aplican a usuarios de tipo CLIENTE';
const ERROR_CAMPOS_STAFF = 'El cargo solo aplica a usuarios de tipo STAFF';

// true si el body trae algún dato real de la tabla UserCliente.
// Vacíos, null, 0 y false no cuentan (mismo criterio con el que se guardan).
const tieneDatosCliente = (props: { [key: string]: any }): boolean =>
    !!(props.nombre_comercial || props.departamento || props.direccion || props.tuestes
        || props.suscripcion || props.cant_suscripcion || props.fecha_primera_compra);

// true si el body trae algún dato real de la tabla UserStaff.
const tieneDatosStaff = (props: { [key: string]: any }): boolean => !!props.cargo;

// Campos editables de la tabla User.
interface UpdateUserBase {
    fecha_editado: Date;
    id_user: string;
    nombre?: string;
    email?: string;
    documento_tipo?: string;
    documento_identidad?: string;
    fecha_nacimiento?: Date;
    numero_telefono?: number;
    password?: string;
}

// DTO base: solo los campos de la tabla User.
//
// UpdateUserDto.update(body) no sabe de qué tipo es el usuario (el body no lo
// trae y `tipo` no se edita), así que el use case UpdateUser lee el usuario y
// llama a paraTipo(), que devuelve UpdateUserClienteDto, UpdateUserStaffDto o
// UpdateUserAdminDto ya validado.
//
// Un UpdateUserDto sin pasar por paraTipo() solo actualiza la tabla User
// (es lo que usa ChangePassword).
export class UpdateUserDto {
    public readonly fecha_editado: Date;
    public readonly id_user: string;
    public readonly nombre?: string;
    public readonly email?: string;
    public readonly documento_tipo?: string;
    public readonly documento_identidad?: string;
    public readonly fecha_nacimiento?: Date;
    public readonly numero_telefono?: number;
    public readonly password?: string;

    protected constructor(
        base: UpdateUserBase,
        // Body original, para poder armar el DTO del tipo real en paraTipo().
        private readonly body: { [key: string]: any } = {},
    ) {
        this.fecha_editado = base.fecha_editado;
        this.id_user = base.id_user;
        this.nombre = base.nombre;
        this.email = base.email;
        this.documento_tipo = base.documento_tipo;
        this.documento_identidad = base.documento_identidad;
        this.fecha_nacimiento = base.fecha_nacimiento;
        this.numero_telefono = base.numero_telefono;
        this.password = base.password;
    }

    // Columnas de la tabla User.
    get values() {
        const returnObj: { [key: string]: any } = {};

        if (this.fecha_editado) returnObj.fecha_editado = this.fecha_editado;
        if (this.id_user) returnObj.id_user = this.id_user;
        if (this.nombre) returnObj.nombre = this.nombre;
        if (this.email) returnObj.email = this.email;
        if (this.documento_tipo) returnObj.documento_tipo = this.documento_tipo;
        if (this.documento_identidad) returnObj.documento_identidad = this.documento_identidad;
        if (this.fecha_nacimiento) returnObj.fecha_nacimiento = this.fecha_nacimiento;
        if (this.numero_telefono) returnObj.numero_telefono = this.numero_telefono;
        if (this.password) returnObj.password = this.password;

        return returnObj;
    }

    static update(props: { [key: string]: any }): [string?, UpdateUserDto?] {
        return [undefined, new UpdateUserDto(UpdateUserDto.baseFromProps(props), props)];
    }

    // Devuelve el DTO del tipo real del usuario. `cambios` pisa valores del
    // body (el use case lo usa para fijar id_user y el password ya hasheado).
    // Da error si el body trae datos de una tabla que no es la de ese tipo.
    paraTipo(tipo: TipoUser, cambios: { [key: string]: any } = {}): [string?, UpdateUserDto?] {
        const props = { ...this.body, ...cambios };

        switch (tipo) {
            case TipoUser.CLIENTE: return UpdateUserClienteDto.update(props);
            case TipoUser.STAFF: return UpdateUserStaffDto.update(props);
            case TipoUser.ADMIN: return UpdateUserAdminDto.update(props);
            default: return ['tipo debe ser CLIENTE, STAFF o ADMIN', undefined];
        }
    }

    protected static baseFromProps(props: { [key: string]: any }): UpdateUserBase {
        const {
            id_user,
            nombre,
            email,
            documento_tipo,
            documento_identidad,
            fecha_nacimiento,
            numero_telefono,
            password,
        } = props;

        return {
            fecha_editado: new Date(),
            id_user,
            nombre,
            email,
            documento_tipo,
            documento_identidad,
            fecha_nacimiento,
            numero_telefono,
            password,
        };
    }
}

// ───────────────────────── CLIENTE ─────────────────────────
export class UpdateUserClienteDto extends UpdateUserDto {
    private constructor(
        base: UpdateUserBase,
        body: { [key: string]: any },
        public readonly nombre_comercial?: string,
        public readonly departamento?: string,
        public readonly direccion?: string,
        public readonly tuestes?: number,
        public readonly suscripcion?: boolean,
        public readonly cant_suscripcion?: number,
        public readonly fecha_primera_compra?: Date | null,
    ) {
        super(base, body);
    }

    // Columnas de la tabla UserCliente.
    get clienteValues() {
        const returnObj: { [key: string]: any } = {};

        if (this.nombre_comercial) returnObj.nombre_comercial = this.nombre_comercial;
        if (this.departamento) returnObj.departamento = this.departamento;
        if (this.direccion) returnObj.direccion = this.direccion;
        if (this.tuestes) returnObj.tuestes = this.tuestes;
        if (this.suscripcion) returnObj.suscripcion = this.suscripcion;
        if (this.cant_suscripcion) returnObj.cant_suscripcion = this.cant_suscripcion;
        if (this.fecha_primera_compra !== undefined) returnObj.fecha_primera_compra = this.fecha_primera_compra;

        return returnObj;
    }

    static update(props: { [key: string]: any }): [string?, UpdateUserClienteDto?] {
        if (tieneDatosStaff(props)) return [ERROR_CAMPOS_STAFF, undefined];

        const {
            nombre_comercial,
            departamento,
            direccion,
            tuestes,
            suscripcion,
            cant_suscripcion,
            fecha_primera_compra,
        } = props;

        const parsedFechaPrimeraCompra = fecha_primera_compra
            ? new Date(fecha_primera_compra)
            : fecha_primera_compra === null ? null : undefined;

        return [undefined, new UpdateUserClienteDto(
            UpdateUserDto.baseFromProps(props),
            props,
            nombre_comercial,
            departamento,
            direccion,
            tuestes,
            suscripcion,
            cant_suscripcion,
            parsedFechaPrimeraCompra,
        )];
    }
}

// ────────────────────────── STAFF ──────────────────────────
// id_rol no va acá: se asigna con el use case AssignRoleToUser.
export class UpdateUserStaffDto extends UpdateUserDto {
    private constructor(
        base: UpdateUserBase,
        body: { [key: string]: any },
        public readonly cargo?: string,
    ) {
        super(base, body);
    }

    // Columnas de la tabla UserStaff.
    get staffValues() {
        const returnObj: { [key: string]: any } = {};

        if (this.cargo) returnObj.cargo = this.cargo;

        return returnObj;
    }

    static update(props: { [key: string]: any }): [string?, UpdateUserStaffDto?] {
        if (tieneDatosCliente(props)) return [ERROR_CAMPOS_CLIENTE, undefined];

        return [undefined, new UpdateUserStaffDto(UpdateUserDto.baseFromProps(props), props, props.cargo)];
    }
}

// ────────────────────────── ADMIN ──────────────────────────
export class UpdateUserAdminDto extends UpdateUserDto {
    private constructor(base: UpdateUserBase, body: { [key: string]: any }) {
        super(base, body);
    }

    static update(props: { [key: string]: any }): [string?, UpdateUserAdminDto?] {
        if (tieneDatosCliente(props)) return [ERROR_CAMPOS_CLIENTE, undefined];
        if (tieneDatosStaff(props)) return [ERROR_CAMPOS_STAFF, undefined];

        return [undefined, new UpdateUserAdminDto(UpdateUserDto.baseFromProps(props), props)];
    }
}
