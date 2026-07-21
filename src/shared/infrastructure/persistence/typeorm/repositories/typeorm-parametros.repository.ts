import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { PrgParametrosEntity } from "../entities/prg-parametros.entity";

@Injectable()
export class TypeOrmParametrosRepository {
	constructor(
		@InjectRepository(PrgParametrosEntity)
		private readonly repository: Repository<PrgParametrosEntity>,
	) {}

	async buscarParametroPorUsinaENome(cdUsina: string, nmParametro: string): Promise<PrgParametrosEntity | null> {
		return this.repository.findOne({
			where: { cdUsina, nmParametro },
		});
	}
}
