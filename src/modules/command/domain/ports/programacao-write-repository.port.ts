import type { Programacao } from '../entities/programacao.entity';

export interface IProgramacaoWriteRepository {
  buscarPorId(cdProgramacao: number): Promise<Programacao | null>;
  salvar(programacao: Programacao): Promise<void>;
}
