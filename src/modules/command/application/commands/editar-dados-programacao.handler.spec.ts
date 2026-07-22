import { Test, type TestingModule } from '@nestjs/testing';
import { EditarDadosProgramacaoCommand, EditarDadosProgramacaoHandler } from './editar-dados-programacao.command';
import type { IProgramacaoWriteRepository } from '../../domain/ports/programacao-write-repository.port';
import { Programacao, SituacaoProgramacao } from '../../domain/entities/programacao.entity';
import { DomainException } from '@shared/domain/domain.exception';

class FakeProgramacaoWriteRepository implements IProgramacaoWriteRepository {
  private store = new Map<number, Programacao>();
  private dadosStore = new Map<number, Array<{ periodo: number; geracaoMW?: number; vazaoVertida?: number; vazaoIncremental?: number }>>();
  private lastDtAlteracao = new Map<number, string>();

  constructor() {
    this.store.set(
      1,
      Programacao.create({
        cdProgramacao: 1,
        cdUsina: 'UHJA',
        dtProgramacao: '2025-06-24',
        situacao: SituacaoProgramacao.EM_EDICAO,
      }),
    );
    this.store.set(
      2,
      Programacao.create({
        cdProgramacao: 2,
        cdUsina: 'UHCC',
        dtProgramacao: '2025-06-24',
        situacao: SituacaoProgramacao.PUBLICADA,
      }),
    );
  }

  async buscarPorId(cdProgramacao: number): Promise<Programacao | null> {
    return this.store.get(cdProgramacao) ?? null;
  }

  async salvar(programacao: Programacao): Promise<void> {
    this.store.set(programacao.cdProgramacao, programacao);
  }

  async atualizarDados(cdProgramacao: number, dados: Array<{ periodo: number; geracaoMW?: number; vazaoVertida?: number; vazaoIncremental?: number }>, dtAlteracao?: string): Promise<void> {
    const programacao = this.store.get(cdProgramacao);
    if (!programacao) {
      throw new DomainException(`Programação ${cdProgramacao} não encontrada.`);
    }
    if (dtAlteracao && this.lastDtAlteracao.get(cdProgramacao) !== dtAlteracao) {
      throw new DomainException('A programação foi alterada por outro usuário. Recarregue os dados e tente novamente.');
    }
    this.dadosStore.set(cdProgramacao, dados);
    this.lastDtAlteracao.set(cdProgramacao, new Date().toISOString());
  }
}

describe('EditarDadosProgramacaoHandler', () => {
  let handler: EditarDadosProgramacaoHandler;
  let programacaoRepo: FakeProgramacaoWriteRepository;

  beforeEach(async () => {
    programacaoRepo = new FakeProgramacaoWriteRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditarDadosProgramacaoHandler,
        { provide: 'IProgramacaoWriteRepository', useValue: programacaoRepo },
      ],
    }).compile();

    handler = module.get<EditarDadosProgramacaoHandler>(EditarDadosProgramacaoHandler);
  });

  it('deve editar dados de programação em edição', async () => {
    const command = new EditarDadosProgramacaoCommand(1, [
      { periodo: 0, geracaoMW: 100 },
      { periodo: 1, geracaoMW: 110 },
    ]);

    await handler.execute(command);

    const dadosSalvos = programacaoRepo['dadosStore'].get(1);
    expect(dadosSalvos).toHaveLength(2);
    expect(dadosSalvos![0].geracaoMW).toBe(100);
  });

  it('deve lançar erro se programação não for encontrada', async () => {
    const command = new EditarDadosProgramacaoCommand(999, [{ periodo: 0, geracaoMW: 100 }]);

    await expect(handler.execute(command)).rejects.toThrow('Programação 999 não encontrada');
  });

  it('deve lançar erro se programação já estiver publicada', async () => {
    const command = new EditarDadosProgramacaoCommand(2, [{ periodo: 0, geracaoMW: 100 }]);

    await expect(handler.execute(command)).rejects.toThrow('Somente programação em edição pode ser alterada');
  });

  it('deve respeitar optimistic locking com dtAlteracao', async () => {
    const command = new EditarDadosProgramacaoCommand(1, [{ periodo: 0, geracaoMW: 100 }], '2025-06-24T10:00:00.000Z');

    await expect(handler.execute(command)).rejects.toThrow('A programação foi alterada por outro usuário');
  });
});
