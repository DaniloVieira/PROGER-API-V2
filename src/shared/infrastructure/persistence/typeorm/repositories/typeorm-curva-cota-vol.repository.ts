import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { PrgCurvaCotaVolEntity } from "../entities/prg-curva-cota-vol.entity";

@Injectable()
export class TypeOrmCurvaCotaVolRepository {
	constructor(
		@InjectRepository(PrgCurvaCotaVolEntity)
		private readonly repository: Repository<PrgCurvaCotaVolEntity>,
	) {}

	async buscarCurvaPorUsina(cdUsina: string): Promise<PrgCurvaCotaVolEntity[]> {
		return this.repository.find({
			where: { cdUsina },
			order: { vlCotaOpr: "ASC" },
		});
	}
}
