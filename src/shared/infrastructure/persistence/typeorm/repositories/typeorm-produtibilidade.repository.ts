import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { IProdutibilidadeRepository } from "@modules/calculation/domain/ports/produtibilidade-repository.port";
import { PrgProdutibilidadeEntity } from "../entities/prg-produtibilidade.entity";

@Injectable()
export class TypeOrmProdutibilidadeRepository implements IProdutibilidadeRepository {
	constructor(
		@InjectRepository(PrgProdutibilidadeEntity)
		private readonly repository: Repository<PrgProdutibilidadeEntity>,
	) {}

	async buscarPorUsina(cdUsina: string): Promise<number | null> {
		const result = await this.repository.findOne({
			where: { cdUsina },
			order: { cdProdutibilidade: "DESC" },
		});

		if (!result) {
			return null;
		}

		return Number(result.vlProdutibilidade);
	}
}
