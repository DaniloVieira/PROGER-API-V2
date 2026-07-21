import { ApiProperty } from "@nestjs/swagger";

export class ProgramacaoResumoDto {
	@ApiProperty({ example: 1, description: "Código da programação" })
	cdProgramacao: number;

	@ApiProperty({ example: "UHJA", description: "Código da usina" })
	cdUsina: string;

	@ApiProperty({
		example: "2025-06-24",
		description: "Data da programação (YYYY-MM-DD)",
		format: "date",
	})
	dtProgramacao: string;

	@ApiProperty({
		example: "EM_EDICAO",
		enum: ["EM_EDICAO", "PUBLICADA", "CANCELADA"],
	})
	situacao: string;
}

export class PaginatedResponseDto<T> {
	@ApiProperty({ description: "Itens da página" })
	items: T[];

	@ApiProperty({ example: 100, description: "Total de registros" })
	total: number;

	@ApiProperty({ example: 1, description: "Página atual" })
	page: number;

	@ApiProperty({ example: 20, description: "Tamanho da página" })
	size: number;
}
