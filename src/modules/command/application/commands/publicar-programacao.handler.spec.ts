import { Test, type TestingModule } from '@nestjs/testing';
import { PublicarProgramacaoCommand, PublicarProgramacaoHandler } from './publicar-programacao.command';
import type { IProgramacaoWriteRepository } from '../../domain/ports/programacao-write-repository.port';
import type { IOutboxRepository } from '../../domain/ports/outbox-repository.port';
import { Programacao, SituacaoProgramacao } from '../../domain/entities/programacao.entity';
import type { OutboxMessage } from '../../domain/entities/outbox-message.entity';

class FakeProgramacaoWriteRepository implements IProgramacaoWriteRepository {
  private store = new Map<number, Programacao>();

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
  }

  async buscarPorId(cdProgramacao: number): Promise<Programacao | null> {
    return this.store.get(cdProgramacao) ?? null;
  }

  async salvar(programacao: Programacao): Promise<void> {
    this.store.set(programacao.cdProgramacao, programacao);
  }

  async atualizarDados(): Promise<void> {
    // no-op for publicar tests
  }
}

class FakeOutboxRepository implements IOutboxRepository {
  private messages: OutboxMessage[] = [];

  async salvar(message: OutboxMessage): Promise<void> {
    this.messages.push(message);
  }

  async buscarNaoProcessados(): Promise<OutboxMessage[]> {
    return this.messages.filter((m) => !m.processed);
  }

  async marcarComoProcessado(): Promise<void> {}
  async marcarComoFalha(): Promise<void> {}

  getMessages(): OutboxMessage[] {
    return this.messages;
  }
}

describe('PublicarProgramacaoHandler', () => {
  let handler: PublicarProgramacaoHandler;
  let programacaoRepo: FakeProgramacaoWriteRepository;
  let outboxRepo: FakeOutboxRepository;

  beforeEach(async () => {
    programacaoRepo = new FakeProgramacaoWriteRepository();
    outboxRepo = new FakeOutboxRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicarProgramacaoHandler,
        { provide: 'IProgramacaoWriteRepository', useValue: programacaoRepo },
        { provide: 'IOutboxRepository', useValue: outboxRepo },
      ],
    }).compile();

    handler = module.get<PublicarProgramacaoHandler>(PublicarProgramacaoHandler);
  });

  it('deve publicar programação e salvar evento na outbox', async () => {
    const command = new PublicarProgramacaoCommand(1, 'user-123');

    await handler.execute(command);

    const programacaoSalva = await programacaoRepo.buscarPorId(1);
    expect(programacaoSalva).not.toBeNull();
    expect(programacaoSalva!.situacao).toBe(SituacaoProgramacao.PUBLICADA);

    const outboxMessages = outboxRepo.getMessages();
    expect(outboxMessages).toHaveLength(1);
    expect(outboxMessages[0].eventType).toBe('ProgramacaoPublicada');
    expect(outboxMessages[0].processed).toBe(false);

    const payload = JSON.parse(outboxMessages[0].payload);
    expect(payload.cdProgramacao).toBe(1);
    expect(payload.publicadoPor).toBe('user-123');
  });

  it('deve lançar erro se programação não for encontrada', async () => {
    const command = new PublicarProgramacaoCommand(999, 'user-123');

    await expect(handler.execute(command)).rejects.toThrow('Programação 999 não encontrada');
  });

  it('deve lançar erro se programação já estiver publicada', async () => {
    const primeira = new PublicarProgramacaoCommand(1, 'user-123');
    await handler.execute(primeira);

    const segunda = new PublicarProgramacaoCommand(1, 'user-456');
    await expect(handler.execute(segunda)).rejects.toThrow('Somente programação em edição pode ser publicada');
  });
});
