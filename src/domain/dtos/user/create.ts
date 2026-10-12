// src/domain/dtos/user/create.ts
import { TipoUser } from "../../../enums/tipo-user.enum";

const tieneValor = (v: any): boolean => v !== undefined && v !== null && v !== '';

const CAMPOS_CLIENTE = ['nombre_comercial', 'departamento', 'direccion'];
const CAMPOS_STAFF = ['cargo'];

const ERROR_CAMPOS_CLIENTE = 'nombre_comercial, departamento y direccion solo aplican a usuarios de tipo CLIENTE';
const ERROR_CAMPOS_STAFF = 'cargo solo aplica a usuarios de tipo STAFF';

// Campos de la tabla User: los que se piden para crear cualquier usuario.
interface CreateUserBase {
    nombre: string;
    email: string;
    documento_tipo: string | null;
    documento_identidad: string | null;
    fecha_nacimiento: Date | null;
    numero_telefono: string;
    tipo: TipoUser;
    password: string;
}

// DTO base. CreateUserDto.create(body) devuelve el DTO del tipo que venga en
// `tipo`: CreateUserClienteDto, CreateUserStaffDto o CreateUserAdminDto.
export abstract class CreateUserDto {
    public readonly nombre: string;
    public readonly email: string;
    public readonly documento_tipo: string | null;
    public readonly documento_identidad: string | null;
    public readonly fecha_nacimiento: Date | null;
    public readonly numero_telefono: string;
    public readonly tipo: TipoUser;
    public readonly password: string;

    protected constructor(base: CreateUserBase) {
        this.nombre = base.nombre;
        this.email = base.email;
        this.documento_tipo = base.documento_tipo;
        this.documento_identidad = base.documento_identidad;
        this.fecha_nacimiento = base.fecha_nacimiento;
        this.numero_telefono = base.numero_telefono;
        this.tipo = base.tipo;
        this.password = base.password;
    }

    // Columnas de la tabla User.
    get values() {
        return {
            nombre: this.nombre,
            email: this.email,
            documento_tipo: this.documento_tipo,
            documento_identidad: this.documento_identidad,
            fecha_nacimiento: this.fecha_nacimiento,
            numero_telefono: this.numero_telefono,
            tipo: this.tipo,
            password: this.password,
        };
    }

    static create(props: { [key: string]: any }): [string?, CreateUserDto?] {
        const [error, base] = CreateUserDto.baseFromProps(props);
        if (error || !base) return [error, undefined];

        switch (base.tipo) {
            case TipoUser.CLIENTE: return CreateUserClienteDto.create(props);
            case TipoUser.STAFF: return CreateUserStaffDto.create(props);
            default: return CreateUserAdminDto.create(props);
        }
    }

    // Valida los campos comunes. `tipo` acepta "cliente" o "CLIENTE".
    protected static baseFromProps(props: { [key: string]: any }): [string?, CreateUserBase?] {
        const {
            nombre,
            email,
            documento_tipo,
            documento_identidad,
            fecha_nacimiento,
            numero_telefono,
            tipo,
            password,
        } = props;

        if (!nombre) return ['nombre property is required', undefined];
        if (!email) return ['email property is required', undefined];
        if (!tipo) return ['tipo property is required', undefined];
        if (!password) return ['password property is required', undefined];

        const tipoNormalizado = String(tipo).toUpperCase() as TipoUser;
        if (!Object.values(TipoUser).includes(tipoNormalizado)) {
            return ['tipo debe ser CLIENTE, STAFF o ADMIN', undefined];
        }

        const newFecha = fecha_nacimiento ? new Date(fecha_nacimiento) : null;

        return [undefined, {
            nombre,
            email,
            documento_tipo: documento_tipo ?? null,
            documento_identidad: documento_identidad ?? null,
            fecha_nacimiento: newFecha,
            numero_telefono,
            tipo: tipoNormalizado,
            password,
        }];
    }
}

// ───────────────────────── CLIENTE ─────────────────────────
export class CreateUserClienteDto extends CreateUserDto {
    private constructor(
        base: CreateUserBase,
        public readonly nombre_comercial: string | null,
        public readonly departamento: string | null,
        public readonly direccion: string | null,
    ) {
        super(base);
    }

    // Columnas de la tabla UserCliente.
    get clienteValues() {
        return {
            nombre_comercial: this.nombre_comercial,
            departamento: this.departamento,
            direccion: this.direccion,
        };
    }

    static create(props: { [key: string]: any }): [string?, CreateUserClienteDto?] {
        const [error, base] = CreateUserDto.baseFromProps({ ...props, tipo: TipoUser.CLIENTE });
        if (error || !base) return [error, undefined];

        if (CAMPOS_STAFF.some(campo => tieneValor(props[campo]))) return [ERROR_CAMPOS_STAFF, undefined];

        const { nombre_comercial, departamento, direccion } = props;

        return [undefined, new CreateUserClienteDto(
            base,
            nombre_comercial ?? null,
            departamento ?? null,
            direccion ?? null,
        )];
    }
}

// ────────────────────────── STAFF ──────────────────────────
// id_rol no se pide al crear: se asigna después con AssignRoleToUser.
export class CreateUserStaffDto extends CreateUserDto {
    private constructor(
        base: CreateUserBase,
        public readonly cargo: string | null,
    ) {
        super(base);
    }

    // Columnas de la tabla UserStaff.
    get staffValues() {
        return {
            cargo: this.cargo,
        };
    }

    static create(props: { [key: string]: any }): [string?, CreateUserStaffDto?] {
        const [error, base] = CreateUserDto.baseFromProps({ ...props, tipo: TipoUser.STAFF });
        if (error || !base) return [error, undefined];

        if (CAMPOS_CLIENTE.some(campo => tieneValor(props[campo]))) return [ERROR_CAMPOS_CLIENTE, undefined];

        return [undefined, new CreateUserStaffDto(base, props.cargo || null)];
    }
}

// ────────────────────────── ADMIN ──────────────────────────
export class CreateUserAdminDto extends CreateUserDto {
    private constructor(base: CreateUserBase) {
        super(base);
    }

    static create(props: { [key: string]: any }): [string?, CreateUserAdminDto?] {
        const [error, base] = CreateUserDto.baseFromProps({ ...props, tipo: TipoUser.ADMIN });
        if (error || !base) return [error, undefined];

        if (CAMPOS_CLIENTE.some(campo => tieneValor(props[campo]))) return [ERROR_CAMPOS_CLIENTE, undefined];
        if (CAMPOS_STAFF.some(campo => tieneValor(props[campo]))) return [ERROR_CAMPOS_STAFF, undefined];

        return [undefined, new CreateUserAdminDto(base)];
    }
}
