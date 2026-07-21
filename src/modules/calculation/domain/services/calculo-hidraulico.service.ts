import { Vazao } from "../value-objects/vazao";
import { Volume } from "../value-objects/volume";
import { NivelReservatorio } from "../value-objects/nivel-reservatorio";
import { DomainException } from "@shared/domain";

export interface ICalculoHidraulicoService {
	calcularVazaoDefluente(
		geracaoMW: number,
		vazaoVertida: Vazao,
		produtibilidade: number,
		vazaoVaoLivre?: Vazao,
	): Vazao;
	calcularVazaoAfluente(
		vazaoIncremental: Vazao,
		vazoesMontantes: Vazao[],
	): Vazao;
	calcularVolumeTotal(
		volumeAnterior: Volume,
		afluente: Vazao,
		defluente: Vazao,
		coefConvMin: number,
	): Volume;
	calcularNivelReservatorio(
		volume: Volume,
		curva: Array<{ cota: number; volume: number }>,
	): NivelReservatorio;
	calcularVolumeReservatorio(
		nivel: NivelReservatorio,
		curva: Array<{ cota: number; volume: number }>,
	): Volume;
	calcularMediaDefluenteMontante(
		serieDefluentes: Vazao[],
		viagemIni: number,
		viagemFim: number,
		indicePeriodo: number,
	): Vazao;
	preverVaoLivre(
		tabela: Array<{ nivel: number; vazao: number }>,
		nivelAnterior: NivelReservatorio,
	): Vazao;
}

export class CalculoHidraulicoService implements ICalculoHidraulicoService {
	calcularVazaoDefluente(
		geracaoMW: number,
		vazaoVertida: Vazao,
		produtibilidade: number,
		vazaoVaoLivre?: Vazao,
	): Vazao {
		const vazaoTurbinada = Vazao.create(0).toTurbinada(
			geracaoMW,
			produtibilidade,
		);
		const vazaoVaoLivreEfetiva = vazaoVaoLivre ?? Vazao.create(0);
		return vazaoTurbinada.add(vazaoVertida).add(vazaoVaoLivreEfetiva);
	}

	calcularVazaoAfluente(
		vazaoIncremental: Vazao,
		vazoesMontantes: Vazao[],
	): Vazao {
		const somaMontantes = vazoesMontantes.reduce(
			(acc, v) => acc.add(v),
			Vazao.create(0),
		);
		return vazaoIncremental.add(somaMontantes);
	}

	calcularVolumeTotal(
		volumeAnterior: Volume,
		afluente: Vazao,
		defluente: Vazao,
		coefConvMin: number,
	): Volume {
		return volumeAnterior.calcularVariacao(afluente, defluente, coefConvMin);
	}

	calcularNivelReservatorio(
		volume: Volume,
		curva: Array<{ cota: number; volume: number }>,
	): NivelReservatorio {
		return NivelReservatorio.interpolar(volume, curva);
	}

	calcularVolumeReservatorio(
		nivel: NivelReservatorio,
		curva: Array<{ cota: number; volume: number }>,
	): Volume {
		return Volume.fromNivel(nivel.valor, curva);
	}

	calcularMediaDefluenteMontante(
		serieDefluentes: Vazao[],
		viagemIni: number,
		viagemFim: number,
		indicePeriodo: number,
	): Vazao {
		// viagemIni  = offset MAIOR (mais distante no passado)
		// viagemFim  = offset MENOR (mais próximo no presente)
		// No banco: vlTmpViagemIni >= vlTmpViagemFim é o comportamento esperado do legado

		if (serieDefluentes.length === 0) {
			return Vazao.create(0);
		}

		const inicio = indicePeriodo - viagemIni; // período mais antigo
		const fim = indicePeriodo - viagemFim; // período mais recente

		if (fim < 0) {
			return Vazao.create(0);
		}

		const startIdx = Math.max(inicio, 0);
		const endIdx = fim;

		if (startIdx > endIdx) {
			return Vazao.create(0);
		}

		let soma = 0;
		let count = 0;
		for (let i = startIdx; i <= endIdx; i++) {
			if (i < serieDefluentes.length) {
				soma += serieDefluentes[i].valor;
				count++;
			}
		}

		if (count === 0) {
			return Vazao.create(0);
		}

		return Vazao.create(soma / count);
	}

	preverVaoLivre(
		tabela: Array<{ nivel: number; vazao: number }>,
		nivelAnterior: NivelReservatorio,
	): Vazao {
		const sorted = [...tabela].sort((a, b) => a.nivel - b.nivel);

		// Caso exato
		const exato = sorted.find((t) => t.nivel === nivelAnterior.valor);
		if (exato) {
			return Vazao.create(exato.vazao);
		}

		// Interpolação linear
		for (let i = 0; i < sorted.length - 1; i++) {
			const inferior = sorted[i];
			const superior = sorted[i + 1];

			if (
				nivelAnterior.valor >= inferior.nivel &&
				nivelAnterior.valor <= superior.nivel
			) {
				const vazao =
					inferior.vazao +
					((nivelAnterior.valor - inferior.nivel) /
						(superior.nivel - inferior.nivel)) *
						(superior.vazao - inferior.vazao);
				return Vazao.create(parseFloat(vazao.toFixed(2)));
			}
		}

		// Fora da tabela — retorna o limite mais próximo
		if (nivelAnterior.valor < sorted[0].nivel) {
			return Vazao.create(sorted[0].vazao);
		}
		return Vazao.create(sorted[sorted.length - 1].vazao);
	}
}
