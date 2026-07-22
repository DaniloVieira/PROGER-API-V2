import { Injectable, Inject } from '@nestjs/common';
import type { IProgramacaoReadRepository, ProgramacaoDados } from '../../domain/read-models/programacao-read.model';
import type { ProgramacaoDadosDto } from '../dtos/programacao-dados.dto';

export class BuscarProgramacaoDadosQuery {
  constructor(public readonly cdProgramacao: number) {}
}

@Injectable()
export class BuscarProgramacaoDadosHandler {
  constructor(
    @Inject('IProgramacaoReadRepository')
    private readonly repository: IProgramacaoReadRepository,
  ) {}

  async execute(query: BuscarProgramacaoDadosQuery): Promise<ProgramacaoDadosDto | null> {
    const dados = await this.repository.buscarDados(query.cdProgramacao);
    if (!dados) return null;

    return this.mapToDto(dados);
  }

  private mapToDto(dados: ProgramacaoDados): ProgramacaoDadosDto {
    return {
      cdProgramacao: dados.cdProgramacao,
      cdUsina: dados.cdUsina,
      dtProgramacao: dados.dtProgramacao,
      situacao: dados.situacao,
      dtAlteracao: dados.dtAlteracao,
      dados: dados.dados.map((d) => ({
        periodo: d.periodo,
        nrIntervaloTempo: d.nrIntervaloTempo,
        geracaoMW: d.geracaoMW,
        vazaoVertida: d.vazaoVertida,
        vazaoIncremental: d.vazaoIncremental,
        nivelReservatorio: d.nivelReservatorio,
        volumeTotal: d.volumeTotal,
        vazaoTurbinada: d.vazaoTurbinada,
        vazaoDefluente: d.vazaoDefluente,
        vazaoAfluente: d.vazaoAfluente,
        dadosVerificados: d.dadosVerificados,
        geracaoMWOns: d.geracaoMWOns,
        vazaoDefluenteOns: d.vazaoDefluenteOns,
        vazaoAfluenteOns: d.vazaoAfluenteOns,
        vazaoTurbinadaOns: d.vazaoTurbinadaOns,
        volumeTotalOns: d.volumeTotalOns,
        nivelReservatorioOns: d.nivelReservatorioOns,
        vazaoIncrementalPrev: d.vazaoIncrementalPrev,
        incrementalManual: d.incrementalManual,
        vazaoVaoLivre: d.vazaoVaoLivre,
        vazaoVaoLivreCalc: d.vazaoVaoLivreCalc,
        vaoLivreManual: d.vaoLivreManual,
        disponivel: d.disponivel,
        geracaoManual: d.geracaoManual,
      })),
    };
  }
}
