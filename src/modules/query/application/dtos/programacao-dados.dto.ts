import { ApiProperty } from "@nestjs/swagger";

class DadosProgramacaoItemDto {
	@ApiProperty({
		example: 0,
		description: "Índice do período (0-47 para meia-hora)",
	})
	periodo: number;

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

	@ApiProperty({ type: [DadosProgramacaoItemDto] })
	dados: DadosProgramacaoItemDto[];
}
