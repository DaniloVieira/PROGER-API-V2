import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "PRG_OUTBOX" })
export class PrgOutboxEntity {
	@PrimaryColumn({ name: "ID", type: "varchar", length: 36 })
	id: string;

	@Column({ name: "EVENT_TYPE", type: "varchar", length: 100 })
	eventType: string;

	@Column({ name: "PAYLOAD", type: "clob" })
	payload: string;

	@Column({ name: "OCCURRED_ON", type: "timestamp" })
	occurredOn: Date;

	@Column({ name: "PROCESSED", type: "int", default: 0 })
	processed: number;

	@Column({ name: "PROCESSED_AT", type: "timestamp", nullable: true })
	processedAt: Date | null;

	@Column({ name: "ERROR", type: "varchar", length: 4000, nullable: true })
	error: string | null;
}
