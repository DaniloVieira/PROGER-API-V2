import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { PrgProgramacaoEntity } from '../entities/prg-programacao.entity';
import { PrgDadosProgramacaoEntity } from '../entities/prg-dados-programacao.entity';
import type {
  IProgramacaoReadRepository,
  ProgramacaoResumo,
  ProgramacaoDados,
  DadosPainel,
  DadosPainelItem,
} from '@modules/query/domain/read-models/programacao-read.model';
import { TypeOrmCurvaCotaVolRepository } from './typeorm-curva-cota-vol.repository';
import { TypeOrmRelacUsinasRepository } from './typeorm-relac-usinas.repository';
import { TypeOrmParametrosRepository } from './typeorm-parametros.repository';
import type { ICalculoHidraulicoService } from '@modules/calculation/domain/services/calculo-hidraulico.service';
import type { IProdutibilidadeRepository } from '@modules/calculation/domain/ports/produtibilidade-repository.port';
import type { IRestricaoRepository } from '@modules/restriction/domain/ports/restricao-repository.port';
import { Vazao } from '@modules/calculation/domain/value-objects/vazao';
import { Volume } from '@modules/calculation/domain/value-objects/volume';
import { NivelReservatorio } from '@modules/calculation/domain/value-objects/nivel-reservatorio';
import { DomainException } from '@shared/domain';
import { ValidadorPainelService } from '@modules/restriction/domain/services/validador-painel.service';
import { toDateString, startOfDay, endOfDay, startOfDayWithBuffer, endOfDayWithBuffer } from '../date-utils';

@Injectable()
export class TypeOrmProgramacaoReadRepository implements IProgramacaoReadRepository {
  constructor(
    @InjectRepository(PrgProgramacaoEntity)
    private readonly programacaoRepo: Repository<PrgProgramacaoEntity>,
    @InjectRepository(PrgDadosProgramacaoEntity)
    private readonly dadosRepo: Repository<PrgDadosProgramacaoEntity>,
    @Inject(TypeOrmCurvaCotaVolRepository)
    private readonly curvaRepo: TypeOrmCurvaCotaVolRepository,
    @Inject(TypeOrmRelacUsinasRepository)
    private readonly relacUsinasRepo: TypeOrmRelacUsinasRepository,
    @Inject(TypeOrmParametrosRepository)
    private readonly parametrosRepo: TypeOrmParametrosRepository,
    @Inject('ICalculoHidraulicoService')
    private readonly calculoService: ICalculoHidraulicoService,
    @Inject('IProdutibilidadeRepository')
    private readonly produtibilidadeRepo: IProdutibilidadeRepository,
    @Inject('IRestricaoRepository')
    private readonly restricaoRepo: IRestricaoRepository,
  ) {}

  async listar(filtros: {
    cdUsina?: string;
    dtProgramacao?: string;
    page: number;
    size: number;
  }): Promise<{
    items: ProgramacaoResumo[];
    total: number;
    page: number;
    size: number;
  }> {
    const qb = this.programacaoRepo.createQueryBuilder('p');

    if (filtros.cdUsina) {
      qb.andWhere('p.cdUsina = :cdUsina', { cdUsina: filtros.cdUsina });
    }

    if (filtros.dtProgramacao) {
      const dtStart = startOfDay(filtros.dtProgramacao);
      const dtEnd = endOfDay(filtros.dtProgramacao);
      qb.andWhere('p.dtProgramacao >= :dtStart AND p.dtProgramacao <= :dtEnd', {
        dtStart,
        dtEnd,
      });
    }

    const total = await qb.getCount();

    const entities = await qb
      .orderBy('p.dtProgramacao', 'DESC')
      .skip((filtros.page - 1) * filtros.size)
      .take(filtros.size)
      .getMany();

    const items: ProgramacaoResumo[] = entities.map((e) => ({
      cdProgramacao: Number(e.cdProgramacao),
      cdUsina: e.cdUsina,
      dtProgramacao: toDateString(new Date(e.dtProgramacao)),
      situacao: e.dtPublicacao ? 'PUBLICADA' : 'EM_EDICAO',
    }));

    return { items, total, page: filtros.page, size: filtros.size };
  }

