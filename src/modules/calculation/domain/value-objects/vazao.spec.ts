import { Vazao } from './vazao';
import { DomainException } from '@shared/domain';

describe('Vazao', () => {
  it('deve criar vazão válida', () => {
    const vazao = Vazao.create(100.5);
    expect(vazao.valor).toBe(100.5);
    expect(vazao.unidade).toBe('m3/s');
  });

  it('deve rejeitar vazão negativa', () => {
    expect(() => Vazao.create(-1)).toThrow(DomainException);
    expect(() => Vazao.create(-1)).toThrow('Vazão não pode ser negativa');
  });

  it('deve somar duas vazões', () => {
    const v1 = Vazao.create(50);
    const v2 = Vazao.create(75);
    const resultado = v1.add(v2);
    expect(resultado.valor).toBe(125);
  });

  it('deve calcular vazão turbinada a partir de geração e produtibilidade', () => {
    // Exemplo real: geracao 100 MW, produtibilidade 4.5 => vazão ~22 m³/s
    const vazao = Vazao.create(0);
    const resultado = vazao.toTurbinada(100, 4.5);
    expect(resultado.valor).toBe(22); // Math.round(100 / 4.5) = 22
  });

  it('deve rejeitar produtibilidade zero', () => {
    const vazao = Vazao.create(100);
    expect(() => vazao.toTurbinada(100, 0)).toThrow(DomainException);
  });
});
