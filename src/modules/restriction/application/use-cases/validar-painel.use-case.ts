import { Injectable, Inject } from "@nestjs/common";
import type { IRestricaoRepository } from "../../domain/ports/restricao-repository.port";
import {
	ValidadorPainelService,
	type DadosPainelPeriodo,
	type AlertasRestricoesPainel,
} from "../../domain/services/validador-painel.service";

@Injectable()
export class ValidarPainelUseCase {
	private readonly validador = new ValidadorPainelService();

	constructor(
		@Inject("IRestricaoRepository")
		private readonly restricaoRepo: IRestricaoRepository,
	) {}

	async execute(
		cdUsina: string,
		dados: DadosPainelPeriodo[],
	): Promise<AlertasRestricoesPainel> {
		const restricoes = await this.restricaoRepo.buscarRestricoesAtivas(
			cdUsina,
			0,
		);
		return this.validador.validar(dados, restricoes);
	}
}
