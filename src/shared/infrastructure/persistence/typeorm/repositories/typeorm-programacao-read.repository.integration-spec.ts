import type { DataSource, Repository } from "typeorm";
import { PrgProgramacaoEntity } from "../entities/prg-programacao.entity";
import { PrgDadosProgramacaoEntity } from "../entities/prg-dados-programacao.entity";
import { PrgUsinaEntity } from "../entities/prg-usina.entity";
import { TypeOrmProgramacaoReadRepository } from "./typeorm-programacao-read.repository";
import { TypeOrmCurvaCotaVolRepository } from "./typeorm-curva-cota-vol.repository";
import { TypeOrmRelacUsinasRepository } from "./typeorm-relac-usinas.repository";
import { TypeOrmParametrosRepository } from "./typeorm-parametros.repository";
import type { ICalculoHidraulicoService } from "@modules/calculation/domain/services/calculo-hidraulico.service";
import type { IProdutibilidadeRepository } from "@modules/calculation/domain/ports/produtibilidade-repository.port";
import type { IRestricaoRepository } from "@modules/restriction/domain/ports/restricao-repository.port";
import {
	createTestDataSource,
	closeTestDataSource,
} from "../testing/typeorm-testing.helper";

function makeUtcDate(dateStr: string): Date {
	return new Date(`${dateStr}T12:00:00Z`);
}

describe("TypeOrmProgramacaoReadRepository (Integration)", () => {
	let ds: DataSource;
	let programacaoRepo: Repository<PrgProgramacaoEntity>;
	let dadosRepo: Repository<PrgDadosProgramacaoEntity>;
	let repository: TypeOrmProgramacaoReadRepository;

	beforeEach(async () => {
		ds = await createTestDataSource();
		programacaoRepo = ds.getRepository(PrgProgramacaoEntity);
		dadosRepo = ds.getRepository(PrgDadosProgramacaoEntity);

		const mockCurvaRepo = {} as unknown as TypeOrmCurvaCotaVolRepository;
		const mockRelacRepo = {} as unknown as TypeOrmRelacUsinasRepository;
		const mockParamRepo = {} as unknown as TypeOrmParametrosRepository;
		const mockCalculoService = {} as unknown as ICalculoHidraulicoService;
		const mockProdutibilidadeRepo = {} as unknown as IProdutibilidadeRepository;
		const mockRestricaoRepo = {} as unknown as IRestricaoRepository;

		repository = new TypeOrmProgramacaoReadRepository(
			programacaoRepo,
			dadosRepo,
			mockCurvaRepo,
			mockRelacRepo,
			mockParamRepo,
			mockCalculoService,
			mockProdutibilidadeRepo,
			mockRestricaoRepo,
		);

		await ds.getRepository(PrgUsinaEntity).save({
			cdUsina: "UHJA",
			nmUsina: "Usina JA",
			cdTipoUsina: 1,
			flUsinaEngie: 1,
			cdSiglaUsina: "JA",
			cdGrpUsina: "G1",
			nrOrdUsina: 1,
			flUsinaAtv: 1,
		});
	});

	afterEach(async () => {
		await closeTestDataSource(ds);
	});

	it("deve listar programacoes e serializar dtProgramacao como string YYYY-MM-DD", async () => {
		await programacaoRepo.save({
			cdProgramacao: 1,
			cdUsina: "UHJA",
			dtProgramacao: makeUtcDate("2025-06-24"),
			nmUsuario: "teste",
			dtAlteracao: new Date(),
		});

		const result = await repository.listar({ page: 1, size: 20 });

		expect(result.items).toHaveLength(1);
		expect(result.items[0].dtProgramacao).toBe("2025-06-24");
		expect(typeof result.items[0].dtProgramacao).toBe("string");
	});

	it("deve filtrar por cdUsina", async () => {
		await programacaoRepo.save({
			cdProgramacao: 1,
			cdUsina: "UHJA",
			dtProgramacao: makeUtcDate("2025-06-24"),
			nmUsuario: "teste",
			dtAlteracao: new Date(),
		});
		await programacaoRepo.save({
			cdProgramacao: 2,
			cdUsina: "USIM",
			dtProgramacao: makeUtcDate("2025-06-25"),
			nmUsuario: "teste",
			dtAlteracao: new Date(),
		});

		const result = await repository.listar({
			cdUsina: "UHJA",
			page: 1,
			size: 20,
		});

		expect(result.items).toHaveLength(1);
		expect(result.items[0].cdUsina).toBe("UHJA");
	});

	it("deve buscar dados com dtProgramacao serializado corretamente", async () => {
		await programacaoRepo.save({
			cdProgramacao: 1,
			cdUsina: "UHJA",
			dtProgramacao: makeUtcDate("2025-06-24"),
			nmUsuario: "teste",
			dtAlteracao: new Date(),
			dtPublicacao: new Date(),
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

		const result = await repository.buscarDados(1);

		expect(result).not.toBeNull();
		expect(result!.dtProgramacao).toBe("2025-06-24");
		expect(result!.situacao).toBe("PUBLICADA");
		expect(result!.dados).toHaveLength(1);
		expect(result!.dados[0].geracaoMW).toBe(100);
	});
});
