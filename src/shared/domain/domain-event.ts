export interface DomainEvent {
  readonly eventType: string;
  readonly occurredOn: Date;
}
