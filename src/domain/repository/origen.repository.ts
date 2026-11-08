import { FiltrosOrigenDto } from "../dtos/origen/filtros";
import { OrigenEntity } from "../entities/origen.entity";

export abstract class OrigenRepository {

    abstract getOrigenes(filtros: FiltrosOrigenDto): Promise<OrigenEntity[]>;

    abstract getOrigenById(id: string): Promise<OrigenEntity | null>;
}
