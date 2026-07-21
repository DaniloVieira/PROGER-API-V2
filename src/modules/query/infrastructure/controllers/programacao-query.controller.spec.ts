import { ProgramacaoQueryController } from "./programacao-query.controller";
import { type ListarProgramacoesHandler } from "../../application/queries/listar-programacoes.query";
import { type BuscarProgramacaoDadosHandler } from "../../application/queries/buscar-programacao-dados.query";
import { type BuscarDadosPainelHandler } from "../../application/queries/buscar-dados-painel.query";

describe("ProgramacaoQueryController", () => {
	let controller: ProgramacaoQueryController;
	let listarHandler: jest.Mocked<ListarProgramacoesHandler>;
	let buscarDadosHandler: jest.Mocked<BuscarProgramacaoDadosHandler>;
	let buscarDadosPainelHandler: jest.Mocked<BuscarDadosPainelHandler>;

	beforeEach(() => {
		listarHandler = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<ListarProgramacoesHandler>;

		buscarDadosHandler = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<BuscarProgramacaoDadosHandler>;

		buscarDadosPainelHandler = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<BuscarDadosPainelHandler>;

		controller = new ProgramacaoQueryController(
			listarHandler,
			buscarDadosHandler,
			buscarDadosPainelHandler,
		);
	});

	it("deve ser definido", () => {
		expect(controller).toBeDefined();
	});

	it("deve listar programações", async () => {
		const result = {
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
		listarHandler.execute.mockResolvedValue(result as any);

		const response = await controller.listar("UHJA", "2025-06-24", "1", "20");
		expect(listarHandler.execute).toHaveBeenCalledWith(
			expect.objectContaining({
				cdUsina: "UHJA",
				dtProgramacao: "2025-06-24",
				page: 1,
				size: 20,
			}),
		);
		expect(response.items).toHaveLength(1);
		expect(response.items[0].cdUsina).toBe("UHJA");
	});

	it("deve buscar dados da programação", async () => {
		const result = {
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
		buscarDadosHandler.execute.mockResolvedValue(result as any);

		const response = await controller.buscarDados("1");
		expect(buscarDadosHandler.execute).toHaveBeenCalledWith(
			expect.objectContaining({ cdProgramacao: 1 }),
		);
		expect(response).not.toBeNull();
		expect(response?.cdProgramacao).toBe(1);
	});
});
