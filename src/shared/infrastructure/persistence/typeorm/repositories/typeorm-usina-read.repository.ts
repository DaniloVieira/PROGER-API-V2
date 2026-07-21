import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository, Between } from 'typeorm';
import { PrgUsinaEntity } from '../entities/prg-usina.entity';
import { PrgDadosProgramacaoEntity } from '../entities/prg-dados-programacao.entity';
import type {
  IUsinaReadRepository,
} from '@modules/usina/domain/read-models/usina-read-repository.port';
import type {
  UsinaResumo,
  UsinaHistoricoItem,
} from '@modules/usina/domain/read-models/usina-read.model';
import { toDateString, startOfDayWithBuffer, endOfDayWithBuffer } from '../date-utils';

@Injectable()
export class TypeOrmUsinaReadRepository implements IUsinaReadRepository {
  constructor(
    @InjectRepository(PrgUsinaEntity)
    private readonly usinaRepo: Repository<PrgUsinaEntity>,
    @InjectRepository(PrgDadosProgramacaoEntity)
    private readonly dadosRepo: Repository<PrgDadosProgramacaoEntity>,
  ) {}

  async listar(): Promise<UsinaResumo[]> {
    const entities = await this.usinaRepo.find({
      order: { nrOrdUsina: 'ASC' },
    });

    return entities.map((e) => ({
      cdUsina: e.cdUsina,
      nomeUsina: e.nmUsina,
      tipo: e.cdTipoUsina === 1 ? 'HIDRO' : 'TERMO',
      situacao: e.flUsinaAtv === 1 ? 'ATIVA' : 'INATIVA',
      flUsinaEngie: e.flUsinaEngie,
      flUsinaAtv: e.flUsinaAtv,
      nrOrdUsina: e.nrOrdUsina,
    }));
  }

  async buscarHistorico(
    cdUsina: string,
    dtInicio: string,
    dtFim: string,
  ): Promise<UsinaHistoricoItem[]> {
    // Usa buffer de ±1 dia para compensar o offset de timezone do Oracle.
    // O Oracle armazena DT_PROGRAMACAO em horário local (BRT, UTC-3).
    // Um range UTC puro (T00:00:00Z a T23:59:59Z) vira no Oracle:
    //   "dia anterior 21:00:00" a "dia 20:59:59" em BRT,
    // o que pode incluir registros do dia anterior ou excluir registros
    // do último dia. O buffer garante cobertura total, e o filtro
    // posterior por toDateString() remove registros fora do range.
    const dadosEntities = await this.dadosRepo.find({
      where: {
        cdUsina,
        dtProgramacao: Between(startOfDayWithBuffer(dtInicio), endOfDayWithBuffer(dtFim)),
      },
      order: { dtProgramacao: 'ASC', cdDadosProg: 'ASC' },
    });

    // Filtra resultados pelo componente de data UTC, removendo registros
    // que caíram no buffer mas estão fora do range solicitado.
    const filtered = dadosEntities.filter((d) => {
      const dateStr = toDateString(new Date(d.dtProgramacao));
      return dateStr >= dtInicio && dateStr <= dtFim;
    });

    return filtered.map((d) => ({
      dtProgramacao: toDateString(new Date(d.dtProgramacao)),
      periodo: Number(d.cdDadosProg), // TODO(supero): mapear período real
      geracaoMW: Number(d.nrGeracao),
      vazaoVertida: Number(d.nrVazaoVertida),
      vazaoIncremental: Number(d.nrVazaoIncr),
      nivelReservatorio: Number(d.vlNivelRes),
      volumeTotal: Number(d.vlVolume),
      vazaoTurbinada: Number(d.nrVazaoTurb),
      vazaoDefluente: Number(d.nrVazaoDefluente),
      vazaoAfluente: Number(d.nrVazaoAfluente),
      dadosVerificados: d.flGerManual === 0,
    }));
  }
}