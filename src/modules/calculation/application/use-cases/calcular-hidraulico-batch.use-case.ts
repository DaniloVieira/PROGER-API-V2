import { Injectable, Inject } from "@nestjs/common";
import type {
	CalcularProgramacaoHidraulicoUseCase,
	CalcularProgramacaoHidraulicoInput,
} from "./calcular-programacao-hidraulico.use-case";
import type { ValidarPainelUseCase } from "@modules/restriction/application/use-cases/validar-painel.use-case";
import type {
	DadosPainelPeriodo,
	AlertasRestricoesPainel,
} from "@modules/restriction/domain/services/validador-painel.service";
import type { IProdutibilidadeRepository } from "../../domain/ports/produtibilidade-repository.port";

export interface CalcularHidraulicoBatchInput {
	cdUsina: string;
	coefConvMin: number;
	volumeInicialHm3: number;
	curvaCotaVolume: Array<{ cota: number; volume: number }>;
	periodos: Array<{
		periodo: number;
		geracaoMW: number;
		vazaoVertida: number;
		vazaoIncremental: number;
		vazoesMontantes?: number[];
	}>;
}

export interface CalcularHidraulicoBatchPeriodoOutput {
	periodo: number;
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoAfluente: number;
	volumeTotalHm3: number;
	nivelReservatorio: number;
	disponivel?: number;
}

export interface CalcularHidraulicoBatchOutput {
	cdUsina: string;
	periodos: CalcularHidraulicoBatchPeriodoOutput[];
	alertas: AlertasRestricoesPainel;
}

@Injectable()
export class CalcularHidraulicoBatchUseCase {
	constructor(
		private readonly calcularHidraulicoUseCase: CalcularProgramacaoHidraulicoUseCase,
		private readonly validarPainelUseCase: ValidarPainelUseCase,
		@Inject("IProdutibilidadeRepository")
		private readonly produtibilidadeRepo: IProdutibilidadeRepository,
	) {}

	async execute(
		input: CalcularHidraulicoBatchInput,
	): Promise<CalcularHidraulicoBatchOutput> {
		const produtibilidade = await this.produtibilidadeRepo.buscarPorUsina(
			input.cdUsina,
		);
		if (produtibilidade === null) {
			throw new Error(
				`Produtibilidade não encontrada para usina ${input.cdUsina}`,
			);
		}

		const periodosOutput: CalcularHidraulicoBatchPeriodoOutput[] = [];
		let volumeAnteriorHm3 = input.volumeInicialHm3;

		for (const periodo of input.periodos) {
			const useCaseInput: CalcularProgramacaoHidraulicoInput = {
				cdUsina: input.cdUsina,
				geracaoMW: periodo.geracaoMW,
				vazaoVertida: periodo.vazaoVertida,
				vazaoIncremental: periodo.vazaoIncremental,
				vazoesMontantes: periodo.vazoesMontantes ?? [],
				volumeAnteriorHm3,
				coefConvMin: input.coefConvMin,
				curvaCotaVolume: input.curvaCotaVolume,
				produtibilidade,
			};

			const resultado = await this.calcularHidraulicoUseCase.execute(
				useCaseInput,
			);

			periodosOutput.push({
				periodo: periodo.periodo,
				vazaoTurbinada: resultado.vazaoTurbinada,
				vazaoDefluente: resultado.vazaoDefluente,
				vazaoAfluente: resultado.vazaoAfluente,
				volumeTotalHm3: resultado.volumeTotalHm3,
				nivelReservatorio: resultado.nivelReservatorio,
				disponivel: resultado.disponivel,
			});

			volumeAnteriorHm3 = resultado.volumeTotalHm3;
		}

		const dadosPainel: DadosPainelPeriodo[] = periodosOutput.map(
			(p, idx) => ({
				periodo: p.periodo,
				geracaoMW: input.periodos[idx].geracaoMW,
				vazaoVertida: input.periodos[idx].vazaoVertida,
				vazaoIncremental: input.periodos[idx].vazaoIncremental,
				nivelReservatorio: p.nivelReservatorio,
				vazaoTurbinada: p.vazaoTurbinada,
				vazaoDefluente: p.vazaoDefluente,
				vazaoAfluente: p.vazaoAfluente,
			}),
		);

		const alertas = await this.validarPainelUseCase.execute(
			input.cdUsina,
			dadosPainel,
		);

		return {
			cdUsina: input.cdUsina,
			periodos: periodosOutput,
			alertas,
		};
	}
}
