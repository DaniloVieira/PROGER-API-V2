export class NivelReservatorio {
  private constructor(
    readonly valor: number,
    readonly unidade: 'm',
  ) {}

  static create(valor: number): NivelReservatorio {
    return new NivelReservatorio(valor, 'm');
  }

  static interpolar(
    volumeTotal: { valorHm3: number },
    curva: Array<{ cota: number; volume: number }>,
  ): NivelReservatorio {
    // Ordena por volume crescente
    const sorted = [...curva].sort((a, b) => a.volume - b.volume);

    // Caso exato
    const exato = sorted.find((c) => c.volume === volumeTotal.valorHm3);
    if (exato) {
      return NivelReservatorio.create(exato.cota);
    }

    // Interpolação linear
    for (let i = 0; i < sorted.length - 1; i++) {
      const inferior = sorted[i];
      const superior = sorted[i + 1];

      if (volumeTotal.valorHm3 >= inferior.volume && volumeTotal.valorHm3 <= superior.volume) {
        const nivel =
          inferior.cota +
          ((volumeTotal.valorHm3 - inferior.volume) / (superior.volume - inferior.volume)) *
            (superior.cota - inferior.cota);
        return NivelReservatorio.create(parseFloat(nivel.toFixed(2)));
      }
    }

    // Fora da curva — retorna o limite mais próximo
    if (volumeTotal.valorHm3 < sorted[0].volume) {
      return NivelReservatorio.create(sorted[0].cota);
    }
    return NivelReservatorio.create(sorted[sorted.length - 1].cota);
  }
}
