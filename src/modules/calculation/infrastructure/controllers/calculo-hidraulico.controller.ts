import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CalcularHidraulicoBatchUseCase } from "../../application/use-cases/calcular-hidraulico-batch.use-case";
import {
	CalcularHidraulicoRequestDto,
	CalcularHidraulicoResponseDto,
} from "../../application/dtos/calculo-hidraulico.dto";

@ApiTags("Cálculo")
@Controller("calculo")
export class CalculoHidraulicoController {
	constructor(
		private readonly calcularHidraulicoBatchUseCase: CalcularHidraulicoBatchUseCase,
	) {}

	@Post("hidraulico")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Recalcular balanço hidráulico para um batch de períodos",
	})
	@ApiResponse({
		status: 200,
		description: "Cálculo realizado com sucesso",
		type: CalcularHidraulicoResponseDto,
	})
	@ApiResponse({ status: 400, description: "Payload inválido" })
	@ApiResponse({
		status: 404,
		description: "Produtibilidade não encontrada para a usina",
	})
	async calcularHidraulico(
		@Body() dto: CalcularHidraulicoRequestDto,
	): Promise<CalcularHidraulicoResponseDto> {
		const resultado = await this.calcularHidraulicoBatchUseCase.execute({
			cdUsina: dto.cdUsina,
			coefConvMin: dto.coefConvMin,
			volumeInicialHm3: dto.volumeInicialHm3,
			curvaCotaVolume: dto.curvaCotaVolume,
			periodos: dto.periodos.map((p) => ({
				periodo: p.periodo,
				geracaoMW: p.geracaoMW,
				vazaoVertida: p.vazaoVertida,
				vazaoIncremental: p.vazaoIncremental,
				vazoesMontantes: p.vazoesMontantes ?? [],
			})),
		});

		return {
			cdUsina: resultado.cdUsina,
			periodos: resultado.periodos,
			alertas: resultado.alertas,
		};
	}
}
