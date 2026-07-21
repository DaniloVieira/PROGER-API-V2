export interface OutboxMessage {
  id: string;
  eventType: string;
  payload: string;
  occurredOn: Date;
  processed: boolean;
  processedAt?: Date;
  error?: string;
}
