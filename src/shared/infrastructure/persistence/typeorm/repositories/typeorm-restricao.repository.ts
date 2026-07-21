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
		const sql = `
			SELECT RU.CD_TP_RESTRICAO AS "cd_tp_restricao",
				   TR.DS_RESTRICAO AS "ds_restricao",
				   TR.DS_VAR_REF AS "ds_var_ref",
				   TR.CD_TIPO_ATRIBUTO AS "cd_tipo_atributo",
				   RU.NR_PER_RESTRICAO AS "nr_per_restricao",
				   RU.VL_RESTRICAO AS "vl_restricao",
				   RU.VL_FX_INI_REST AS "vl_fx_ini_rest",
				   RU.VL_FX_FIM_REST AS "vl_fx_fim_rest",
				   RU.DT_INI_RESTRICAO AS "dt_ini_restricao",
				   RU.DT_FIM_RESTRICAO AS "dt_fim_restricao"
			FROM PROGER.PRG_RESTRICAO_USINA RU
			INNER JOIN PROGER.PRG_TIPOS_RESTRICAO TR ON RU.CD_TP_RESTRICAO = TR.CD_TP_RESTRICAO
			WHERE RU.CD_USINA = :1
			  AND RU.FL_STATUS = 1
			  AND (RU.DT_INI_RESTRICAO IS NULL OR RU.DT_INI_RESTRICAO <= CURRENT_DATE)
			  AND (RU.DT_FIM_RESTRICAO IS NULL OR RU.DT_FIM_RESTRICAO >= CURRENT_DATE)
		`;

		const resultado = await this.restricaoRepo.query(sql, [cdUsina]);

		return resultado.map((r: any) => ({
			cdTpRestricao: Number(r.cd_tp_restricao),
			dsRestricao: String(r.ds_restricao),
			dsVarRef: String(r.ds_var_ref),
			cdTipoAtributo: Number(r.cd_tipo_atributo),
			nrPerRestricao: Number(r.nr_per_restricao),
			vlRestricao: r.vl_restricao !== undefined && r.vl_restricao !== null
				? Number(r.vl_restricao)
				: undefined,
			vlFxIniRest: r.vl_fx_ini_rest !== undefined && r.vl_fx_ini_rest !== null
				? Number(r.vl_fx_ini_rest)
				: undefined,
			vlFxFimRest: r.vl_fx_fim_rest !== undefined && r.vl_fx_fim_rest !== null
				? Number(r.vl_fx_fim_rest)
				: undefined,
			dtIniRestricao: r.dt_ini_restricao
				? new Date(r.dt_ini_restricao)
				: undefined,
			dtFimRestricao: r.dt_fim_restricao
				? new Date(r.dt_fim_restricao)
				: undefined,
		}));
	}
}
