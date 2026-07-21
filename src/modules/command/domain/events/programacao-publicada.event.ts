import type { DomainEvent } from '@shared/domain/domain-event';

export class ProgramacaoPublicada implements DomainEvent {
  readonly eventType = 'ProgramacaoPublicada';
  readonly occurredOn: Date;

  constructor(
    public readonly cdProgramacao: number,
    public readonly publicadoPor: string,
    public readonly dtPublicacao: Date,
  ) {
    this.occurredOn = new Date();
  }
}
