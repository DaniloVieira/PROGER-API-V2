import { DomainException } from "@shared/domain";

export class Vazao {
	private constructor(
		readonly valor: number,
		readonly unidade: "m3/s",
	) {}

	static create(valor: number): Vazao {
		if (valor < 0) {
			throw new DomainException("Vazão não pode ser negativa");
		}
		return new Vazao(valor, "m3/s");
	}

	add(other: Vazao): Vazao {
		return Vazao.create(this.valor + other.valor);
	}

	subtract(other: Vazao): Vazao {
		return Vazao.create(this.valor - other.valor);
	}

	toTurbinada(geracaoMW: number, produtibilidade: number): Vazao {
		if (produtibilidade === 0) {
			throw new DomainException("Produtibilidade não pode ser zero");
		}
		return Vazao.create(Math.round(geracaoMW / produtibilidade));
	}
}
