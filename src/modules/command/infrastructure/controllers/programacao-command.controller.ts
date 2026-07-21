import { Controller, Param, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicarProgramacaoCommand } from '../../application/commands/publicar-programacao.command';
import type { PublicarProgramacaoRequestDto, PublicarProgramacaoResponseDto } from '../../application/dtos/publicar-programacao.dto';

@ApiTags('Programação')
@Controller('programacoes')
export class ProgramacaoCommandController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':id/publicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar uma programação' })
  @ApiResponse({ status: 200, description: 'Programação publicada com sucesso' })
  @ApiResponse({ status: 404, description: 'Programação não encontrada' })
  @ApiResponse({ status: 409, description: 'Programação não pode ser publicada (situação inválida)' })
  async publicar(
    @Param('id') id: string,
    @Body() dto: PublicarProgramacaoRequestDto,
  ): Promise<PublicarProgramacaoResponseDto> {
    const command = new PublicarProgramacaoCommand(parseInt(id, 10), dto.usuarioId);
    await this.commandBus.execute(command);

    return {
      cdProgramacao: parseInt(id, 10),
      situacao: 'PUBLICADA',
      mensagem: 'Programação publicada com sucesso.',
    };
  }
}
