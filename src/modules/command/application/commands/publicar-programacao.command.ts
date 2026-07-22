import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import type { IProgramacaoWriteRepository } from '../../domain/ports/programacao-write-repository.port';
import type { IOutboxRepository } from '../../domain/ports/outbox-repository.port';
import type { OutboxMessage } from '../../domain/entities/outbox-message.entity';
import { DomainException } from '@shared/domain/domain.exception';
import { v4 as uuidv4 } from 'uuid';

export class PublicarProgramacaoCommand {
  constructor(
    public readonly cdProgramacao: number,
    public readonly usuarioId: string = 'system',
  ) {}
}

@Injectable()
@CommandHandler(PublicarProgramacaoCommand)
export class PublicarProgramacaoHandler implements ICommandHandler<PublicarProgramacaoCommand> {
  constructor(
    @Inject('IProgramacaoWriteRepository')
    private readonly programacaoRepo: IProgramacaoWriteRepository,
    @Inject('IOutboxRepository')
    private readonly outboxRepo: IOutboxRepository,
  ) {}

  async execute(command: PublicarProgramacaoCommand): Promise<void> {
    const programacao = await this.programacaoRepo.buscarPorId(command.cdProgramacao);

    if (!programacao) {
      throw new DomainException(`Programação ${command.cdProgramacao} não encontrada.`);
    }

    programacao.publicar(command.usuarioId);

    await this.programacaoRepo.salvar(programacao);

    const eventos = programacao.domainEvents;
    for (const evento of eventos) {
      const outboxMessage: OutboxMessage = {
        id: uuidv4(),
        eventType: evento.eventType,
        payload: JSON.stringify(evento),
        occurredOn: evento.occurredOn,
        processed: false,
      };
      await this.outboxRepo.salvar(outboxMessage);
    }

    programacao.clearEvents();
  }
}
