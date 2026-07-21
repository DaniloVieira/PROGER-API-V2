import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { PrgRelacUsinasEntity } from "../entities/prg-relac-usinas.entity";

@Injectable()
export class TypeOrmRelacUsinasRepository {
	constructor(
		@InjectRepository(PrgRelacUsinasEntity)
		private readonly repository: Repository<PrgRelacUsinasEntity>,
	) {}

	async buscarMontantesPorUsinaReferencia(cdUsina: string): Promise<PrgRelacUsinasEntity[]> {
		return this.repository.find({
			where: { cdUsinaReferencia: cdUsina },
			select: ["cdUsinaMontante", "vlTmpViagemIni", "vlTmpViagemFim"],
		});
	}
}
