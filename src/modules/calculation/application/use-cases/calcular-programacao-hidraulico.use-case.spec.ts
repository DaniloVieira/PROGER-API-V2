import { Test, type TestingModule } from "@nestjs/testing";
import { CalcularProgramacaoHidraulicoUseCase } from "./calcular-programacao-hidraulico.use-case";
import type { ICalculoHidraulicoService } from "../../domain/services/calculo-hidraulico.service";
import type { IProdutibilidadeRepository } from "../../domain/ports/produtibilidade-repository.port";
import { Vazao } from "../../domain/value-objects/vazao";
import { Volume } from "../../domain/value-objects/volume";
import { NivelReservatorio } from "../../domain/value-objects/nivel-reservatorio";

describe("CalcularProgramacaoHidraulicoUseCase", () => {
	let useCase: CalcularProgramacaoHidraulicoUseCase;
	let calculoService: jest.Mocked<ICalculoHidraulicoService>;
	let produtibilidadeRepo: jest.Mocked<IProdutibilidadeRepository>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CalcularProgramacaoHidraulicoUseCase,
				{
					provide: "ICalculoHidraulicoService",
					useValue: {
						calcularVazaoDefluente: jest.fn(),
						calcularVazaoAfluente: jest.fn(),
						calcularVolumeTotal: jest.fn(),
						calcularNivelReservatorio: jest.fn(),
					},
				},
				{
					provide: "IProdutibilidadeRepository",
					useValue: {
						buscarPorUsina: jest.fn(),
					},
				},
			],
		}).compile();

		useCase = module.get<CalcularProgramacaoHidraulicoUseCase>(
			CalcularProgramacaoHidraulicoUseCase,
		);
		calculoService = module.get<ICalculoHidraulicoService>(
			"ICalculoHidraulicoService",
		) as jest.Mocked<ICalculoHidraulicoService>;
		produtibilidadeRepo = module.get<IProdutibilidadeRepository>(
			"IProdutibilidadeRepository",
		) as jest.Mocked<IProdutibilidadeRepository>;
	});

	it("deve calcular todos os valores hidráulicos com produtibilidade do Oracle", async () => {
		produtibilidadeRepo.buscarPorUsina.mockResolvedValue(0.3935);
		calculoService.calcularVazaoDefluente.mockReturnValue(Vazao.create(203));
		calculoService.calcularVazaoAfluente.mockReturnValue(Vazao.create(320));
		calculoService.calcularVolumeTotal.mockReturnValue(Volume.create(1100));
		calculoService.calcularNivelReservatorio.mockReturnValue(
			NivelReservatorio.create(557.41),
		);

		const result = await useCase.execute({
			cdUsina: "UHJA",
			geracaoMW: 80,
			vazaoVertida: 0,
			vazaoIncremental: 40,
			vazoesMontantes: [280],
			volumeAnteriorHm3: 1000,
			coefConvMin: 2.0,
			curvaCotaVolume: [{ cota: 550, volume: 1000 }],
		});

		expect(produtibilidadeRepo.buscarPorUsina).toHaveBeenCalledWith("UHJA");
		expect(calculoService.calcularVazaoDefluente).toHaveBeenCalledWith(
			80,
			Vazao.create(0),
			0.3935,
		);
		expect(result.vazaoDefluente).toBe(203);
		expect(result.vazaoAfluente).toBe(320);
		expect(result.volumeTotalHm3).toBe(1100);
		expect(result.nivelReservatorio).toBe(557.41);
	});

	it("deve lançar erro quando produtibilidade não for encontrada", async () => {
		produtibilidadeRepo.buscarPorUsina.mockResolvedValue(null);

		await expect(
			useCase.execute({
				cdUsina: "USIM",
				geracaoMW: 80,
				vazaoVertida: 0,
				vazaoIncremental: 40,
				vazoesMontantes: [],
				volumeAnteriorHm3: 1000,
				coefConvMin: 2.0,
				curvaCotaVolume: [{ cota: 550, volume: 1000 }],
			}),
		).rejects.toThrow("Produtibilidade não encontrada para usina USIM");
	});
});
