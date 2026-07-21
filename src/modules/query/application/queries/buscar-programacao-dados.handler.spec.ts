import {
	BuscarProgramacaoDadosQuery,
	BuscarProgramacaoDadosHandler,
} from "./buscar-programacao-dados.query";
import type {
	IProgramacaoReadRepository,
	ProgramacaoDados,
} from "../../domain/read-models/programacao-read.model";

describe("BuscarProgramacaoDadosHandler", () => {
	let handler: BuscarProgramacaoDadosHandler;
	let repository: jest.Mocked<IProgramacaoReadRepository>;

	beforeEach(() => {
		repository = {
			listar: jest.fn(),
			buscarDados: jest.fn(),
			buscarDadosPainel: jest.fn(),
		};
		handler = new BuscarProgramacaoDadosHandler(repository);
	});

	it("deve retornar dados da programação quando encontrada", async () => {
		const mockDados: ProgramacaoDados = {
			cdProgramacao: 1,
			cdUsina: "UHJA",
			dtProgramacao: "2025-06-24",
			situacao: "EM_EDICAO",
			dados: [
				{
					periodo: 0,
					geracaoMW: 100,
					vazaoVertida: 5,
					vazaoIncremental: 40,
					nivelReservatorio: 650,
					volumeTotal: 1200.5,
					vazaoTurbinada: 20,
					vazaoDefluente: 25,
					vazaoAfluente: 65,
					dadosVerificados: true,
				},
			],
		};
		repository.buscarDados.mockResolvedValue(mockDados);

		const query = new BuscarProgramacaoDadosQuery(1);
		const result = await handler.execute(query);

		expect(repository.buscarDados).toHaveBeenCalledWith(1);
		expect(result).not.toBeNull();
		expect(result?.cdProgramacao).toBe(1);
		expect(result?.dados).toHaveLength(1);
		expect(result?.dados[0].geracaoMW).toBe(100);
	});

	it("deve retornar null quando programação não encontrada", async () => {
		repository.buscarDados.mockResolvedValue(null);

		const query = new BuscarProgramacaoDadosQuery(999);
		const result = await handler.execute(query);

		expect(repository.buscarDados).toHaveBeenCalledWith(999);
		expect(result).toBeNull();
	});
});
