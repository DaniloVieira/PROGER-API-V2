import { Test, type TestingModule } from "@nestjs/testing";
import { ValidarRestricoesUseCase } from "./validar-restricoes.use-case";
import type { IRestricaoRepository } from "../../domain/ports/restricao-repository.port";

describe("ValidarRestricoesUseCase", () => {
	let useCase: ValidarRestricoesUseCase;
	let restricaoRepo: jest.Mocked<IRestricaoRepository>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidarRestricoesUseCase,
				{
					provide: "IRestricaoRepository",
					useValue: {
						buscarRestricoesAtivas: jest.fn(),
					},
				},
			],
		}).compile();

		useCase = module.get<ValidarRestricoesUseCase>(ValidarRestricoesUseCase);
		restricaoRepo = module.get<IRestricaoRepository>(
			"IRestricaoRepository",
		) as jest.Mocked<IRestricaoRepository>;
	});

	it("deve retornar violações quando restrições são infringidas", async () => {
		restricaoRepo.buscarRestricoesAtivas.mockResolvedValue([
			{
				cdTpRestricao: 19,
				dsRestricao: "Nível Mínimo (m)",
				dsVarRef: "nivelReservatorio",
				vlRestricao: 557,
			},
		]);

		const resultado = await useCase.execute({
			cdUsina: "UHJA",
			periodo: 0,
			dados: {
				vazaoTurbinada: 100,
				vazaoDefluente: 120,
				vazaoVertida: 20,
				vazaoAfluente: 150,
				nivelReservatorio: 556,
				geracaoMW: 80,
			},
		});

		expect(restricaoRepo.buscarRestricoesAtivas).toHaveBeenCalledWith(
			"UHJA",
			0,
		);
		expect(resultado).toHaveLength(1);
		expect(resultado[0].mensagem).toContain("abaixo do mínimo");
	});

	it("deve retornar vazio quando não há restrições ativas", async () => {
		restricaoRepo.buscarRestricoesAtivas.mockResolvedValue([]);

		const resultado = await useCase.execute({
			cdUsina: "UHJA",
			periodo: 0,
			dados: {
				vazaoTurbinada: 100,
				vazaoDefluente: 120,
				vazaoVertida: 20,
				vazaoAfluente: 150,
				nivelReservatorio: 557,
				geracaoMW: 80,
			},
		});

		expect(resultado).toEqual([]);
	});
});
