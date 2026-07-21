import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicarProgramacaoRequestDto {
  @ApiProperty({ description: 'ID do usuário que está publicando a programação', example: 'user-123' })
  @IsString()
  usuarioId!: string;
}

export class PublicarProgramacaoResponseDto {
  @ApiProperty({ description: 'ID da programação', example: 1 })
  cdProgramacao!: number;

  @ApiProperty({ description: 'Situação atual da programação', example: 'PUBLICADA' })
  situacao!: string;

  @ApiProperty({ description: 'Mensagem de sucesso' })
  mensagem!: string;
}
