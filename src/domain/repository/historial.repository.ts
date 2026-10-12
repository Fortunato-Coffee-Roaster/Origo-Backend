import { CreateHistorialDto } from "../dtos/historial/create";
import { HistorialEntity } from "../entities/historial.entity";
import { Prisma } from "@prisma/client";

export abstract class HistorialRepository {
    abstract createHistorial(createLoteHistorialDto: CreateHistorialDto, tx?: Prisma.TransactionClient): Promise<HistorialEntity>;
    abstract getHistorialByUserId(id: string): Promise<HistorialEntity[]>;
    abstract getHistorialByEntidadId(id: string): Promise<HistorialEntity[]>;
    abstract getAllHistorial(): Promise<HistorialEntity[]>;
    abstract getHistorialById(id: string): Promise<HistorialEntity | null>;
}