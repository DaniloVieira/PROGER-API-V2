import { Injectable, Inject } from "@nestjs/common";
import type { ICalculoHidraulicoService } from "../../domain/services/calculo-hidraulico.service";
import type { IProdutibilidadeRepository } from "../../domain/ports/produtibilidade-repository.port";
import { Vazao } from "../../domain/value-objects/vazao";
import { Volume } from "../../domain/value-objects/volume";
import { NivelReservatorio } from "../../domain/value-objects/nivel-reservatorio";

export interface CalcularProgramacaoHidraulicoInput {
	cdUsina: string;
	geracaoMW: number;
	vazaoVertida: number;
	vazaoIncremental: number;
	vazoesMontantes: number[];
	volumeAnteriorHm3: number;
	coefConvMin: number;
	curvaCotaVolume: Array<{ cota: number; volume: number }>;
}

export interface CalcularProgramacaoHidraulicoOutput {
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoAfluente: number;
	volumeTotalHm3: number;
	nivelReservatorio: number;
}

@Injectable()
export class CalcularProgramacaoHidraulicoUseCase {
	constructor(
		@Inject("ICalculoHidraulicoService")
		private readonly calculoService: ICalculoHidraulicoService,
		@Inject("IProdutibilidadeRepository")
		private readonly produtibilidadeRepo: IProdutibilidadeRepository,
	) {}

	async execute(
		input: CalcularProgramacaoHidraulicoInput,
	): Promise<CalcularProgramacaoHidraulicoOutput> {
		const produtibilidade = await this.produtibilidadeRepo.buscarPorUsina(
			input.cdUsina,
		);

		if (produtibilidade === null) {
			throw new Error(
				`Produtibilidade não encontrada para usina ${input.cdUsina}`,
			);
		}

		const vazaoVertida = Vazao.create(input.vazaoVertida);
		const vazaoDefluente = this.calculoService.calcularVazaoDefluente(
			input.geracaoMW,
			vazaoVertida,
			produtibilidade,
		);

		const vazaoIncremental = Vazao.create(input.vazaoIncremental);
		const vazoesMontantes = input.vazoesMontantes.map((v) =>
			Vazao.create(v),
		);
		const vazaoAfluente = this.calculoService.calcularVazaoAfluente(
			vazaoIncremental,
			vazoesMontantes,
		);

		const volumeAnterior = Volume.create(input.volumeAnteriorHm3);
		const volumeTotal = this.calculoService.calcularVolumeTotal(
			volumeAnterior,
			vazaoAfluente,
			vazaoDefluente,
			input.coefConvMin,
		);

		const nivelReservatorio =
			this.calculoService.calcularNivelReservatorio(
				volumeTotal,
				input.curvaCotaVolume,
			);

		return {
			vazaoTurbinada: vazaoDefluente.subtract(vazaoVertida).valor,
			vazaoDefluente: vazaoDefluente.valor,
			vazaoAfluente: vazaoAfluente.valor,
			volumeTotalHm3: volumeTotal.valorHm3,
			nivelReservatorio: nivelReservatorio.valor,
		};
	}
}
