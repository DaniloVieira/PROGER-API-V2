import type { RestricaoAtiva } from "../ports/restricao-repository.port";
import {
	ValidadorRestricoes,
	type DadosProgramacao,
} from "./validador-restricoes.service";

export interface DadosPainelPeriodo {
	periodo: number;
	geracaoMW: number;
	vazaoVertida: number;
	vazaoIncremental: number;
	nivelReservatorio: number;
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoAfluente: number;
}

export interface AlertaRestricaoItem {
	cdTpRestricao: number;
	descricao: string;
}

export interface AlertasRestricoesPainel {
	geracao: AlertaRestricaoItem[];
	hidrico: AlertaRestricaoItem[];
	nivel: AlertaRestricaoItem[];
}

/**
 * Valida restrições sobre o array completo de dados do painel.
 * Delega max/min/faixa para ValidadorRestricoes (período único).
 * Implementa taxas de variação (tipos 7–18) com comparação entre períodos.
 */
export class ValidadorPainelService {
	private readonly validadorUnitario = new ValidadorRestricoes();

	private readonly VARIACAO_VARIAVEL_MAP: Record<
		number,
		keyof DadosPainelPeriodo
	> = {
		7: "vazaoTurbinada",
		8: "vazaoTurbinada",
		9: "vazaoDefluente",
		10: "vazaoDefluente",
		11: "vazaoVertida",
		12: "vazaoVertida",
		13: "geracaoMW",
		14: "geracaoMW",
		15: "nivelReservatorio",
		16: "nivelReservatorio",
		17: "nivelReservatorio",
		18: "nivelReservatorio",
	};

	validar(
		dados: DadosPainelPeriodo[],
		restricoes: RestricaoAtiva[],
	): AlertasRestricoesPainel {
		const violacoesUnicas = new Map<number, AlertaRestricaoItem>();

		for (const restricao of restricoes) {
			const violou = this.validarRestricao(dados, restricao);
			if (violou) {
				violacoesUnicas.set(restricao.cdTpRestricao, {
					cdTpRestricao: restricao.cdTpRestricao,
					descricao: restricao.dsRestricao,
				});
			}
		}

		const geracao: AlertaRestricaoItem[] = [];
		const hidrico: AlertaRestricaoItem[] = [];
		const nivel: AlertaRestricaoItem[] = [];

		for (const item of violacoesUnicas.values()) {
			const restricao = restricoes.find(
				(r) => r.cdTpRestricao === item.cdTpRestricao,
			);
			if (!restricao) continue;
			switch (restricao.cdTipoAtributo) {
				case 2:
					geracao.push(item);
					break;
				case 1:
					hidrico.push(item);
					break;
				case 3:
					nivel.push(item);
					break;
			}
		}

		return { geracao, hidrico, nivel };
	}

	private validarRestricao(
		dados: DadosPainelPeriodo[],
		restricao: RestricaoAtiva,
	): boolean {
		const cdTp = restricao.cdTpRestricao;

		// Tipos 1-6, 19-20, 21-23: max/min/faixa (período único)
		if ((cdTp >= 1 && cdTp <= 6) || (cdTp >= 19 && cdTp <= 23)) {
			return this.validarUnitario(dados, restricao);
		}

		// Tipos 7-14: taxa de variação (aumento/redução)
		if (cdTp >= 7 && cdTp <= 14) {
			return this.validarVariacao(dados, restricao);
		}

		// Tipos 15-16: taxa nível (deplecionamento/enchimento)
		if (cdTp === 15 || cdTp === 16) {
			return this.validarTaxaNivel(dados, restricao);
		}

		// Tipos 17-18: taxa móvel
		if (cdTp === 17 || cdTp === 18) {
			return this.validarTaxaMovel(dados, restricao);
		}

		return false;
	}

	private validarUnitario(
		dados: DadosPainelPeriodo[],
		restricao: RestricaoAtiva,
	): boolean {
		for (const dado of dados) {
			const dp: DadosProgramacao = {
				geracaoMW: dado.geracaoMW,
				vazaoTurbinada: dado.vazaoTurbinada,
				vazaoDefluente: dado.vazaoDefluente,
				vazaoVertida: dado.vazaoVertida,
				nivelReservatorio: dado.nivelReservatorio,
				vazaoAfluente: dado.vazaoAfluente,
			};
			const viol = this.validadorUnitario.validar(dp, [restricao]);
			if (viol.length > 0) return true;
		}
		return false;
	}

	private validarVariacao(
		dados: DadosPainelPeriodo[],
		restricao: RestricaoAtiva,
	): boolean {
		const cdTp = restricao.cdTpRestricao;
		const variavel = this.VARIACAO_VARIAVEL_MAP[cdTp];
		if (!variavel || restricao.vlRestricao === undefined) return false;

		// Aumento: tipos ímpares (7,9,11,13)
		// Redução: tipos pares (8,10,12,14)
		const isAumento = cdTp % 2 === 1;

		// nrPerRestricao em horas → quantidade de períodos de 30 min
		const periodos = Math.max(1, Math.round(restricao.nrPerRestricao * 2));

		for (let i = periodos; i < dados.length; i++) {
			const atual = dados[i][variavel] as number;
			const anterior = dados[i - periodos][variavel] as number;
			const diff = isAumento ? atual - anterior : anterior - atual;
			if (diff > restricao.vlRestricao) return true;
		}
		return false;
	}

	private validarTaxaNivel(
		dados: DadosPainelPeriodo[],
		restricao: RestricaoAtiva,
	): boolean {
		const cdTp = restricao.cdTpRestricao;
		const variavel = this.VARIACAO_VARIAVEL_MAP[cdTp];
		if (!variavel || restricao.vlRestricao === undefined) return false;

		// 15 = deplecionamento (redução do nível)
		// 16 = enchimento (aumento do nível)
		const isAumento = cdTp === 16;
		const periodos = Math.max(1, Math.round(restricao.nrPerRestricao * 2));

		for (let i = periodos; i < dados.length; i++) {
			const atual = dados[i][variavel] as number;
			const anterior = dados[i - periodos][variavel] as number;
			const diff = isAumento ? atual - anterior : anterior - atual;
			if (diff > restricao.vlRestricao) return true;
		}
		return false;
	}

	private validarTaxaMovel(
		dados: DadosPainelPeriodo[],
		restricao: RestricaoAtiva,
	): boolean {
		const cdTp = restricao.cdTpRestricao;
		const variavel = this.VARIACAO_VARIAVEL_MAP[cdTp];
		if (!variavel || restricao.vlRestricao === undefined) return false;

		// 17 = deplecionamento móvel (redução em janela)
		// 18 = enchimento móvel (aumento em janela)
		const isAumento = cdTp === 18;

		// Janela em períodos de 30 min
		const janelaPeriodos = Math.max(
			1,
			Math.round(restricao.nrPerRestricao * 2),
		);

		for (let i = janelaPeriodos; i < dados.length; i++) {
			const atual = dados[i][variavel] as number;

			// Coleta valores na janela [i-janelaPeriodos, i-1]
			const valoresJanela: number[] = [];
			for (let j = i - janelaPeriodos; j < i; j++) {
				valoresJanela.push(dados[j][variavel] as number);
			}

			if (valoresJanela.length === 0) continue;

			const extremo = isAumento
				? Math.max(...valoresJanela)
				: Math.min(...valoresJanela);

			const diff = isAumento ? extremo - atual : atual - extremo;

			if (diff > restricao.vlRestricao) return true;
		}
		return false;
	}
}
