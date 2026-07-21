import { ValidadorRestricoes } from "./validador-restricoes.service";

describe("ValidadorRestricoes", () => {
	let validador: ValidadorRestricoes;

	beforeEach(() => {
		validador = new ValidadorRestricoes();
	});

	it("deve retornar vazio quando não há restrições", () => {
		const dados = {
			vazaoTurbinada: 100,
			vazaoDefluente: 120,
			vazaoVertida: 20,
			vazaoAfluente: 150,
			nivelReservatorio: 557,
			geracaoMW: 80,
		};

		const resultado = validador.validar(dados, []);
		expect(resultado).toEqual([]);
	});

	it("deve detectar violação de nível mínimo", () => {
		const dados = {
			vazaoTurbinada: 100,
			vazaoDefluente: 120,
			vazaoVertida: 20,
			vazaoAfluente: 150,
			nivelReservatorio: 556,
			geracaoMW: 80,
		};

		const resticoes = [
			{
				cdTpRestricao: 19,
				dsRestricao: "Nível Mínimo (m)",
				dsVarRef: "nivelReservatorio",
				vlRestricao: 557,
			},
		];

		const resultado = validador.validar(dados, resticoes);
		expect(resultado).toHaveLength(1);
		expect(resultado[0].mensagem).toContain("abaixo do mínimo");
	});

	it("deve detectar violação de nível máximo", () => {
		const dados = {
			vazaoTurbinada: 100,
			vazaoDefluente: 120,
			vazaoVertida: 20,
			vazaoAfluente: 150,
			nivelReservatorio: 559,
			geracaoMW: 80,
		};

		const resticoes = [
			{
				cdTpRestricao: 20,
				dsRestricao: "Nível Máximo (m)",
				dsVarRef: "nivelReservatorio",
				vlRestricao: 558,
			},
		];

		const resultado = validador.validar(dados, resticoes);
		expect(resultado).toHaveLength(1);
		expect(resultado[0].mensagem).toContain("excede o máximo");
	});

	it("deve detectar violação de geração máxima", () => {
		const dados = {
			vazaoTurbinada: 300,
			vazaoDefluente: 320,
			vazaoVertida: 20,
			vazaoAfluente: 350,
			nivelReservatorio: 557,
			geracaoMW: 450,
		};

		const resticoes = [
			{
				cdTpRestricao: 23,
				dsRestricao: "Geração Máxima (MW)",
				dsVarRef: "geracaoRef",
				vlRestricao: 424,
			},
		];

		const resultado = validador.validar(dados, resticoes);
		expect(resultado).toHaveLength(1);
		expect(resultado[0].mensagem).toContain("excede o máximo");
	});

	it("deve detectar violação de faixa proibida de geração", () => {
		const dados = {
			vazaoTurbinada: 100,
			vazaoDefluente: 120,
			vazaoVertida: 20,
			vazaoAfluente: 150,
			nivelReservatorio: 557,
			geracaoMW: 120,
		};

		const resticoes = [
			{
				cdTpRestricao: 21,
				dsRestricao: "Faixa de Operação Proibida (MW)",
				dsVarRef: "geracaoRef",
				vlFxIniRest: 107,
				vlFxFimRest: 159,
			},
		];

		const resultado = validador.validar(dados, resticoes);
		expect(resultado).toHaveLength(1);
		expect(resultado[0].mensagem).toContain("faixa proibida");
	});

	it("deve detectar múltiplas violações", () => {
		const dados = {
			vazaoTurbinada: 100,
			vazaoDefluente: 120,
			vazaoVertida: 20,
			vazaoAfluente: 150,
			nivelReservatorio: 556,
			geracaoMW: 450,
		};

		const resticoes = [
			{
				cdTpRestricao: 19,
				dsRestricao: "Nível Mínimo (m)",
				dsVarRef: "nivelReservatorio",
				vlRestricao: 557,
			},
			{
				cdTpRestricao: 23,
				dsRestricao: "Geração Máxima (MW)",
				dsVarRef: "geracaoRef",
				vlRestricao: 424,
			},
		];

		const resultado = validador.validar(dados, resticoes);
		expect(resultado).toHaveLength(2);
	});
});
