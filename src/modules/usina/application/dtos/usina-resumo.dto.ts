import { ApiProperty } from "@nestjs/swagger";

export class UsinaResumoDto {
	@ApiProperty({ example: "UHJA" })
	cdUsina: string;

	@ApiProperty({ example: "UHE Jaguara" })
	nomeUsina: string;

	@ApiProperty({ example: "HIDRO", enum: ["HIDRO", "TERMO"] })
	tipo: string;

	@ApiProperty({ example: "ATIVA", enum: ["ATIVA", "INATIVA"] })
	situacao: string;

	@ApiProperty({ example: 1, description: "1 = usina Engie, 0 = não" })
	flUsinaEngie: number;

	@ApiProperty({ example: 1, description: "1 = ativa, 0 = inativa" })
	flUsinaAtv: number;

	@ApiProperty({ example: 1, description: "Ordem de exibição no painel" })
	nrOrdUsina: number;
}

class UsinaHistoricoItemDto {
	@ApiProperty({ example: "2025-06-24" })
	dtProgramacao: string;

	@ApiProperty({ example: 0 })
	periodo: number;

	@ApiProperty({ example: 100.0 })
	geracaoMW: number;

	@ApiProperty({ example: 5.0 })
	vazaoVertida: number;

	@ApiProperty({ example: 40.0 })
	vazaoIncremental: number;

	@ApiProperty({ example: 650.0 })
	nivelReservatorio: number;

	@ApiProperty({ example: 1200.5 })
	volumeTotal: number;

	@ApiProperty({ example: 20.0 })
	vazaoTurbinada: number;

	@ApiProperty({ example: 25.0 })
	vazaoDefluente: number;

	@ApiProperty({ example: 65.0 })
	vazaoAfluente: number;

	@ApiProperty({ example: true })
	dadosVerificados: boolean;
}

export class UsinaHistoricoResponseDto {
	@ApiProperty({ example: "UHJA" })
	cdUsina: string;

	@ApiProperty({ type: [UsinaHistoricoItemDto] })
	historico: UsinaHistoricoItemDto[];
}