  async buscarDados(cdProgramacao: number): Promise<ProgramacaoDados | null> {
    const programacao = await this.programacaoRepo.findOne({
      where: { cdProgramacao },
    });
    if (!programacao) return null;

    const dadosEntities = await this.dadosRepo.find({
      where: { cdProgramacao },
      order: { cdDadosProg: 'ASC' },
    });

    return {
      cdProgramacao: Number(programacao.cdProgramacao),
      cdUsina: programacao.cdUsina,
      dtProgramacao: toDateString(new Date(programacao.dtProgramacao)),
      situacao: programacao.dtPublicacao ? 'PUBLICADA' : 'EM_EDICAO',
      dados: dadosEntities.map((d) => ({
        periodo: Number(d.cdDadosProg),
        geracaoMW: Number(d.nrGeracao),
        vazaoVertida: Number(d.nrVazaoVertida),
        vazaoIncremental: Number(d.nrVazaoIncr),
        nivelReservatorio: Number(d.vlNivelRes),
        volumeTotal: Number(d.vlVolume),
        vazaoTurbinada: Number(d.nrVazaoTurb),
        vazaoDefluente: Number(d.nrVazaoDefluente),
        vazaoAfluente: Number(d.nrVazaoAfluente),
        dadosVerificados: d.flGerManual === 0,
      })),
    };
  }

  async buscarDadosPainel(filtros: {
    cdUsina: string;
    dtProgramacao: string;
  }): Promise<DadosPainel | null> {
    const dtAnterior = new Date(filtros.dtProgramacao + 'T00:00:00');
    dtAnterior.setDate(dtAnterior.getDate() - 1);
    const dtAnteriorStr = toDateString(dtAnterior);

    const dtStart = startOfDayWithBuffer(dtAnteriorStr);
    const dtEnd = endOfDayWithBuffer(filtros.dtProgramacao);

    const montantes = await this.relacUsinasRepo.buscarMontantesPorUsinaReferencia(filtros.cdUsina);
    const usinas = [filtros.cdUsina, ...montantes.map((m) => m.cdUsinaMontante)];

    const produtibilidade = await this.produtibilidadeRepo.buscarPorUsina(filtros.cdUsina);
    const paramCoef = await this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'COEF_CONV_MIN');
    const coefConvMin = paramCoef ? Number(paramCoef.vlParametro) : null;

    const curvaEntities = await this.curvaRepo.buscarCurvaPorUsina(filtros.cdUsina);
    const curva = curvaEntities.map((c) => ({ cota: c.vlCotaOpr, volume: c.vlVolume }));
    const hasCurva = curva.length > 0;

    const inClause = usinas.map((_, i) => `:${i + 1}`).join(', ');
    const dtStartIdx = usinas.length + 1;
    const dtEndIdx = usinas.length + 2;
    const params = [...usinas, dtStart, dtEnd];

    const sqlProg = `
      SELECT CD_USINA AS "cd_usina",
             DT_PROGRAMACAO AS "dt_programacao",
             NR_GERACAO AS "geracao_mw",
             NR_VAZAO_VERTIDA AS "vazao_vertida",
             NR_VAZAO_INCR AS "vazao_incremental",
             VL_NIVEL_RES AS "nivel_reservatorio",
             VL_VOLUME AS "volume_total",
             NR_VAZAO_TURB AS "vazao_turbinada",
             NR_VAZAO_DEFLUENTE AS "vazao_defluente",
             NR_VAZAO_AFLUENTE AS "vazao_afluente",
             NR_DISPONIVEL AS "disponivel",
             NR_GERACAO_ONS AS "geracao_mw_ons",
             NR_VAZAO_VAO_LIVRE AS "vazao_vao_livre"
      FROM PRG_DADOS_PROGRAMACAO
      WHERE CD_USINA IN (${inClause})
        AND DT_PROGRAMACAO >= :${dtStartIdx} AND DT_PROGRAMACAO <= :${dtEndIdx}
      ORDER BY CD_USINA, DT_PROGRAMACAO ASC
    `;

    const sqlHist = `
      SELECT CD_USINA AS "cd_usina",
             DT_PROGRAMACAO AS "dt_programacao",
             NR_GERACAO_VER AS "geracao_mw",
             NR_VAZAO_VERTIDA_VER AS "vazao_vertida",
             NR_VAZAO_INCR_VER AS "vazao_incremental",
             VL_NIVEL_RESER_VER AS "nivel_reservatorio",
             0 AS "volume_total",
             NR_VAZAO_TURB_VER AS "vazao_turbinada",
             NR_VAZAO_DEFL_VER AS "vazao_defluente",
             NR_VAZAO_AFL_VER AS "vazao_afluente",
             VL_DISPONIVEL AS "disponivel",
             NR_VAZAO_VAO_LIVRE_VER AS "vazao_vao_livre"
      FROM PRG_DADOS_HISTORIADOR
      WHERE CD_USINA IN (${inClause})
        AND DT_PROGRAMACAO >= :${dtStartIdx} AND DT_PROGRAMACAO <= :${dtEndIdx}
      ORDER BY CD_USINA, DT_PROGRAMACAO ASC
    `;

    const rawProg = await this.programacaoRepo.query(sqlProg, params);
    const rawHist = await this.programacaoRepo.query(sqlHist, params);

    const mapaPorUsina = new Map<string, Map<string, any>>();

