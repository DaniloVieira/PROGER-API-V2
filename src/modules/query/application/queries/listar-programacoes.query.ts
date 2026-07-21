import { Injectable, Inject } from '@nestjs/common';
import type { IProgramacaoReadRepository } from '../../domain/read-models/programacao-read.model';
import type { ProgramacaoResumoDto, PaginatedResponseDto } from '../dtos/programacao-resumo.dto';

export class ListarProgramacoesQuery {
  constructor(
    public readonly cdUsina?: string,
    public readonly dtProgramacao?: string,
    public readonly page: number = 1,
    public readonly size: number = 20,
  ) {}
}

@Injectable()
export class ListarProgramacoesHandler {
  constructor(
    @Inject('IProgramacaoReadRepository')
    private readonly repository: IProgramacaoReadRepository,
  ) {}

  async execute(query: ListarProgramacoesQuery): Promise<PaginatedResponseDto<ProgramacaoResumoDto>> {
    const result = await this.repository.listar({
      cdUsina: query.cdUsina,
      dtProgramacao: query.dtProgramacao,
      page: query.page,
      size: query.size,
    });

    return {
      items: result.items.map((item) => ({
        cdProgramacao: item.cdProgramacao,
        cdUsina: item.cdUsina,
        dtProgramacao: item.dtProgramacao,
        situacao: item.situacao,
      })),
      total: result.total,
      page: result.page,
      size: result.size,
    };
  }
}
