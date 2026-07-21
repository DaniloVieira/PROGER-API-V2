export interface IProdutibilidadeRepository {
	buscarPorUsina(cdUsina: string): Promise<number | null>;
}
