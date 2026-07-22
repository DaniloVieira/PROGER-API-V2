import { Injectable, Inject } from "@nestjs/common";
import type { ICalculoHidraulicoService } from "../../domain/services/calculo-hidraulico.service";
import { Vazao } from "../../domain/value-objects/vazao";
import { Volume } from "../../domain/value-objects/volume";

export interface CalcularProgramacaoHidraulicoInput {
	cdUsina: string;
	geracaoMW: number;
	vazaoVertida: number;
	vazaoIncremental: number;
	vazoesMontantes: number[];
	volumeAnteriorHm3: number;
	coefConvMin: number;
	curvaCotaVolume: Array<{ cota: number; volume: number }>;
	produtibilidade: number; // passado do batch para evitar N+1
}

export interface CalcularProgramacaoHidraulicoOutput {
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoAfluente: number;
	volumeTotalHm3: number;
	nivelReservatorio: number;
	disponivel?: number;
}

@Injectable()
export class CalcularProgramacaoHidraulicoUseCase {
	constructor(
		@Inject("ICalculoHidraulicoService")
		private readonly calculoService: ICalculoHidraulicoService,
	) {}

	async execute(
		input: CalcularProgramacaoHidraulicoInput,
	): Promise<CalcularProgramacaoHidraulicoOutput> {
		const produtibilidade = input.produtibilidade;

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

		// Disponibilidade teórica = produtibilidade * nível (aproximação)
		const disponivel = produtibilidade * nivelReservatorio.valor;

		return {
			vazaoTurbinada: vazaoDefluente.subtract(vazaoVertida).valor,
			vazaoDefluente: vazaoDefluente.valor,
			vazaoAfluente: vazaoAfluente.valor,
			volumeTotalHm3: volumeTotal.valorHm3,
			nivelReservatorio: nivelReservatorio.valor,
			disponivel: Math.round(disponivel * 100) / 100,
		};
	}
}
