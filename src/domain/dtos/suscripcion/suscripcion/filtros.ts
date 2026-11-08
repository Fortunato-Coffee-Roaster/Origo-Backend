import { ESTADOS_SUSCRIPCION, EstadoSuscripcion } from "../../../entities/suscripcion.entity";

// Filtros de GET /suscripcion (query string).
export class FiltrosSuscripcionDto {

    private constructor(
        public readonly estado?: EstadoSuscripcion,
        public readonly vencida?: boolean,
        public readonly id_cliente?: string,
    ) {}

    static create(props: { [key: string]: any }): [string?, FiltrosSuscripcionDto?] {
        const { estado, vencida, id_cliente } = props;

        let estadoValue: EstadoSuscripcion | undefined;
        if (estado !== undefined && estado !== '') {
            const upper = String(estado).toUpperCase() as EstadoSuscripcion;
            if (!ESTADOS_SUSCRIPCION.includes(upper))
                return [`estado inválido. Valores permitidos: ${ESTADOS_SUSCRIPCION.join(', ')}`, undefined];
            estadoValue = upper;
        }

        let vencidaValue: boolean | undefined;
        if (vencida !== undefined && vencida !== '') {
            if (vencida === true || vencida === 'true') vencidaValue = true;
            else if (vencida === false || vencida === 'false') vencidaValue = false;
            else return ['vencida debe ser true o false', undefined];
        }

        return [undefined, new FiltrosSuscripcionDto(
            estadoValue,
            vencidaValue,
            id_cliente ? String(id_cliente) : undefined,
        )];
    }
}
