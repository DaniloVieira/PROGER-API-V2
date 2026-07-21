import { Programacao, SituacaoProgramacao } from './programacao.entity';
import { DomainException } from '@shared/domain/domain.exception';
import type { ProgramacaoPublicada } from '../events/programacao-publicada.event';

describe('Programacao', () => {
  const criarProgramacaoEmEdicao = (): Programacao =>
    Programacao.create({
      cdProgramacao: 1,
      cdUsina: 'UHJA',
      dtProgramacao: '2025-06-24',
      situacao: SituacaoProgramacao.EM_EDICAO,
    });

  it('deve criar uma programação em edição', () => {
    const programacao = criarProgramacaoEmEdicao();

    expect(programacao.cdProgramacao).toBe(1);
    expect(programacao.cdUsina).toBe('UHJA');
    expect(programacao.situacao).toBe(SituacaoProgramacao.EM_EDICAO);
    expect(programacao.domainEvents).toHaveLength(0);
  });

  it('deve publicar uma programação em edição', () => {
    const programacao = criarProgramacaoEmEdicao();

    programacao.publicar('user-123');

    expect(programacao.situacao).toBe(SituacaoProgramacao.PUBLICADA);
    expect(programacao.domainEvents).toHaveLength(1);

    const evento = programacao.domainEvents[0] as ProgramacaoPublicada;
    expect(evento.eventType).toBe('ProgramacaoPublicada');
    expect(evento.cdProgramacao).toBe(1);
    expect(evento.publicadoPor).toBe('user-123');
    expect(evento.dtPublicacao).toBeInstanceOf(Date);
  });

  it('deve lançar DomainException ao publicar programação já publicada', () => {
    const programacao = criarProgramacaoEmEdicao();
    programacao.publicar('user-123');

    expect(() => programacao.publicar('user-456')).toThrow(DomainException);
    expect(() => programacao.publicar('user-456')).toThrow(
      'Somente programação em edição pode ser publicada',
    );
  });

  it('deve lançar DomainException ao publicar programação cancelada', () => {
    const programacao = Programacao.create({
      cdProgramacao: 2,
      cdUsina: 'USIM',
      dtProgramacao: '2025-06-24',
      situacao: SituacaoProgramacao.CANCELADA,
    });

    expect(() => programacao.publicar('user-123')).toThrow(DomainException);
  });

  it('deve limpar eventos de domínio após clearEvents', () => {
    const programacao = criarProgramacaoEmEdicao();
    programacao.publicar('user-123');

    expect(programacao.domainEvents).toHaveLength(1);
    programacao.clearEvents();
    expect(programacao.domainEvents).toHaveLength(0);
  });
});