    for (const r of rawProg || []) {
      const usina = r.cd_usina;
      if (!mapaPorUsina.has(usina)) mapaPorUsina.set(usina, new Map());
      const usinaMap = mapaPorUsina.get(usina)!;
      const key = r.dt_programacao.toISOString ? r.dt_programacao.toISOString() : String(r.dt_programacao);
      usinaMap.set(key, { ...r, dados_verificados: 0 });
    }

    for (const r of rawHist || []) {
      const usina = r.cd_usina;
      if (!mapaPorUsina.has(usina)) mapaPorUsina.set(usina, new Map());
      const usinaMap = mapaPorUsina.get(usina)!;
      const key = r.dt_programacao.toISOString ? r.dt_programacao.toISOString() : String(r.dt_programacao);
      usinaMap.set(key, { ...r, dados_verificados: 1 });
    }

    const dadosPorUsina = new Map<string, any[]>();
    for (const [usina, usinaMap] of mapaPorUsina) {
      const arr = Array.from(usinaMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, v]) => v)
        .filter((r: any) => {
          const dateStr = toDateString(new Date(r.dt_programacao));
          return dateStr >= dtAnteriorStr && dateStr <= filtros.dtProgramacao;
        });
      dadosPorUsina.set(usina, arr);
    }

    const refSeries = dadosPorUsina.get(filtros.cdUsina) || [];
    if (refSeries.length === 0) {
      return null;
    }

    const montanteSeries = montantes.map((m) => {
      const series = dadosPorUsina.get(m.cdUsinaMontante) || [];
      const filtered = series.filter((r: any) => {
        const dateStr = toDateString(new Date(r.dt_programacao));
        return dateStr >= dtAnteriorStr && dateStr <= filtros.dtProgramacao;
      });

      return {
        cdUsina: m.cdUsinaMontante,
        viagemIniPeriodos: Math.round(m.vlTmpViagemIni * 2),
        viagemFimPeriodos: Math.round(m.vlTmpViagemFim * 2),
        defluentes: filtered.map((r: any) => Vazao.create(Number(r.vazao_defluente) || 0)),
      };
    });

    let previousVolume: Volume | null = null;
    const dados: DadosPainelItem[] = [];

    for (let i = 0; i < refSeries.length; i++) {
      const r = refSeries[i];
      const isHistoriador = Number(r.dados_verificados) === 1;
      const geracaoMW = Number(r.geracao_mw) || 0;
      const vazaoVertida = Number(r.vazao_vertida) || 0;
      const vazaoIncremental = Number(r.vazao_incremental) || 0;
      const vazaoVaoLivre = Number(r.vazao_vao_livre) || 0;
      const disponivel = Number(r.disponivel) || 0;
      const geracaoMWOns = isHistoriador ? undefined : (Number(r.geracao_mw_ons) || 0);

      let nivelReservatorio: number;
      let volumeTotal: number;
      let vazaoTurbinada: number;
      let vazaoDefluente: number;
      let vazaoAfluente: number;

      if (isHistoriador) {
        const dbNivel = Number(r.nivel_reservatorio) || 0;
        nivelReservatorio = dbNivel;

        if (hasCurva) {
          try {
            const vol = this.calculoService.calcularVolumeReservatorio(NivelReservatorio.create(dbNivel), curva);
            volumeTotal = vol.valorHm3;
          } catch {
            volumeTotal = 0;
          }
        } else {
          volumeTotal = 0;
        }

        vazaoTurbinada = Number(r.vazao_turbinada) || 0;
        vazaoDefluente = Number(r.vazao_defluente) || 0;
        vazaoAfluente = Number(r.vazao_afluente) || 0;

        previousVolume = Volume.create(volumeTotal);
      } else {
        if (!produtibilidade || produtibilidade === 0) {
          throw new DomainException(`Produtibilidade não encontrada ou zero para usina ${filtros.cdUsina}`);
        }
        if (!coefConvMin || coefConvMin === 0) {
          throw new DomainException(`COEF_CONV_MIN não encontrado ou zero para usina ${filtros.cdUsina}`);
        }

        const vazaoTurbinadaObj = Vazao.create(0).toTurbinada(geracaoMW, produtibilidade);
        vazaoTurbinada = vazaoTurbinadaObj.valor;

        const vazaoDefluenteObj = this.calculoService.calcularVazaoDefluente(
          geracaoMW,
          Vazao.create(vazaoVertida),
          produtibilidade,
          Vazao.create(vazaoVaoLivre),
        );
        vazaoDefluente = vazaoDefluenteObj.valor;

        const vazoesMontantes: Vazao[] = [];
        for (const ms of montanteSeries) {
          if (ms.defluentes.length > 0) {
            const media = this.calculoService.calcularMediaDefluenteMontante(
              ms.defluentes,
              ms.viagemIniPeriodos,
              ms.viagemFimPeriodos,
              i,
            );
            vazoesMontantes.push(media);
          }
        }

        const vazaoAfluenteObj = this.calculoService.calcularVazaoAfluente(
          Vazao.create(vazaoIncremental),
          vazoesMontantes,
        );
        vazaoAfluente = vazaoAfluenteObj.valor;

        if (previousVolume === null) {
          previousVolume = Volume.create(Number(r.volume_total) || 0);
        }

        const volumeObj = this.calculoService.calcularVolumeTotal(
          previousVolume,
          vazaoAfluenteObj,
          vazaoDefluenteObj,
          coefConvMin,
        );
        volumeTotal = volumeObj.valorHm3;

        if (hasCurva) {
          try {
            const nivelObj = this.calculoService.calcularNivelReservatorio(volumeObj, curva);
            nivelReservatorio = nivelObj.valor;
          } catch {
            nivelReservatorio = Number(r.nivel_reservatorio) || 0;
          }
        } else {
          nivelReservatorio = Number(r.nivel_reservatorio) || 0;
        }

        previousVolume = volumeObj;
      }

      dados.push({
        periodo: i,
        dtProgramacao: toDateString(new Date(r.dt_programacao)),
        geracaoMW,
        geracaoMWOns,
        vazaoVertida,
        vazaoIncremental,
        nivelReservatorio,
        volumeTotal,
        vazaoTurbinada,
        vazaoDefluente,
        vazaoAfluente,
        disponivel,
        dadosVerificados: isHistoriador,
      });
    }

    const [nvMax, nvMin, gerMax, gerMin, vzMax, vzMin, restricoes] = await Promise.all([
      this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'EIXO_NV_MAX'),
      this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'EIXO_NV_MIN'),
      this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'EIXO_GER_MAX'),
      this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'EIXO_GER_MIN'),
      this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'EIXO_VZ_MAX'),
      this.parametrosRepo.buscarParametroPorUsinaENome(filtros.cdUsina, 'EIXO_VZ_MIN'),
      this.restricaoRepo.buscarRestricoesAtivas(filtros.cdUsina, 0),
    ]);

    const nvMaxParam = nvMax ? Number(nvMax.vlParametro) : null;
    const nvMinParam = nvMin ? Number(nvMin.vlParametro) : null;
    const nivelMaxRestricao = restricoes.find((r) => r.cdTpRestricao === 20)?.vlRestricao;
    const nivelMinRestricao = restricoes.find((r) => r.cdTpRestricao === 19)?.vlRestricao;

    for (const d of dados) {
      d.nivelMaximoReservatorio = nivelMaxRestricao || nvMaxParam || 0;
      d.nivelMinimoReservatorio = nivelMinRestricao || nvMinParam || 0;
    }

    const vazaoAfluenteVals = dados.map((d) => d.vazaoAfluente);
    const nivelResVals = dados.map((d) => d.nivelReservatorio);
    const geracaoVals = dados.map((d) => d.geracaoMW);

    const eixoVazaoGeracao = (gerMax && gerMin)
      ? this.gerarValoresEixo(gerMax.vlParametro, gerMin.vlParametro)
      : this.gerarValoresEixo(Math.max(...vazaoAfluenteVals), Math.min(...vazaoAfluenteVals));

    const eixoNivelRes = (nvMax && nvMin)
      ? this.gerarValoresEixo(nvMax.vlParametro, nvMin.vlParametro)
      : this.gerarValoresEixo(Math.max(...nivelResVals), Math.min(...nivelResVals));

    const eixoDispGeracao = (vzMax && vzMin)
      ? this.gerarValoresEixo(vzMax.vlParametro, vzMin.vlParametro)
      : this.gerarValoresEixo(Math.max(...geracaoVals), Math.min(...geracaoVals));

    const validadorPainel = new ValidadorPainelService();
    const alertasRestricoesPainel = validadorPainel.validar(
      dados,
      restricoes,
    );

    const onsPainel = dados.slice(48).some(
      (d) => d.geracaoMWOns !== undefined && d.geracaoMWOns !== d.geracaoMW,
    );

    return {
      cdUsina: filtros.cdUsina,
      dtProgramacao: filtros.dtProgramacao,
      dados,
      eixoVazaoGeracao,
      eixoNivelRes,
      eixoDispGeracao,
      alertasRestricoesPainel,
      onsPainel,
    };
  }

  private gerarValoresEixo(maximo: number | string, minimo: number | string): number[] {
    const valores: number[] = [];
    const max = parseFloat(String(maximo));
    const min = parseFloat(String(minimo));
    if (min === max) return [min];
    const und = parseFloat(((max - min) / 4).toFixed(2));
    for (let index = min; index < max; index += und) {
      valores.push(parseFloat(index.toFixed(2)));
    }
    valores.push(max);
    return valores;
  }
}
