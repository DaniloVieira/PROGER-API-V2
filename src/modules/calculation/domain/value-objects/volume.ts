import { DomainException } from '@shared/domain';

export class Volume {
  private constructor(readonly valorHm3: number) {}

  static create(valorHm3: number): Volume {
    return new Volume(valorHm3);
  }

  static fromNivel(
    nivel: number,
    curva: Array<{ cota: number; volume: number }>,
  ): Volume {
    if (curva.length === 0) {
      throw new DomainException('Curva cota-volume vazia');
    }

    const sorted = [...curva].sort((a, b) => a.cota - b.cota);

    const exato = sorted.find((c) => c.cota === nivel);
    if (exato) {
      return Volume.create(exato.volume);
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      const inferior = sorted[i];
      const superior = sorted[i + 1];

      if (nivel >= inferior.cota && nivel <= superior.cota) {
        const volume =
          inferior.volume +
          ((nivel - inferior.cota) / (superior.cota - inferior.cota)) *
            (superior.volume - inferior.volume);
        return Volume.create(parseFloat(volume.toFixed(2)));
      }
    }

    if (nivel < sorted[0].cota) {
      return Volume.create(sorted[0].volume);
    }
    return Volume.create(sorted[sorted.length - 1].volume);
  }

  calcularVariacao(vazaoAfluente: { valor: number }, vazaoDefluente: { valor: number }, coefConversao: number): Volume {
    const variacao = (vazaoAfluente.valor - vazaoDefluente.valor) / coefConversao;
    return Volume.create(this.valorHm3 + variacao);
  }
}
