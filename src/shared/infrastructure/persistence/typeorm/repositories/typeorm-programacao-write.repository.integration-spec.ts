import type { DataSource, Repository } from "typeorm";
import { PrgProgramacaoEntity } from "../entities/prg-programacao.entity";
import { TypeOrmProgramacaoWriteRepository } from "./typeorm-programacao-write.repository";
import {
	Programacao,
	SituacaoProgramacao,
} from "@modules/command/domain/entities/programacao.entity";
import {
	createTestDataSource,
	closeTestDataSource,
} from "../testing/typeorm-testing.helper";

function makeUtcDate(dateStr: string): Date {
	return new Date(`${dateStr}T12:00:00Z`);
}

describe("TypeOrmProgramacaoWriteRepository (Integration)", () => {
	let ds: DataSource;
	let programacaoRepo: Repository<PrgProgramacaoEntity>;
	let repository: TypeOrmProgramacaoWriteRepository;

	beforeEach(async () => {
		ds = await createTestDataSource();
		programacaoRepo = ds.getRepository(PrgProgramacaoEntity);
		repository = new TypeOrmProgramacaoWriteRepository(programacaoRepo);
	});

	afterEach(async () => {
		await closeTestDataSource(ds);
	});

	it("deve salvar nova programacao e serializar dtProgramacao corretamente ao buscar", async () => {
		const prog = Programacao.create({
			cdProgramacao: 1,
			cdUsina: "UHJA",
			dtProgramacao: "2025-06-24",
			situacao: SituacaoProgramacao.EM_EDICAO,
		});

		await repository.salvar(prog);

		const entity = await programacaoRepo.findOne({
			where: { cdProgramacao: 1 },
		});
		expect(entity).not.toBeNull();
		expect(entity!.cdUsina).toBe("UHJA");

		const buscada = await repository.buscarPorId(1);
		expect(buscada).not.toBeNull();
		expect(buscada!.dtProgramacao).toBe("2025-06-24");
	});

	it("deve atualizar situacao para PUBLICADA", async () => {
		await programacaoRepo.save({
			cdProgramacao: 2,
			cdUsina: "UHJA",
			dtProgramacao: makeUtcDate("2025-06-24"),
			nmUsuario: "teste",
			dtAlteracao: new Date(),
		});

		const prog = Programacao.create({
			cdProgramacao: 2,
			cdUsina: "UHJA",
			dtProgramacao: "2025-06-24",
			situacao: SituacaoProgramacao.PUBLICADA,
		});

		await repository.salvar(prog);

		const entity = await programacaoRepo.findOne({
			where: { cdProgramacao: 2 },
		});
		expect(entity!.dtPublicacao).not.toBeNull();
		expect(entity!.nmUsuarioPublicacao).toBe("system");
	});
});
