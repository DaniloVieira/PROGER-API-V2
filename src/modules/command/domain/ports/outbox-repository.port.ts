import type { OutboxMessage } from '../entities/outbox-message.entity';

export interface IOutboxRepository {
  salvar(message: OutboxMessage): Promise<void>;
  buscarNaoProcessados(limit?: number): Promise<OutboxMessage[]>;
  marcarComoProcessado(id: string): Promise<void>;
  marcarComoFalha(id: string, error: string): Promise<void>;
}
