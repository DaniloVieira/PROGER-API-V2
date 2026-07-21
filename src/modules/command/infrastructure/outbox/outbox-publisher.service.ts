import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import type { IOutboxRepository } from '../../domain/ports/outbox-repository.port';

@Injectable()
export class OutboxPublisher implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisher.name);
  private intervalId?: NodeJS.Timeout;

  constructor(
    @Inject('IOutboxRepository')
    private readonly outboxRepo: IOutboxRepository,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const enabled = this.config.get('OUTBOX_ENABLED', 'true') !== 'false';
    const intervalMs = this.config.get<number>('OUTBOX_INTERVAL_MS', 30_000);

    if (!enabled) {
      this.logger.log('Outbox polling desabilitado (OUTBOX_ENABLED=false)');
      return;
    }

    this.logger.log(`Outbox polling habilitado — intervalo: ${intervalMs}ms`);

    // Simula publicação assíncrona de eventos no PoC.
    // Na Fase 1, substituir por BullMQ producer.
    this.intervalId = setInterval(async () => {
      try {
        const messages = await this.outboxRepo.buscarNaoProcessados(10);
        for (const message of messages) {
          try {
            this.logger.log(`Publicando evento ${message.eventType} [${message.id}]`);
            // Aqui seria: await this.messageBroker.publish(message);
            await this.outboxRepo.marcarComoProcessado(message.id);
          } catch (error) {
            const err = error instanceof Error ? error.message : String(error);
            this.logger.error(`Falha ao publicar evento ${message.id}: ${err}`);
            await this.outboxRepo.marcarComoFalha(message.id, err);
          }
        }
      } catch (error) {
        this.logger.error(`Erro no polling do outbox: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, intervalMs);
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}