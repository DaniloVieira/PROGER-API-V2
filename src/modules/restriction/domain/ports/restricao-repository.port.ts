export interface RestricaoAtiva {
	cdTpRestricao: number;
	dsRestricao: string;
	dsVarRef: string;
	vlRestricao?: number;
	vlFxIniRest?: number;
	vlFxFimRest?: number;
	dtIniRestricao?: Date;
	dtFimRestricao?: Date;
}

export interface IRestricaoRepository {
	buscarRestricoesAtivas(
		cdUsina: string,
		periodo: number,
	): Promise<RestricaoAtiva[]>;
}
