import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { PrgProgramacaoEntity } from '../entities/prg-programacao.entity';
import type { IProgramacaoWriteRepository } from '@modules/command/domain/ports/programacao-write-repository.port';
import { Programacao, SituacaoProgramacao } from '@modules/command/domain/entities/programacao.entity';
import { toDateString, safeNoon } from '../date-utils';

@Injectable()
export class TypeOrmProgramacaoWriteRepository implements IProgramacaoWriteRepository {
  constructor(
    @InjectRepository(PrgProgramacaoEntity)
    private readonly programacaoRepo: Repository<PrgProgramacaoEntity>,
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
