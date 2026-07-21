import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository, LessThan } from 'typeorm';
import { PrgOutboxEntity } from '../entities/prg-outbox.entity';
import type { IOutboxRepository } from '@modules/command/domain/ports/outbox-repository.port';
import type { OutboxMessage } from '@modules/command/domain/entities/outbox-message.entity';

@Injectable()
export class TypeOrmOutboxRepository implements IOutboxRepository {
  constructor(
    @InjectRepository(PrgOutboxEntity)
    private readonly outboxRepo: Repository<PrgOutboxEntity>,
  ) {}

  async salvar(message: OutboxMessage): Promise<void> {
    const entity = new PrgOutboxEntity();
    entity.id = message.id;
    entity.eventType = message.eventType;
    entity.payload = message.payload;
    entity.occurredOn = message.occurredOn;
    entity.processed = message.processed ? 1 : 0;
    entity.processedAt = message.processedAt ?? null;
    entity.error = message.error ?? null;

    await this.outboxRepo.save(entity);
  }

  async buscarNaoProcessados(limit = 100): Promise<OutboxMessage[]> {
    const entities = await this.outboxRepo.find({
      where: { processed: 0 },
      order: { occurredOn: 'ASC' },
      take: limit,
    });

    return entities.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      payload: e.payload,
      occurredOn: e.occurredOn,
      processed: e.processed === 1,
      processedAt: e.processedAt ?? undefined,
      error: e.error ?? undefined,
    }));
  }

  async marcarComoProcessado(id: string): Promise<void> {
    await this.outboxRepo.update(
      { id },
      { processed: 1, processedAt: new Date() },
    );
  }

  async marcarComoFalha(id: string, error: string): Promise<void> {
    await this.outboxRepo.update(
      { id },
      { processed: 1, processedAt: new Date(), error },
    );
  }
}
