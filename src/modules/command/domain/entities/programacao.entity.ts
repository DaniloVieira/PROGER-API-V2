import { DomainException } from '@shared/domain/domain.exception';
import { AggregateRoot } from '@shared/domain/aggregate-root';
import { ProgramacaoPublicada } from '../events/programacao-publicada.event';

export enum SituacaoProgramacao {
  EM_EDICAO = 'EM_EDICAO',
  PUBLICADA = 'PUBLICADA',
  CANCELADA = 'CANCELADA',
}

export interface ProgramacaoProps {
  cdProgramacao: number;
  cdUsina: string;
  dtProgramacao: string;
  situacao: SituacaoProgramacao;
}

export class Programacao extends AggregateRoot {
  private constructor(
    public readonly cdProgramacao: number,
    public readonly cdUsina: string,
    public dtProgramacao: string,
    private _situacao: SituacaoProgramacao,
  ) {
    super();
  }

  static create(props: ProgramacaoProps): Programacao {
    return new Programacao(
      props.cdProgramacao,
      props.cdUsina,
      props.dtProgramacao,
      props.situacao,
    );
  }

  get situacao(): SituacaoProgramacao {
    return this._situacao;
  }

  publicar(usuarioId: string): void {
    if (this._situacao !== SituacaoProgramacao.EM_EDICAO) {
      throw new DomainException(
        `Somente programação em edição pode ser publicada. Situação atual: ${this._situacao}`,
      );
    }

    this._situacao = SituacaoProgramacao.PUBLICADA;
    this.addDomainEvent(
      new ProgramacaoPublicada(
        this.cdProgramacao,
        usuarioId,
        new Date(),
      ),
    );
  }
}
