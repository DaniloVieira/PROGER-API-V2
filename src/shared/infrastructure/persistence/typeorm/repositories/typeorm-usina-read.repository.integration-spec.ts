import type { DataSource, Repository } from "typeorm";
import { PrgUsinaEntity } from "../entities/prg-usina.entity";
import { PrgDadosProgramacaoEntity } from "../entities/prg-dados-programacao.entity";
import { TypeOrmUsinaReadRepository } from "./typeorm-usina-read.repository";
import {
	createTestDataSource,
	closeTestDataSource,
} from "../testing/typeorm-testing.helper";

function makeUtcDate(dateStr: string): Date {
	return new Date(`${dateStr}T12:00:00Z`);
}

describe("TypeOrmUsinaReadRepository (Integration)", () => {
	let ds: DataSource;
	let usinaRepo: Repository<PrgUsinaEntity>;
	let dadosRepo: Repository<PrgDadosProgramacaoEntity>;
	let repository: TypeOrmUsinaReadRepository;

	beforeEach(async () => {
		ds = await createTestDataSource();
		usinaRepo = ds.getRepository(PrgUsinaEntity);
		dadosRepo = ds.getRepository(PrgDadosProgramacaoEntity);
		repository = new TypeOrmUsinaReadRepository(usinaRepo, dadosRepo);
	});

	afterEach(async () => {
		await closeTestDataSource(ds);
	});

	it("deve listar usinas ativas", async () => {
		await usinaRepo.save({
			cdUsina: "UHJA",
			nmUsina: "Usina JA",
			cdTipoUsina: 1,
			flUsinaEngie: 1,
			cdSiglaUsina: "JA",
			cdGrpUsina: "G1",
			nrOrdUsina: 1,
			flUsinaAtv: 1,
		});
		await usinaRepo.save({
			cdUsina: "USIM",
			nmUsina: "Usina SIM",
			cdTipoUsina: 2,
			flUsinaEngie: 1,
			cdSiglaUsina: "SM",
			cdGrpUsina: "G2",
			nrOrdUsina: 2,
			flUsinaAtv: 0,
		});

		const result = await repository.listar();

		expect(result).toHaveLength(2);
		expect(result[0].cdUsina).toBe("UHJA");
		expect(result[0].situacao).toBe("ATIVA");
		expect(result[1].situacao).toBe("INATIVA");
	});

	it("deve buscar historico e serializar dtProgramacao corretamente", async () => {
		await usinaRepo.save({
			cdUsina: "UHJA",
			nmUsina: "Usina JA",
			cdTipoUsina: 1,
			flUsinaEngie: 1,
			cdSiglaUsina: "JA",
			cdGrpUsina: "G1",
			nrOrdUsina: 1,
			flUsinaAtv: 1,
		});
		await dadosRepo.save({
			cdDadosProg: 1,
			cdProgramacao: 1,
			cdUsina: "UHJA",
			dtProgramacao: makeUtcDate("2025-06-24"),
			nrGeracao: 100,
			nrVazaoIncr: 50,
			nrVazaoVertida: 20,
			nrVazaoDefluente: 120,
			nrVazaoAfluente: 150,
			nrVazaoTurb: 100,
			vlVolume: 1000.5,
			vlNivelRes: 557.41,
			nrDisponivel: 1,
			flGerManual: 0,
		});

		const result = await repository.buscarHistorico(
			"UHJA",
			"2025-06-01",
			"2025-06-30",
		);

		expect(result).toHaveLength(1);
		expect(result[0].dtProgramacao).toBe("2025-06-24");
		expect(typeof result[0].dtProgramacao).toBe("string");
	});
});
