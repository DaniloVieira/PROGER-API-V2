import { CalculoHidraulicoService } from './calculo-hidraulico.service';
import { Vazao } from '../value-objects/vazao';
import { Volume } from '../value-objects/volume';
import { NivelReservatorio } from '../value-objects/nivel-reservatorio';
import { DomainException } from '@shared/domain';

describe('CalculoHidraulicoService', () => {
  let service: CalculoHidraulicoService;

  beforeEach(() => {
    service = new CalculoHidraulicoService();
  });

  describe('calcularVazaoDefluente', () => {
    it('deve calcular vazão defluente (turbinada + vertida) — backward compatibility com 3 args', () => {
      // geracao 100 MW, produtibilidade 4.5 => vazaoTurbinada ~22 m³/s
      // vazaoVertida = 10 m³/s
      const resultado = service.calcularVazaoDefluente(100, Vazao.create(10), 4.5);
      expect(resultado.valor).toBe(32); // 22 + 10 = 32 (arredondado)
    });

    it('deve calcular vazão defluente incluindo vão livre', () => {
      // geracao 100 MW, produtibilidade 4.5 => turbinada 22
      // vertida 10 + vaoLivre 5 => defluente 37
      const resultado = service.calcularVazaoDefluente(
        100,
        Vazao.create(10),
        4.5,
        Vazao.create(5),
      );
      expect(resultado.valor).toBe(37);
    });

    it('deve calcular vazão defluente com vão livre zero igual a backward compatibility', () => {
      const resultado3 = service.calcularVazaoDefluente(100, Vazao.create(10), 4.5);
      const resultado4 = service.calcularVazaoDefluente(
        100,
        Vazao.create(10),
        4.5,
        Vazao.create(0),
      );
      expect(resultado3.valor).toBe(resultado4.valor);
    });
  });

  describe('calcularVazaoAfluente', () => {
    it('deve calcular vazão afluente (incremental + montantes)', () => {
      const incremental = Vazao.create(100);
      const montantes = [Vazao.create(50), Vazao.create(75)];
      const resultado = service.calcularVazaoAfluente(incremental, montantes);
      expect(resultado.valor).toBe(225); // 100 + 50 + 75 = 225
    });

    it('deve calcular vazão afluente sem montantes', () => {
      const incremental = Vazao.create(100);
      const resultado = service.calcularVazaoAfluente(incremental, []);
      expect(resultado.valor).toBe(100);
    });
  });

  describe('calcularVolumeTotal', () => {
    it('deve calcular volume total com aumento', () => {
      const volumeAnterior = Volume.create(1000);
      const afluente = Vazao.create(500);
      const defluente = Vazao.create(300);
      const coefConv = 2.0;

      const resultado = service.calcularVolumeTotal(volumeAnterior, afluente, defluente, coefConv);
      // variacao = (500 - 300) / 2.0 = 100
      expect(resultado.valorHm3).toBe(1100);
    });
  });

  describe('calcularNivelReservatorio', () => {
    it('deve calcular nível exato da curva', () => {
      const volume = Volume.create(500);
      const curva = [
        { cota: 845.0, volume: 400.0 },
        { cota: 850.0, volume: 500.0 },
        { cota: 855.0, volume: 600.0 },
      ];

      const resultado = service.calcularNivelReservatorio(volume, curva);
      expect(resultado.valor).toBe(850.0);
    });
  });

  describe('calcularVolumeReservatorio — interpolação inversa', () => {
    it('deve calcular volume exato a partir de nível', () => {
      const nivel = NivelReservatorio.create(850.0);
      const curva = [
        { cota: 845.0, volume: 400.0 },
        { cota: 850.0, volume: 500.0 },
        { cota: 855.0, volume: 600.0 },
      ];

      const resultado = service.calcularVolumeReservatorio(nivel, curva);
      expect(resultado.valorHm3).toBe(500.0);
    });

    it('deve interpolar volume linearmente a partir de nível', () => {
      const nivel = NivelReservatorio.create(847.5);
      const curva = [
        { cota: 845.0, volume: 400.0 },
        { cota: 850.0, volume: 500.0 },
        { cota: 855.0, volume: 600.0 },
      ];

      const resultado = service.calcularVolumeReservatorio(nivel, curva);
      expect(resultado.valorHm3).toBeCloseTo(450.0, 2);
    });
  });

  describe('calcularMediaDefluenteMontante — média temporal das defluentes de montante', () => {
    const serie = [
      Vazao.create(10),
      Vazao.create(20),
      Vazao.create(30),
      Vazao.create(40),
      Vazao.create(50),
      Vazao.create(60),
    ];

    it('deve calcular média padrão de janela temporal', () => {
      // viagemIni=2, viagemFim=4, indice=5 => janela [1, 3] => 20, 30, 40 => média 30
      const resultado = service.calcularMediaDefluenteMontante(serie, 2, 4, 5);
      expect(resultado.valor).toBe(30);
    });

    it('deve calcular média com janela de período único', () => {
      // viagemIni=0, viagemFim=0, indice=3 => janela [3, 3] => 40
      const resultado = service.calcularMediaDefluenteMontante(serie, 0, 0, 3);
      expect(resultado.valor).toBe(40);
    });

    it('deve retornar zero quando janela inteira está antes do início da série', () => {
      // indice=1, viagemIni=2, viagemFim=4 => fim = -1 < 0
      const resultado = service.calcularMediaDefluenteMontante(serie, 2, 4, 1);
      expect(resultado.valor).toBe(0);
    });

    it('deve calcular média parcial no início da série', () => {
      // indice=2, viagemIni=2, viagemFim=5 => inicio=-3, fim=0 => clamp [0,0] => média 10
      const resultado = service.calcularMediaDefluenteMontante(serie, 2, 5, 2);
      expect(resultado.valor).toBe(10);
    });

    it('deve lançar DomainException quando viagemIni > viagemFim', () => {
      expect(() => service.calcularMediaDefluenteMontante(serie, 4, 2, 5)).toThrow(DomainException);
      expect(() => service.calcularMediaDefluenteMontante(serie, 4, 2, 5)).toThrow('viagemIni não pode ser maior que viagemFim');
    });

    it('deve retornar zero para série vazia', () => {
      const resultado = service.calcularMediaDefluenteMontante([], 1, 2, 5);
      expect(resultado.valor).toBe(0);
    });
  });

  describe('preverVaoLivre', () => {
    it('deve prever vazão de vão livre com base no nível anterior', () => {
      const nivelAnterior = NivelReservatorio.create(850.0);
      const tabela = [
        { nivel: 845.0, vazao: 10.0 },
        { nivel: 850.0, vazao: 25.0 },
        { nivel: 855.0, vazao: 45.0 },
      ];

      const resultado = service.preverVaoLivre(tabela, nivelAnterior);
      expect(resultado.valor).toBe(25.0);
    });
  });
});
