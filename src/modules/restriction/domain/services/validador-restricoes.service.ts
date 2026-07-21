import { DomainException } from "@shared/domain";

export interface DadosProgramacao {
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoVertida: number;
	vazaoAfluente: number;
	nivelReservatorio: number;
	geracaoMW: number;
}

export interface RestricaoAtiva {
	cdTpRestricao: number;
	dsRestricao: string;
	dsVarRef: string;
	vlRestricao?: number;
	vlFxIniRest?: number;
	vlFxFimRest?: number;
}

export interface ViolacaoRestricao {
	cdTpRestricao: number;
	dsRestricao: string;
	mensagem: string;
}

export class ValidadorRestricoes {
	validar(
		dados: DadosProgramacao,
		restricoes: RestricaoAtiva[],
	): ViolacaoRestricao[] {
		const violacoes: ViolacaoRestricao[] = [];

		for (const r of restricoes) {
			const v = this.validarRestricao(dados, r);
			if (v) {
				violacoes.push(v);
			}
		}

		return violacoes;
	}

	private validarRestricao(
		dados: DadosProgramacao,
		r: RestricaoAtiva,
	): ViolacaoRestricao | null {
		switch (r.cdTpRestricao) {
			// Vazão Turbinada
			case 1: // Máxima
				if (
					r.vlRestricao !== undefined &&
					dados.vazaoTurbinada > r.vlRestricao
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Vazão turbinada ${dados.vazaoTurbinada.toFixed(2)} m³/s excede o máximo de ${r.vlRestricao.toFixed(2)} m³/s`,
					};
				}
				break;
			case 2: // Mínima
				if (
					r.vlRestricao !== undefined &&
					dados.vazaoTurbinada < r.vlRestricao
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Vazão turbinada ${dados.vazaoTurbinada.toFixed(2)} m³/s abaixo do mínimo de ${r.vlRestricao.toFixed(2)} m³/s`,
					};
				}
				break;

			// Vazão Defluente
			case 3: // Mínima
				if (
					r.vlRestricao !== undefined &&
					dados.vazaoDefluente < r.vlRestricao
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Vazão defluente ${dados.vazaoDefluente.toFixed(2)} m³/s abaixo do mínimo de ${r.vlRestricao.toFixed(2)} m³/s`,
					};
				}
				break;
			case 4: // Máxima
				if (
					r.vlRestricao !== undefined &&
					dados.vazaoDefluente > r.vlRestricao
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Vazão defluente ${dados.vazaoDefluente.toFixed(2)} m³/s excede o máximo de ${r.vlRestricao.toFixed(2)} m³/s`,
					};
				}
				break;

			// Vazão Vertida
			case 5: // Mínima
				if (r.vlRestricao !== undefined && dados.vazaoVertida < r.vlRestricao) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Vazão vertida ${dados.vazaoVertida.toFixed(2)} m³/s abaixo do mínimo de ${r.vlRestricao.toFixed(2)} m³/s`,
					};
				}
				break;
			case 6: // Máxima
				if (r.vlRestricao !== undefined && dados.vazaoVertida > r.vlRestricao) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Vazão vertida ${dados.vazaoVertida.toFixed(2)} m³/s excede o máximo de ${r.vlRestricao.toFixed(2)} m³/s`,
					};
				}
				break;

			// Nível Reservatório
			case 19: // Mínimo
				if (
					r.vlRestricao !== undefined &&
					dados.nivelReservatorio < r.vlRestricao
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Nível do reservatório ${dados.nivelReservatorio.toFixed(2)} m abaixo do mínimo de ${r.vlRestricao.toFixed(2)} m`,
					};
				}
				break;
			case 20: // Máximo
				if (
					r.vlRestricao !== undefined &&
					dados.nivelReservatorio > r.vlRestricao
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Nível do reservatório ${dados.nivelReservatorio.toFixed(2)} m excede o máximo de ${r.vlRestricao.toFixed(2)} m`,
					};
				}
				break;

			// Geração
			case 21: // Faixa Proibida
				if (
					r.vlFxIniRest !== undefined &&
					r.vlFxFimRest !== undefined &&
					dados.geracaoMW >= r.vlFxIniRest &&
					dados.geracaoMW <= r.vlFxFimRest
				) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Geração ${dados.geracaoMW.toFixed(2)} MW está na faixa proibida de ${r.vlFxIniRest.toFixed(2)} MW a ${r.vlFxFimRest.toFixed(2)} MW`,
					};
				}
				break;
			case 22: // Mínima
				if (r.vlRestricao !== undefined && dados.geracaoMW < r.vlRestricao) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Geração ${dados.geracaoMW.toFixed(2)} MW abaixo do mínimo de ${r.vlRestricao.toFixed(2)} MW`,
					};
				}
				break;
			case 23: // Máxima
				if (r.vlRestricao !== undefined && dados.geracaoMW > r.vlRestricao) {
					return {
						cdTpRestricao: r.cdTpRestricao,
						dsRestricao: r.dsRestricao,
						mensagem: `Geração ${dados.geracaoMW.toFixed(2)} MW excede o máximo de ${r.vlRestricao.toFixed(2)} MW`,
					};
				}
				break;

			// Taxas de variação (7-18) — requerem dados do período anterior
			// Não implementados no MVP; serão adicionados em iteração futura
			default:
				break;
		}

		return null;
	}
}
