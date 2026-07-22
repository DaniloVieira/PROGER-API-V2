import { Controller, Param, Post, Put, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicarProgramacaoCommand } from '../../application/commands/publicar-programacao.command';
import { EditarDadosProgramacaoCommand, EditarDadosProgramacaoRequestDto, EditarDadosProgramacaoResponseDto } from '../../application/commands/editar-dados-programacao.command';
import type { PublicarProgramacaoRequestDto, PublicarProgramacaoResponseDto } from '../../application/dtos/publicar-programacao.dto';

@ApiTags('Programação')
@Controller('programacoes')
export class ProgramacaoCommandController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put(':cdProgramacao/dados')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar dados de uma programação' })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso' })
  @ApiResponse({ status: 404, description: 'Programação não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito de edição (optimistic locking)' })
  async editarDados(
    @Param('cdProgramacao') cdProgramacao: string,
    @Body() dto: EditarDadosProgramacaoRequestDto,
  ): Promise<EditarDadosProgramacaoResponseDto> {
    const command = new EditarDadosProgramacaoCommand(
      parseInt(cdProgramacao, 10),
      dto.dados.map(d => ({ periodo: d.periodo, geracaoMW: d.geracaoMW, vazaoVertida: d.vazaoVertida, vazaoIncremental: d.vazaoIncremental })),
      dto.dtAlteracao,
    );
    await this.commandBus.execute(command);

    return {
      cdProgramacao: parseInt(cdProgramacao, 10),
      situacao: 'EM_EDICAO',
      mensagem: 'Dados atualizados com sucesso.',
    };
  }

  @Post(':cdProgramacao/publicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar uma programação' })
  @ApiResponse({ status: 200, description: 'Programação publicada com sucesso' })
  @ApiResponse({ status: 404, description: 'Programação não encontrada' })
  @ApiResponse({ status: 409, description: 'Programação não pode ser publicada (situação inválida)' })
  async publicar(
    @Param('cdProgramacao') cdProgramacao: string,
    @Body() dto: PublicarProgramacaoRequestDto,
  ): Promise<PublicarProgramacaoResponseDto> {
    const command = new PublicarProgramacaoCommand(parseInt(cdProgramacao, 10), dto.usuarioId);
    await this.commandBus.execute(command);

    return {
      cdProgramacao: parseInt(cdProgramacao, 10),
      situacao: 'PUBLICADA',
      mensagem: 'Programação publicada com sucesso.',
    };
  }
}
