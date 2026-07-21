import { Injectable, Inject } from '@nestjs/common';
import type { IProgramacaoReadRepository, DadosPainel } from '../../domain/read-models/programacao-read.model';
import type { DadosPainelDto } from '../dtos/dados-painel.dto';

export class BuscarDadosPainelQuery {
  constructor(
    public readonly cdUsina: string,
    public readonly dtProgramacao: string,
  ) {}
}

@Injectable()
export class BuscarDadosPainelHandler {
  constructor(
    @Inject('IProgramacaoReadRepository')
    private readonly repository: IProgramacaoReadRepository,
  ) {}

  async execute(query: BuscarDadosPainelQuery): Promise<DadosPainelDto | null> {
    const dados = await this.repository.buscarDadosPainel({
      cdUsina: query.cdUsina,
      dtProgramacao: query.dtProgramacao,
    });
    if (!dados) return null;

    return this.mapToDto(dados);
  }

  private mapToDto(dados: DadosPainel): DadosPainelDto {
    return {
      cdUsina: dados.cdUsina,
      dtProgramacao: dados.dtProgramacao,
      dados: dados.dados.map((d) => ({
        periodo: d.periodo,
        dtProgramacao: d.dtProgramacao,
        geracaoMW: d.geracaoMW,
        vazaoVertida: d.vazaoVertida,
        vazaoIncremental: d.vazaoIncremental,
        nivelReservatorio: d.nivelReservatorio,
        nivelMaximoReservatorio: d.nivelMaximoReservatorio,
        nivelMinimoReservatorio: d.nivelMinimoReservatorio,
        volumeTotal: d.volumeTotal,
        vazaoTurbinada: d.vazaoTurbinada,
        vazaoDefluente: d.vazaoDefluente,
        vazaoAfluente: d.vazaoAfluente,
        disponivel: d.disponivel,
        dadosVerificados: d.dadosVerificados,
      })),
      eixoVazaoGeracao: dados.eixoVazaoGeracao,
      eixoNivelRes: dados.eixoNivelRes,
      eixoDispGeracao: dados.eixoDispGeracao,
    };
  }
}
