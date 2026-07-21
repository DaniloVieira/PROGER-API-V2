import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  BuscarUsinaHistoricoQuery,
  BuscarUsinaHistoricoHandler,
} from '../../application/queries/buscar-usina-historico.query';
import { ListarUsinasHandler } from '../../application/queries/listar-usinas.query';
import {
  UsinaResumoDto,
  UsinaHistoricoResponseDto,
} from '../../application/dtos/usina-resumo.dto';

@ApiTags('Usina')
@Controller('usinas')
export class UsinaQueryController {
  constructor(
    private readonly buscarHistoricoHandler: BuscarUsinaHistoricoHandler,
    private readonly listarUsinasHandler: ListarUsinasHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as usinas' })
  @ApiResponse({ status: 200, type: [UsinaResumoDto] })
  async listar(): Promise<UsinaResumoDto[]> {
    return this.listarUsinasHandler.execute();
  }

  @Get(':cdUsina/historico')
  @ApiOperation({ summary: 'Buscar histórico de dados de uma usina' })
  @ApiQuery({
    name: 'dtInicio',
    required: true,
    description: 'Data início (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dtFim',
    required: true,
    description: 'Data fim (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, type: UsinaHistoricoResponseDto })
  async buscarHistorico(
    @Param('cdUsina') cdUsina: string,
    @Query('dtInicio') dtInicio: string,
    @Query('dtFim') dtFim: string,
  ): Promise<UsinaHistoricoResponseDto> {
    const query = new BuscarUsinaHistoricoQuery(cdUsina, dtInicio, dtFim);
    return this.buscarHistoricoHandler.execute(query);
  }
}