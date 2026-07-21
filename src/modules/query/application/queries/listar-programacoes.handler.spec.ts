import {
	ListarProgramacoesQuery,
	ListarProgramacoesHandler,
} from "./listar-programacoes.query";
import {
	type IProgramacaoReadRepository,
	ProgramacaoResumo,
} from "../../domain/read-models/programacao-read.model";

describe("ListarProgramacoesHandler", () => {
	let handler: ListarProgramacoesHandler;
	let repository: jest.Mocked<IProgramacaoReadRepository>;

	beforeEach(() => {
		repository = {
			listar: jest.fn(),
			buscarDados: jest.fn(),
			buscarDadosPainel: jest.fn(),
		};
		handler = new ListarProgramacoesHandler(repository);
	});

	it("deve listar programações com filtros aplicados", async () => {
		const mockData = {
			items: [
				{
					cdProgramacao: 1,
					cdUsina: "UHJA",
					dtProgramacao: "2025-06-24",
					situacao: "EM_EDICAO",
				},
			],
			total: 1,
			page: 1,
			size: 20,
		};
		repository.listar.mockResolvedValue(mockData);

		const query = new ListarProgramacoesQuery("UHJA", "2025-06-24", 1, 20);
		const result = await handler.execute(query);

		expect(repository.listar).toHaveBeenCalledWith({
			cdUsina: "UHJA",
			dtProgramacao: "2025-06-24",
			page: 1,
			size: 20,
		});
		expect(result.items).toHaveLength(1);
		expect(result.items[0].cdUsina).toBe("UHJA");
		expect(result.total).toBe(1);
	});

	it("deve listar todas as programações quando não há filtros", async () => {
		const mockData = {
			items: [
				{
					cdProgramacao: 1,
					cdUsina: "UHJA",
					dtProgramacao: "2025-06-24",
					situacao: "EM_EDICAO",
				},
				{
					cdProgramacao: 2,
					cdUsina: "USIM",
					dtProgramacao: "2025-06-25",
					situacao: "PUBLICADA",
				},
			],
			total: 2,
			page: 1,
			size: 20,
		};
		repository.listar.mockResolvedValue(mockData);

		const query = new ListarProgramacoesQuery(undefined, undefined, 1, 20);
		const result = await handler.execute(query);

		expect(repository.listar).toHaveBeenCalledWith({
			cdUsina: undefined,
			dtProgramacao: undefined,
			page: 1,
			size: 20,
		});
		expect(result.items).toHaveLength(2);
	});
});
