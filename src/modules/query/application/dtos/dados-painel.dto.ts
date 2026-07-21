import { ApiProperty } from "@nestjs/swagger";

class DadosPainelItemDto {
	@ApiProperty({
		example: "2025-06-24T00:00:00",
		format: "date-time",
		description: "Data/hora do registro",
	})
	dtProgramacao: string;

	@ApiProperty({
		example: 0,
		description: "Índice do período de 30 min (0-95)",
	})
	periodo: number;

	@ApiProperty({ example: 120.5 })
	geracaoMW: number;

	@ApiProperty({ example: 120.0, required: false })
	geracaoMWOns?: number;

	@ApiProperty({ example: 10.0 })
	vazaoVertida: number;

	@ApiProperty({ example: 50.0 })
	vazaoIncremental: number;

	@ApiProperty({ example: 650.0 })
	nivelReservatorio: number;

	@ApiProperty({ example: 650.0 })
	nivelMaximoReservatorio?: number;

	@ApiProperty({ example: 650.0 })
	nivelMinimoReservatorio?: number;

	@ApiProperty({ example: 1200.5 })
	volumeTotal: number;

	@ApiProperty({ example: 22.0 })
	vazaoTurbinada: number;

	@ApiProperty({ example: 32.0 })
	vazaoDefluente: number;

	@ApiProperty({ example: 82.0 })
	vazaoAfluente: number;

	@ApiProperty({ example: 100 })
	disponivel: number;

	@ApiProperty({
		example: true,
		description: "true se valor veio do historiador",
	})
	dadosVerificados: boolean;
}

class AlertaRestricaoItemDto {
	@ApiProperty({ example: 22 })
	cdTpRestricao: number;

	@ApiProperty({ example: "Geração Mínima (MW)" })
	descricao: string;
}

class AlertasRestricoesPainelDto {
	@ApiProperty({ type: [AlertaRestricaoItemDto] })
	geracao: AlertaRestricaoItemDto[];

	@ApiProperty({ type: [AlertaRestricaoItemDto] })
	hidrico: AlertaRestricaoItemDto[];

	@ApiProperty({ type: [AlertaRestricaoItemDto] })
	nivel: AlertaRestricaoItemDto[];
}

export class DadosPainelDto {
	@ApiProperty({ example: "UHJA" })
	cdUsina: string;

	@ApiProperty({ example: "2025-06-24", format: "date" })
	dtProgramacao: string;

	@ApiProperty({ type: [DadosPainelItemDto] })
	dados: DadosPainelItemDto[];

	@ApiProperty({ type: [Number], example: [0, 25, 50, 75, 100] })
	eixoVazaoGeracao: number[];

	@ApiProperty({ type: [Number], example: [0, 25, 50, 75, 100] })
	eixoNivelRes: number[];

	@ApiProperty({ type: [Number], example: [0, 25, 50, 75, 100] })
	eixoDispGeracao: number[];

	@ApiProperty({ type: AlertasRestricoesPainelDto, required: false })
	alertasRestricoesPainel?: AlertasRestricoesPainelDto;

	@ApiProperty({ example: true, required: false, description: "true se geracao ONS diverge da geracao programada" })
	onsPainel?: boolean;
}
