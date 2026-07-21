import { Injectable, Inject } from "@nestjs/common";
import type { IRestricaoRepository } from "../../domain/ports/restricao-repository.port";
import {
	ValidadorRestricoes,
	type DadosProgramacao,
	type ViolacaoRestricao,
} from "../../domain/services/validador-restricoes.service";

export interface ValidarRestricoesInput {
	cdUsina: string;
	periodo: number;
	dados: DadosProgramacao;
}

@Injectable()
export class ValidarRestricoesUseCase {
	private readonly validador = new ValidadorRestricoes();

	constructor(
		@Inject("IRestricaoRepository")
		private readonly restricaoRepo: IRestricaoRepository,
	) {}

	async execute(
		input: ValidarRestricoesInput,
	): Promise<ViolacaoRestricao[]> {
		const restricoes = await this.restricaoRepo.buscarRestricoesAtivas(
			input.cdUsina,
			input.periodo,
		);

		return this.validador.validar(input.dados, restricoes);
	}
}
