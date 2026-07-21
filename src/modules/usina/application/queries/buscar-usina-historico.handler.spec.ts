import {
	BuscarUsinaHistoricoQuery,
	BuscarUsinaHistoricoHandler,
} from "./buscar-usina-historico.query";
import type { IUsinaReadRepository } from "../../domain/read-models/usina-read-repository.port";
import type { UsinaHistoricoItem } from "../../domain/read-models/usina-read.model";

describe("BuscarUsinaHistoricoHandler", () => {
	let handler: BuscarUsinaHistoricoHandler;
	let repository: jest.Mocked<IUsinaReadRepository>;

	beforeEach(() => {
		repository = {
			buscarHistorico: jest.fn(),
			listar: jest.fn(),
		};
		handler = new BuscarUsinaHistoricoHandler(repository);
	});

	it("deve retornar histórico da usina filtrado por período", async () => {
		const mockHistorico: UsinaHistoricoItem[] = [
			{
				dtProgramacao: "2025-06-24",
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
			{
				dtProgramacao: "2025-06-25",
				periodo: 0,
				geracaoMW: 95,
				vazaoVertida: 4.5,
				vazaoIncremental: 38,
				nivelReservatorio: 649,
				volumeTotal: 1198,
				vazaoTurbinada: 19,
				vazaoDefluente: 23.5,
				vazaoAfluente: 61.5,
				dadosVerificados: false,
			},
		];
		repository.buscarHistorico.mockResolvedValue(mockHistorico);

		const query = new BuscarUsinaHistoricoQuery(
			"UHJA",
			"2025-06-24",
			"2025-06-25",
		);
		const result = await handler.execute(query);

		expect(repository.buscarHistorico).toHaveBeenCalledWith(
			"UHJA",
			"2025-06-24",
			"2025-06-25",
		);
		expect(result.cdUsina).toBe("UHJA");
		expect(result.historico).toHaveLength(2);
		expect(result.historico[0].geracaoMW).toBe(100);
		expect(result.historico[1].dadosVerificados).toBe(false);
	});

	it("deve retornar histórico vazio quando não há dados no período", async () => {
		repository.buscarHistorico.mockResolvedValue([]);

		const query = new BuscarUsinaHistoricoQuery(
			"USIM",
			"2025-01-01",
			"2025-01-31",
		);
		const result = await handler.execute(query);

		expect(repository.buscarHistorico).toHaveBeenCalledWith(
			"USIM",
			"2025-01-01",
			"2025-01-31",
		);
		expect(result.historico).toHaveLength(0);
	});
});
