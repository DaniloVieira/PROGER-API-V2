import { Injectable, Inject } from '@nestjs/common';
import type { IUsinaReadRepository } from '../../domain/read-models/usina-read-repository.port';
import type { UsinaResumoDto } from '../dtos/usina-resumo.dto';

@Injectable()
export class ListarUsinasHandler {
  constructor(
    @Inject('IUsinaReadRepository')
    private readonly repository: IUsinaReadRepository,
  ) {}

  async execute(): Promise<UsinaResumoDto[]> {
    const usinas = await this.repository.listar();
    // Filtra apenas usinas Engie e ativas, ordenadas por nrOrdUsina
    const filtradas = usinas
      .filter((u) => u.flUsinaEngie === 1 && u.flUsinaAtv === 1)
      .sort((a, b) => a.nrOrdUsina - b.nrOrdUsina);

    return filtradas.map((u) => ({
      cdUsina: u.cdUsina,
      nomeUsina: u.nomeUsina,
      tipo: u.tipo,
      situacao: u.situacao,
      flUsinaEngie: u.flUsinaEngie,
      flUsinaAtv: u.flUsinaAtv,
      nrOrdUsina: u.nrOrdUsina,
    }));
  }
}