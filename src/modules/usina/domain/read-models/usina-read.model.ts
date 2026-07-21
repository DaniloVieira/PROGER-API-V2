export interface UsinaHistoricoItem {
	dtProgramacao: string;
	periodo: number;
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

export interface UsinaResumo {
	cdUsina: string;
	nomeUsina: string;
	tipo: "HIDRO" | "TERMO";
	situacao: "ATIVA" | "INATIVA";
	flUsinaEngie: number;
	flUsinaAtv: number;
	nrOrdUsina: number;
}
