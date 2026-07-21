import type {
	UsinaHistoricoItem,
	UsinaResumo,
} from "../../domain/read-models/usina-read.model";

export interface IUsinaReadRepository {
	buscarHistorico(
		cdUsina: string,
		dtInicio: string,
		dtFim: string,
	): Promise<UsinaHistoricoItem[]>;
	listar(): Promise<UsinaResumo[]>;
}
