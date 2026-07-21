import type { DataSource, Repository } from "typeorm";
import { PrgOutboxEntity } from "../entities/prg-outbox.entity";
import { TypeOrmOutboxRepository } from "./typeorm-outbox.repository";
import {
	createTestDataSource,
	closeTestDataSource,
} from "../testing/typeorm-testing.helper";

describe("TypeOrmOutboxRepository (Integration)", () => {
	let ds: DataSource;
	let repo: Repository<PrgOutboxEntity>;
	let outboxRepo: TypeOrmOutboxRepository;

	beforeEach(async () => {
		ds = await createTestDataSource();
		repo = ds.getRepository(PrgOutboxEntity);
		outboxRepo = new TypeOrmOutboxRepository(repo);
	});

	afterEach(async () => {
		await closeTestDataSource(ds);
	});

	it("deve salvar e recuperar mensagens não processadas", async () => {
		await outboxRepo.salvar({
			id: "msg-1",
			eventType: "ProgramacaoPublicada",
			payload: '{"cdProgramacao":1}',
			occurredOn: new Date("2025-06-24T10:00:00Z"),
			processed: false,
		});

		const naoProcessados = await outboxRepo.buscarNaoProcessados();

		expect(naoProcessados).toHaveLength(1);
		expect(naoProcessados[0].id).toBe("msg-1");
		expect(naoProcessados[0].processed).toBe(false);
	});

	it("deve marcar mensagem como processada", async () => {
		await outboxRepo.salvar({
			id: "msg-2",
			eventType: "ProgramacaoPublicada",
			payload: '{"cdProgramacao":2}',
			occurredOn: new Date("2025-06-24T10:00:00Z"),
			processed: false,
		});

		await outboxRepo.marcarComoProcessado("msg-2");

		const naoProcessados = await outboxRepo.buscarNaoProcessados();
		expect(naoProcessados).toHaveLength(0);
	});

	it("deve marcar mensagem como falha", async () => {
		await outboxRepo.salvar({
			id: "msg-3",
			eventType: "ProgramacaoPublicada",
			payload: '{"cdProgramacao":3}',
			occurredOn: new Date("2025-06-24T10:00:00Z"),
			processed: false,
		});

		await outboxRepo.marcarComoFalha("msg-3", "Erro de conexão");

		const naoProcessados = await outboxRepo.buscarNaoProcessados();
		expect(naoProcessados).toHaveLength(0);

		const entity = await repo.findOne({ where: { id: "msg-3" } });
		expect(entity?.error).toBe("Erro de conexão");
		expect(entity?.processed).toBe(1);
	});
});
