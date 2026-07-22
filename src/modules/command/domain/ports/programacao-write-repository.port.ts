import type { Programacao } from '../entities/programacao.entity';

export interface DadosProgramacaoEditarItem {
  periodo: number;
  geracaoMW?: number;
  vazaoVertida?: number;
  vazaoIncremental?: number;
}

export interface IProgramacaoWriteRepository {
  buscarPorId(cdProgramacao: number): Promise<Programacao | null>;
  salvar(programacao: Programacao): Promise<void>;
  atualizarDados(cdProgramacao: number, dados: DadosProgramacaoEditarItem[], dtAlteracao?: string): Promise<void>;
}
