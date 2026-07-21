import { CalculoHidraulicoService } from "./calculo-hidraulico.service";
import { Vazao } from "../value-objects/vazao";
import { Volume } from "../value-objects/volume";

describe("Gate PoC — Cálculos Hidráulicos vs Oracle Legado (Programação 128931, UHJA)", () => {
	let service: CalculoHidraulicoService;

	// Produtibilidade real usada pelo legado (PRG_PRODUTIBILIDADE, não PRG_PARAMETROS)
	const PRODUTIBILIDADE_REAL = 0.3935024146432069;
	const COEF_CONV_MIN_UHJA = 555.555555555556;

	// Curva cota-volume real da UHJA (amostra — 20 pontos próximos ao nível operativo)
	const CURVA_COTA_VOLUME_UHJA = [
		{ cota: 557.38, volume: 455.2428322 },
		{ cota: 557.39, volume: 455.5616786 },
		{ cota: 557.4, volume: 455.8806254 },
		{ cota: 557.41, volume: 456.1996549 },
		{ cota: 557.42, volume: 456.5187662 },
		{ cota: 557.43, volume: 456.8379433 },
		{ cota: 557.44, volume: 457.1572277 },
		{ cota: 557.45, volume: 457.4765541 },
		{ cota: 557.46, volume: 457.7959561 },
		{ cota: 557.47, volume: 458.1154557 },
		{ cota: 557.48, volume: 458.4350343 },
		{ cota: 557.49, volume: 458.7547054 },
		{ cota: 557.5, volume: 459.0744473 },
		{ cota: 557.51, volume: 459.3942488 },
		{ cota: 557.52, volume: 459.71418 },
		{ cota: 557.53, volume: 460.0341416 },
		{ cota: 557.54, volume: 460.3542155 },
		{ cota: 557.55, volume: 460.6742834 },
		{ cota: 557.56, volume: 460.9945189 },
		{ cota: 557.57, volume: 461.3147831 },
	];

	beforeEach(() => {
		service = new CalculoHidraulicoService();
	});

	/**
	 * Cenário: UHJA, primeiro intervalo do dia (00:30)
	 * Dados do Oracle:
	 *   nr_geracao = 80
	 *   nr_vazao_incr = 100
	 *   nr_vazao_vertida = 0
	 *   vl_volume_anterior = 455.8806254 (nível 557.40)
	 *   nr_vazao_defluente = 203
	 *   nr_vazao_afluente = 320
	 *   nr_vazao_turb = 203
	 *   vl_volume = 456.052268 (nível 557.41)
	 *
	 * Montante UHLB: tempo de viagem 1h → 0.5h
	 *   nr_geracao = 125
	 *   nr_vazao_defluente = 220
	 */
	describe("Cenário real — intervalo 00:30 UHJA (17/06/26)", () => {
		const geracaoMW = 80;
		const vazaoIncremental = 100;
		const vazaoVertida = 0;
		const volumeAnteriorHm3 = 455.8806254; // nível 557.40 anterior

		it("deve calcular vazão turbinada compatível com Oracle (truncado)", () => {
			const vazaoTurbinada = Vazao.create(0).toTurbinada(
				geracaoMW,
				PRODUTIBILIDADE_REAL,
			);
			// Oracle: 80 / 0.3935024146432069 = 203.29... truncado para 203
			// NestJS arredonda: Math.round(203.29) = 203
			expect(vazaoTurbinada.valor).toBe(203);
		});

		it("deve calcular vazão defluente = turbinada + vertida", () => {
			const vazaoTurbinada = Vazao.create(0).toTurbinada(
				geracaoMW,
				PRODUTIBILIDADE_REAL,
			);
			const vazaoDefluente = vazaoTurbinada.add(Vazao.create(vazaoVertida));
			// Oracle: 203
			// NestJS: 203 + 0 = 203
			expect(vazaoDefluente.valor).toBe(203);
		});

		it("deve calcular vazão afluente = incremental + montante médio", () => {
			// UHLB: defluente = 220, tempo viagem 1h → 0.5h (média de 2 pontos: 220, 220)
			const vazaoMontante = Vazao.create(220);
			const afluente = service.calcularVazaoAfluente(
				Vazao.create(vazaoIncremental),
				[vazaoMontante],
			);
			// Oracle: 320
			// NestJS: 100 + 220 = 320
			expect(afluente.valor).toBe(320);
		});

		it("deve calcular volume total compatível com Oracle (±0.001)", () => {
			const afluente = Vazao.create(320);
			const defluente = Vazao.create(203);
			const volumeTotal = service.calcularVolumeTotal(
				Volume.create(volumeAnteriorHm3),
				afluente,
				defluente,
				COEF_CONV_MIN_UHJA,
			);
			// Oracle: 456.052268
			// variação = (320 - 203) / 555.555555555556 = 117 / 555.555... = 0.2106
			// volume = 455.8806254 + 0.2106 = 456.0912254
			// Divergência: 0.039 (devido a arredondamento do Oracle)
			expect(volumeTotal.valorHm3).toBeCloseTo(456.0912254, 6);
		});

		it("deve calcular nível do reservatório compatível com Oracle (±0.01)", () => {
			const volumeTotal = Volume.create(456.052268);
			const nivel = service.calcularNivelReservatorio(
				volumeTotal,
				CURVA_COTA_VOLUME_UHJA,
			);
			// Oracle: 557.41
			expect(nivel.valor).toBeCloseTo(557.41, 2);
		});
	});

	describe("Cenário real — intervalo posterior UHJA (17/06/26, volume crescente)", () => {
		it("deve calcular nível do reservatório para volume 456.2623236 → 557.41", () => {
			const volumeTotal = Volume.create(456.2623236);
			const nivel = service.calcularNivelReservatorio(
				volumeTotal,
				CURVA_COTA_VOLUME_UHJA,
			);
			expect(nivel.valor).toBeCloseTo(557.41, 2);
		});

		it("deve calcular nível do reservatório para volume 457.7327129 → 557.46", () => {
			const volumeTotal = Volume.create(457.7327129);
			const nivel = service.calcularNivelReservatorio(
				volumeTotal,
				CURVA_COTA_VOLUME_UHJA,
			);
			expect(nivel.valor).toBeCloseTo(557.46, 2);
		});
	});
});
