import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { PrgProgramacaoEntity } from '../entities/prg-programacao.entity';
import { PrgDadosProgramacaoEntity } from '../entities/prg-dados-programacao.entity';
import type { IProgramacaoWriteRepository, DadosProgramacaoEditarItem } from '@modules/command/domain/ports/programacao-write-repository.port';
import { Programacao, SituacaoProgramacao } from '@modules/command/domain/entities/programacao.entity';
import { DomainException } from '@shared/domain/domain.exception';
import { toDateString, safeNoon } from '../date-utils';

@Injectable()
export class TypeOrmProgramacaoWriteRepository implements IProgramacaoWriteRepository {
  constructor(
    @InjectRepository(PrgProgramacaoEntity)
    private readonly programacaoRepo: Repository<PrgProgramacaoEntity>,
    @InjectRepository(PrgDadosProgramacaoEntity)
    private readonly dadosRepo: Repository<PrgDadosProgramacaoEntity>,
  ) {}

  async buscarPorId(cdProgramacao: number): Promise<Programacao | null> {
    const entity = await this.programacaoRepo.findOne({
      where: { cdProgramacao },
    });
    if (!entity) return null;

    return this.toDomain(entity);
  }

  async salvar(programacao: Programacao): Promise<void> {
    const entity = await this.programacaoRepo.findOne({
      where: { cdProgramacao: programacao.cdProgramacao },
    });

    if (entity) {
      entity.dtPublicacao = programacao.situacao === SituacaoProgramacao.PUBLICADA
        ? new Date()
        : entity.dtPublicacao;
      entity.nmUsuarioPublicacao = programacao.situacao === SituacaoProgramacao.PUBLICADA
        ? 'system' // TODO(supero): receber usuário real
        : entity.nmUsuarioPublicacao;
      await this.programacaoRepo.save(entity);
    } else {
      const novo = new PrgProgramacaoEntity();
      novo.cdProgramacao = programacao.cdProgramacao;
      novo.cdUsina = programacao.cdUsina;
      novo.dtProgramacao = this.parseDate(programacao.dtProgramacao);
      novo.nmUsuario = 'system';
      novo.dtAlteracao = new Date();
      novo.dtPublicacao = programacao.situacao === SituacaoProgramacao.PUBLICADA
        ? new Date()
        : null;
      novo.nmUsuarioPublicacao = programacao.situacao === SituacaoProgramacao.PUBLICADA
        ? 'system'
        : null;
      await this.programacaoRepo.save(novo);
    }
  }

  async atualizarDados(cdProgramacao: number, dados: DadosProgramacaoEditarItem[], dtAlteracao?: string): Promise<void> {
    const programacao = await this.programacaoRepo.findOne({
      where: { cdProgramacao },
    });

    if (!programacao) {
      throw new DomainException(`Programação ${cdProgramacao} não encontrada.`);
    }

    // Optimistic locking via dtAlteracao
    if (dtAlteracao) {
      const currentTs = programacao.dtAlteracao instanceof Date
        ? programacao.dtAlteracao.getTime()
        : new Date(String(programacao.dtAlteracao)).getTime();
      const incomingTs = new Date(dtAlteracao).getTime();
      if (currentTs !== incomingTs) {
        throw new DomainException('A programação foi alterada por outro usuário. Recarregue os dados e tente novamente.');
      }
    }

    const dadosEntities = await this.dadosRepo.find({
      where: { cdProgramacao },
      order: { cdDadosProg: 'ASC' },
    });

    if (dadosEntities.length === 0) {
      throw new DomainException(`Nenhum dado encontrado para a programação ${cdProgramacao}.`);
    }

    for (const item of dados) {
      const entity = dadosEntities[item.periodo];
      if (!entity) {
        throw new DomainException(`Período ${item.periodo} não encontrado.`);
      }
      if (item.geracaoMW !== undefined) {
        entity.nrGeracao = item.geracaoMW;
      }
      if (item.vazaoVertida !== undefined) {
        entity.nrVazaoVertida = item.vazaoVertida;
      }
      if (item.vazaoIncremental !== undefined) {
        entity.nrVazaoIncr = item.vazaoIncremental;
      }
    }

    await this.dadosRepo.save(dadosEntities);

    programacao.dtAlteracao = new Date();
    await this.programacaoRepo.save(programacao);
  }

  private parseDate(dateStr: string): Date {
    return safeNoon(dateStr);
  }

  private toDomain(entity: PrgProgramacaoEntity): Programacao {
    return Programacao.create({
      cdProgramacao: Number(entity.cdProgramacao),
      cdUsina: entity.cdUsina,
      dtProgramacao: toDateString(new Date(entity.dtProgramacao)),
      situacao: entity.dtPublicacao ? SituacaoProgramacao.PUBLICADA : SituacaoProgramacao.EM_EDICAO,
    });
  }
}
