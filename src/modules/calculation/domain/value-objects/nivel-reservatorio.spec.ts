import { NivelReservatorio } from './nivel-reservatorio';
import { Volume } from './volume';

describe('NivelReservatorio', () => {
  it('deve criar nível', () => {
    const nivel = NivelReservatorio.create(850.5);
    expect(nivel.valor).toBe(850.5);
    expect(nivel.unidade).toBe('m');
  });

  it('deve interpolar nível a partir de volume e curva cota-volume (caso exato)', () => {
    const volume = Volume.create(500);
    const curva = [
      { cota: 845.0, volume: 400.0 },
      { cota: 850.0, volume: 500.0 },
      { cota: 855.0, volume: 600.0 },
    ];

    const nivel = NivelReservatorio.interpolar(volume, curva);
    expect(nivel.valor).toBe(850.0);
  });

  it('deve interpolar nível linearmente entre dois pontos', () => {
    const volume = Volume.create(450); // entre 400 e 500
    const curva = [
      { cota: 845.0, volume: 400.0 },
      { cota: 850.0, volume: 500.0 },
      { cota: 855.0, volume: 600.0 },
    ];

    const nivel = NivelReservatorio.interpolar(volume, curva);
    // Interpolação linear:
    // nivel = 845 + ((450 - 400) / (500 - 400)) * (850 - 845)
    // nivel = 845 + (50/100) * 5 = 845 + 2.5 = 847.5
    expect(nivel.valor).toBeCloseTo(847.5, 2);
  });
});
