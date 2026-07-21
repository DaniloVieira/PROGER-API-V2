import { Injectable, Inject } from '@nestjs/common';
import type { IUsinaReadRepository } from '../../domain/read-models/usina-read-repository.port';
import type { UsinaHistoricoResponseDto } from '../dtos/usina-resumo.dto';

export class BuscarUsinaHistoricoQuery {
  constructor(
    public readonly cdUsina: string,
    public readonly dtInicio: string,
    public readonly dtFim: string,
  ) {}
}

@Injectable()
export class BuscarUsinaHistoricoHandler {
  constructor(
    @Inject('IUsinaReadRepository')
    private readonly repository: IUsinaReadRepository,
  ) {}

  async execute(query: BuscarUsinaHistoricoQuery): Promise<UsinaHistoricoResponseDto> {
    const historico = await this.repository.buscarHistorico(query.cdUsina, query.dtInicio, query.dtFim);

    return {
      cdUsina: query.cdUsina,
      historico: historico.map((item) => ({
        dtProgramacao: item.dtProgramacao,
        periodo: item.periodo,
        geracaoMW: item.geracaoMW,
        vazaoVertida: item.vazaoVertida,
        vazaoIncremental: item.vazaoIncremental,
        nivelReservatorio: item.nivelReservatorio,
        volumeTotal: item.volumeTotal,
        vazaoTurbinada: item.vazaoTurbinada,
        vazaoDefluente: item.vazaoDefluente,
        vazaoAfluente: item.vazaoAfluente,
        dadosVerificados: item.dadosVerificados,
      })),
    };
  }
}
