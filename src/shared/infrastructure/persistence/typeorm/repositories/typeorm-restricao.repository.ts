import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type {
	IRestricaoRepository,
	RestricaoAtiva,
} from "@modules/restriction/domain/ports/restricao-repository.port";
import { PrgRestricaoUsinaEntity } from "../entities/prg-restricao-usina.entity";
import { PrgTiposRestricaoEntity } from "../entities/prg-tipos-restricao.entity";

@Injectable()
export class TypeOrmRestricaoRepository implements IRestricaoRepository {
	constructor(
		@InjectRepository(PrgRestricaoUsinaEntity)
		private readonly restricaoRepo: Repository<PrgRestricaoUsinaEntity>,
	) {}

	async buscarRestricoesAtivas(
		cdUsina: string,
		_periodo: number,
	): Promise<RestricaoAtiva[]> {
		const resultado = await this.restricaoRepo
			.createQueryBuilder("ru")
			.innerJoin(
				PrgTiposRestricaoEntity,
				"tr",
				"ru.cdTpRestricao = tr.cdTpRestricao",
			)
			.select([
				"ru.cdTpRestricao",
				"tr.dsRestricao",
				"tr.dsVarRef",
				"tr.cdTipoAtributo",
				"ru.nrPerRestricao",
				"ru.vlRestricao",
				"ru.vlFxIniRest",
				"ru.vlFxFimRest",
				"ru.dtIniRestricao",
				"ru.dtFimRestricao",
			])
			.where("ru.cdUsina = :cdUsina", { cdUsina })
			.andWhere("ru.flStatus = 1")
			.andWhere(
				"(ru.dtIniRestricao IS NULL OR ru.dtIniRestricao <= CURRENT_DATE)",
			)
			.andWhere(
				"(ru.dtFimRestricao IS NULL OR ru.dtFimRestricao >= CURRENT_DATE)",
			)
			.getRawMany();

		return resultado.map((r) => ({
			cdTpRestricao: Number(r.ru_cdTpRestricao),
			dsRestricao: String(r.tr_dsRestricao),
			dsVarRef: String(r.tr_dsVarRef),
			cdTipoAtributo: Number(r.tr_cdTipoAtributo),
			nrPerRestricao: Number(r.ru_nrPerRestricao),
			vlRestricao: r.ru_vlRestricao !== undefined && r.ru_vlRestricao !== null
				? Number(r.ru_vlRestricao)
				: undefined,
			vlFxIniRest: r.ru_vlFxIniRest !== undefined && r.ru_vlFxIniRest !== null
				? Number(r.ru_vlFxIniRest)
				: undefined,
			vlFxFimRest: r.ru_vlFxFimRest !== undefined && r.ru_vlFxFimRest !== null
				? Number(r.ru_vlFxFimRest)
				: undefined,
			dtIniRestricao: r.ru_dtIniRestricao
				? new Date(r.ru_dtIniRestricao)
				: undefined,
			dtFimRestricao: r.ru_dtFimRestricao
				? new Date(r.ru_dtFimRestricao)
				: undefined,
		}));
	}
}
