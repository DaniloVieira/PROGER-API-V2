export interface ProgramacaoResumo {
	cdProgramacao: number;
	cdUsina: string;
	dtProgramacao: string;
	situacao: string;
}

export interface IProgramacaoReadRepository {
	listar(filtros: {
		cdUsina?: string;
		dtProgramacao?: string;
		page: number;
		size: number;
	}): Promise<{
		items: ProgramacaoResumo[];
		total: number;
		page: number;
		size: number;
	}>;

	buscarDados(cdProgramacao: number): Promise<ProgramacaoDados | null>;

	buscarDadosPainel(filtros: {
		cdUsina: string;
		dtProgramacao: string;
	}): Promise<DadosPainel | null>;
}

export interface ProgramacaoDados {
	cdProgramacao: number;
	cdUsina: string;
	dtProgramacao: string;
	situacao: string;
	dados: DadosProgramacaoItem[];
}

export interface DadosProgramacaoItem {
	periodo: number; // índice do período (0-47 para meia-hora, etc.)
	geracaoMW: number;
	vazaoVertida: number;
	vazaoIncremental: number;
	nivelReservatorio: number;
	volumeTotal: number;
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoAfluente: number;
	dadosVerificados: boolean;
}

export interface DadosPainelItem {
	periodo: number;
	dtProgramacao: string;
	geracaoMW: number;
	geracaoMWOns?: number;
	vazaoVertida: number;
	vazaoIncremental: number;
	nivelReservatorio: number;
	volumeTotal: number;
	vazaoTurbinada: number;
	vazaoDefluente: number;
	vazaoAfluente: number;
	disponivel: number;
	dadosVerificados: boolean;
	nivelMaximoReservatorio?: number;
	nivelMinimoReservatorio?: number;
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

export interface DadosPainel {
	cdUsina: string;
	dtProgramacao: string;
	dados: DadosPainelItem[];
	eixoVazaoGeracao: number[];
	eixoNivelRes: number[];
	eixoDispGeracao: number[];
	alertasRestricoesPainel?: AlertasRestricoesPainel;
	// true se geracao ONS diverge da geracao programada em qualquer periodo do dia atual
	onsPainel?: boolean;
}
