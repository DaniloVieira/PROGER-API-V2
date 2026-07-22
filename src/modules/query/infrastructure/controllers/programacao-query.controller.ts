import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ListarProgramacoesQuery, ListarProgramacoesHandler } from '../../application/queries/listar-programacoes.query';
import { BuscarProgramacaoDadosQuery, BuscarProgramacaoDadosHandler } from '../../application/queries/buscar-programacao-dados.query';
import { BuscarDadosPainelQuery, BuscarDadosPainelHandler } from '../../application/queries/buscar-dados-painel.query';
import { type ProgramacaoResumoDto, PaginatedResponseDto } from '../../application/dtos/programacao-resumo.dto';
import { ProgramacaoDadosDto } from '../../application/dtos/programacao-dados.dto';
import { DadosPainelDto } from '../../application/dtos/dados-painel.dto';

@ApiTags('Programação')
@Controller('programacoes')
export class ProgramacaoQueryController {
  constructor(
    private readonly listarHandler: ListarProgramacoesHandler,
    private readonly buscarDadosHandler: BuscarProgramacaoDadosHandler,
    private readonly buscarDadosPainelHandler: BuscarDadosPainelHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar programações' })
  @ApiQuery({ name: 'cdUsina', required: false, description: 'Código da usina (ex: UHJA)' })
  @ApiQuery({ name: 'dtProgramacao', required: false, description: 'Data da programação (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: 'Tamanho da página', example: 20 })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async listar(
    @Query('cdUsina') cdUsina?: string,
    @Query('dtProgramacao') dtProgramacao?: string,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ): Promise<PaginatedResponseDto<ProgramacaoResumoDto>> {
    const query = new ListarProgramacoesQuery(
      cdUsina,
      dtProgramacao,
      parseInt(page, 10),
      parseInt(size, 10),
    );
    return this.listarHandler.execute(query);
  }

  @Get(':cdProgramacao/dados')
  @ApiOperation({ summary: 'Buscar dados de uma programação' })
  @ApiResponse({ status: 200, type: ProgramacaoDadosDto })
  @ApiResponse({ status: 404, description: 'Programação não encontrada' })
  async buscarDados(@Param('cdProgramacao') cdProgramacao: string): Promise<ProgramacaoDadosDto | null> {
    const query = new BuscarProgramacaoDadosQuery(parseInt(cdProgramacao, 10));
    return this.buscarDadosHandler.execute(query);
  }

  @Get('dados-painel')
  @ApiOperation({ summary: 'Buscar dados agregados do painel (programação + historiador)' })
  @ApiQuery({ name: 'cdUsina', required: true, description: 'Código da usina (ex: UHJA)' })
  @ApiQuery({ name: 'dtProgramacao', required: true, description: 'Data da programação (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, type: DadosPainelDto })
  @ApiResponse({ status: 404, description: 'Dados não encontrados' })
  async buscarDadosPainel(
    @Query('cdUsina') cdUsina: string,
    @Query('dtProgramacao') dtProgramacao: string,
  ): Promise<DadosPainelDto | null> {
    const query = new BuscarDadosPainelQuery(cdUsina, dtProgramacao);
    return this.buscarDadosPainelHandler.execute(query);
  }
}
