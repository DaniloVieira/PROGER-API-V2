import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PrgProgramacaoEntity } from "./prg-programacao.entity";

@Entity({ name: "PRG_DADOS_PROGRAMACAO" })
export class PrgDadosProgramacaoEntity {
	@PrimaryColumn({
		name: "CD_DADOS_PROG",
		type: "numeric",
		precision: 15,
		scale: 0,
	})
	cdDadosProg: number;

	@Column({ name: "CD_PROGRAMACAO", type: "numeric", precision: 15, scale: 0 })
	cdProgramacao: number;

	@Column({ name: "CD_USINA", type: "varchar", length: 10 })
	cdUsina: string;

	@Column({ name: "DT_PROGRAMACAO", type: "date" })
	dtProgramacao: Date;

	@Column({ name: "NR_GERACAO", type: "numeric", precision: 6, scale: 0 })
	nrGeracao: number;

	@Column({ name: "NR_VAZAO_INCR", type: "numeric", precision: 6, scale: 0 })
	nrVazaoIncr: number;

	@Column({ name: "NR_VAZAO_VERTIDA", type: "numeric", precision: 6, scale: 0 })
	nrVazaoVertida: number;

	@Column({
		name: "NR_VAZAO_DEFLUENTE",
		type: "numeric",
		precision: 6,
		scale: 0,
	})
	nrVazaoDefluente: number;

	@Column({
		name: "NR_VAZAO_AFLUENTE",
		type: "numeric",
		precision: 6,
		scale: 0,
	})
	nrVazaoAfluente: number;

	@Column({ name: "NR_VAZAO_TURB", type: "numeric", precision: 6, scale: 0 })
	nrVazaoTurb: number;

	@Column({ name: "VL_VOLUME", type: "numeric", precision: 17, scale: 7 })
	vlVolume: number;

	@Column({ name: "VL_NIVEL_RES", type: "numeric", precision: 10, scale: 2 })
	vlNivelRes: number;

	@Column({ name: "NR_DISPONIVEL", type: "numeric", precision: 6, scale: 0 })
	nrDisponivel: number;

	@Column({ name: "FL_GER_MANUAL", type: "numeric", precision: 1, scale: 0 })
	flGerManual: number;

	@Column({
		name: "NR_GERACAO_ONS",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrGeracaoOns: number | null;

	@Column({
		name: "NR_VAZAO_DEFL_ONS",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoDeflOns: number | null;

	@Column({
		name: "NR_VAZAO_AFL_ONS",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoAflOns: number | null;

	@Column({
		name: "NR_VAZAO_TURB_ONS",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoTurbOns: number | null;

	@Column({
		name: "VL_VOLUME_ONS",
		type: "numeric",
		precision: 17,
		scale: 7,
		nullable: true,
	})
	vlVolumeOns: number | null;

	@Column({
		name: "VL_NIVEL_RES_ONS",
		type: "numeric",
		precision: 10,
		scale: 2,
		nullable: true,
	})
	vlNivelResOns: number | null;

	@Column({
		name: "NR_VAZAO_INCR_PREV",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoIncrPrev: number | null;

	@Column({
		name: "FL_INCR_MANUAL",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flIncrManual: number | null;

	@Column({
		name: "NR_VAZAO_VAO_LIVRE",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoVaoLivre: number | null;

	@Column({
		name: "NR_VAZAO_VAO_LIVRE_CALC",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoVaoLivreCalc: number | null;

	@Column({
		name: "FL_VAO_LIVRE_MANUAL",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flVaoLivreManual: number | null;

	@ManyToOne(
		() => PrgProgramacaoEntity,
		(programacao) => programacao.dados,
		{ createForeignKeyConstraints: false },
	)
	@JoinColumn({ name: "CD_PROGRAMACAO", referencedColumnName: "cdProgramacao" })
	programacao: PrgProgramacaoEntity;
}
