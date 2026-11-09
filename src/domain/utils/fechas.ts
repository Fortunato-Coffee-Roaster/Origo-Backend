// Utilidades de fechas para reglas de negocio con días calendario.
// Todas las fechas se normalizan a medianoche UTC del día que representan,
// así un día siempre mide 24 h y no hay sorpresas con la hora del servidor.

const MS_DIA = 24 * 60 * 60 * 1000;

// Perú es UTC-5 todo el año (sin horario de verano).
const OFFSET_PERU_MS = -5 * 60 * 60 * 1000;

// Medianoche UTC del mismo día calendario (UTC) de la fecha.
export const inicioDelDia = (fecha: Date): Date =>
    new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));

// "Hoy" según la hora de Perú, normalizado a medianoche UTC.
export const hoy = (): Date => inicioDelDia(new Date(Date.now() + OFFSET_PERU_MS));

// Suma meses respetando fin de mes: 31-ene + 1 mes = 28/29-feb.
export const sumarMeses = (fecha: Date, meses: number): Date => {
    const base = inicioDelDia(fecha);
    const anio = base.getUTCFullYear();
    const mes = base.getUTCMonth() + meses;
    const dia = base.getUTCDate();

    const ultimoDiaMesDestino = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
    return new Date(Date.UTC(anio, mes, Math.min(dia, ultimoDiaMesDestino)));
};

export const sumarDias = (fecha: Date, dias: number): Date =>
    new Date(inicioDelDia(fecha).getTime() + dias * MS_DIA);

// Días calendario de `desde` a `hasta` (negativo si `hasta` es anterior).
export const diasEntre = (desde: Date, hasta: Date): number =>
    Math.round((inicioDelDia(hasta).getTime() - inicioDelDia(desde).getTime()) / MS_DIA);

// Convierte un valor del body/query a fecha normalizada.
// undefined/null/'' → null. Valor inválido → undefined (el DTO decide el error).
export const parseFecha = (valor: unknown): Date | null | undefined => {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor !== 'string' && typeof valor !== 'number' && !(valor instanceof Date)) return undefined;

    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return undefined;
    return inicioDelDia(fecha);
};
