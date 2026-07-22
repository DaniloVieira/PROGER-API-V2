import { ApiProperty } from "@nestjs/swagger";

class DadosProgramacaoItemDto {
	@ApiProperty({
		example: 0,
		description: "Índice do período (0-47 para meia-hora)",
	})
	periodo: number;

	@ApiProperty({
		example: 0,
		description: "Número do intervalo de tempo (mesmo valor que periodo, usado pelo frontend)",
	})
	nrIntervaloTempo: number;

	@ApiProperty({ example: 120.5 })
	geracaoMW: number;

	@ApiProperty({ example: 10.0 })
	vazaoVertida: number;

	@ApiProperty({ example: 50.0 })
	vazaoIncremental: number;

	@ApiProperty({ example: 650.0 })
	nivelReservatorio: number;

	@ApiProperty({ example: 1200.5 })
	volumeTotal: number;

	@ApiProperty({ example: 22.0 })
	vazaoTurbinada: number;

	@ApiProperty({ example: 32.0 })
	vazaoDefluente: number;

	@ApiProperty({ example: 82.0 })
	vazaoAfluente: number;

	@ApiProperty({ example: true })
	dadosVerificados: boolean;

	@ApiProperty({ example: 121.0, required: false, description: "Geração ONS (MW)" })
	geracaoMWOns?: number;

	@ApiProperty({ example: 33.0, required: false, description: "Vazão defluente ONS (m³/s)" })
	vazaoDefluenteOns?: number;

	@ApiProperty({ example: 83.0, required: false, description: "Vazão afluente ONS (m³/s)" })
	vazaoAfluenteOns?: number;

	@ApiProperty({ example: 23.0, required: false, description: "Vazão turbinada ONS (m³/s)" })
	vazaoTurbinadaOns?: number;

	@ApiProperty({ example: 1201.0, required: false, description: "Volume total ONS (hm³)" })
	volumeTotalOns?: number;

	@ApiProperty({ example: 651.0, required: false, description: "Nível reservatório ONS (m)" })
	nivelReservatorioOns?: number;

	@ApiProperty({ example: 51.0, required: false, description: "Vazão incremental previsão (m³/s)" })
	vazaoIncrementalPrev?: number;

	@ApiProperty({ example: false, required: false, description: "Flag de incremental manual" })
	incrementalManual?: boolean;

	@ApiProperty({ example: 5.0, required: false, description: "Vazão vão livre (m³/s)" })
	vazaoVaoLivre?: number;

	@ApiProperty({ example: 5.5, required: false, description: "Vazão vão livre calculada (m³/s)" })
	vazaoVaoLivreCalc?: number;

	@ApiProperty({ example: false, required: false, description: "Flag de vão livre manual" })
	vaoLivreManual?: boolean;

	@ApiProperty({ example: 200.0, required: false, description: "Disponibilidade de geração (MW)" })
	disponivel?: number;

	@ApiProperty({ example: false, required: false, description: "Flag de geração manual" })
	geracaoManual?: boolean;
}

export class ProgramacaoDadosDto {
	@ApiProperty({ example: 1 })
	cdProgramacao: number;

	@ApiProperty({ example: "UHJA" })
	cdUsina: string;

	@ApiProperty({ example: "2025-06-24" })
	dtProgramacao: string;

	@ApiProperty({ example: "EM_EDICAO" })
	situacao: string;

	@ApiProperty({ example: "2025-06-24T12:00:00.000Z", required: false, description: "Data da última alteração para optimistic locking" })
	dtAlteracao?: string;

	@ApiProperty({ type: [DadosProgramacaoItemDto] })
	dados: DadosProgramacaoItemDto[];
}
