import { Volume } from './volume';
import { Vazao } from './vazao';
import { DomainException } from '@shared/domain';

describe('Volume', () => {
  it('deve criar volume', () => {
    const volume = Volume.create(500.5);
    expect(volume.valorHm3).toBe(500.5);
  });

  it('deve calcular variação de volume', () => {
    const volumeAnterior = Volume.create(1000);
    const afluente = Vazao.create(500);
    const defluente = Vazao.create(300);
    const coefConv = 2.0; // coeficiente de conversão

    const novoVolume = volumeAnterior.calcularVariacao(afluente, defluente, coefConv);
    // variacao = (500 - 300) / 2.0 = 100
    // novoVolume = 1000 + 100 = 1100
    expect(novoVolume.valorHm3).toBe(1100);
  });

  it('deve calcular redução de volume', () => {
    const volumeAnterior = Volume.create(1000);
    const afluente = Vazao.create(200);
    const defluente = Vazao.create(600);
    const coefConv = 2.0;

    const novoVolume = volumeAnterior.calcularVariacao(afluente, defluente, coefConv);
    // variacao = (200 - 600) / 2.0 = -200
    // novoVolume = 1000 - 200 = 800
    expect(novoVolume.valorHm3).toBe(800);
  });

  describe('fromNivel — interpolação inversa (cota → volume)', () => {
    const curva = [
      { cota: 845.0, volume: 400.0 },
      { cota: 850.0, volume: 500.0 },
      { cota: 855.0, volume: 600.0 },
    ];

    it('deve retornar volume exato quando cota está na curva', () => {
      const volume = Volume.fromNivel(850.0, curva);
      expect(volume.valorHm3).toBe(500.0);
    });

    it('deve interpolar linearmente entre dois pontos da curva', () => {
      const volume = Volume.fromNivel(847.5, curva);
      // volume = 400 + ((847.5 - 845) / (850 - 845)) * (500 - 400)
      // volume = 400 + (2.5 / 5) * 100 = 400 + 50 = 450
      expect(volume.valorHm3).toBeCloseTo(450.0, 2);
    });

    it('deve retornar volume mínimo quando nível está abaixo da curva', () => {
      const volume = Volume.fromNivel(840.0, curva);
      expect(volume.valorHm3).toBe(400.0);
    });

    it('deve retornar volume máximo quando nível está acima da curva', () => {
      const volume = Volume.fromNivel(860.0, curva);
      expect(volume.valorHm3).toBe(600.0);
    });

    it('deve lançar DomainException quando curva está vazia', () => {
      expect(() => Volume.fromNivel(850.0, [])).toThrow(DomainException);
      expect(() => Volume.fromNivel(850.0, [])).toThrow('Curva cota-volume vazia');
    });

    it('deve ordenar curva não-ordenada e produzir resultado correto', () => {
      const curvaDesordenada = [
        { cota: 855.0, volume: 600.0 },
        { cota: 845.0, volume: 400.0 },
        { cota: 850.0, volume: 500.0 },
      ];
      const volume = Volume.fromNivel(847.5, curvaDesordenada);
      expect(volume.valorHm3).toBeCloseTo(450.0, 2);
    });
  });
});
