import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PrgHistoriadorEntity } from "./prg-historiador.entity";

@Entity({ name: "PRG_DADOS_HISTORIADOR" })
export class PrgDadosHistoriadorEntity {
	@PrimaryColumn({
		name: "CD_DADOS_HISTORIADOR",
		type: "numeric",
		precision: 15,
		scale: 0,
	})
	cdDadosHistoriador: number;

	@Column({ name: "CD_HISTORIADOR", type: "numeric", precision: 15, scale: 0 })
	cdHistoriador: number;

	@Column({ name: "CD_USINA", type: "varchar", length: 10 })
	cdUsina: string;

	@Column({ name: "DT_PROGRAMACAO", type: "date" })
	dtProgramacao: Date;

	@Column({ name: "NR_GERACAO_VER", type: "numeric", precision: 6, scale: 0 })
	nrGeracaoVer: number;

	@Column({ name: "NR_VAZAO_INCR_VER", type: "numeric", precision: 6, scale: 0 })
	nrVazaoIncrVer: number;

	@Column({ name: "NR_VAZAO_VERTIDA_VER", type: "numeric", precision: 6, scale: 0 })
	nrVazaoVertidaVer: number;

	@Column({ name: "NR_VAZAO_DEFL_VER", type: "numeric", precision: 6, scale: 0 })
	nrVazaoDeflVer: number;

	@Column({ name: "NR_VAZAO_AFL_VER", type: "numeric", precision: 6, scale: 0 })
	nrVazaoAflVer: number;

	@Column({ name: "NR_VAZAO_TURB_VER", type: "numeric", precision: 6, scale: 0 })
	nrVazaoTurbVer: number;

	@Column({ name: "VL_NIVEL_RESER_VER", type: "numeric", precision: 10, scale: 2 })
	vlNivelReserVer: number;

	@Column({ name: "VL_DISPONIVEL", type: "numeric", precision: 6, scale: 0 })
	vlDisponivel: number;

	@Column({ name: "DT_ALTERACAO", type: "date" })
	dtAlteracao: Date;

	@Column({ name: "NM_USUARIO", type: "varchar", length: 400 })
	nmUsuario: string;

	@Column({
		name: "NR_VAZAO_VAO_LIVRE_VER",
		type: "numeric",
		precision: 6,
		scale: 0,
		nullable: true,
	})
	nrVazaoVaoLivreVer: number | null;

	@Column({
		name: "FL_NR_VAZAO_VAO_LIVRE",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrVazaoVaoLivre: number | null;

	// Flag columns present in the real Oracle schema but absent from repo DDL.
	// Mapped as nullable to avoid runtime mismatch against legacy instances.
	@Column({
		name: "FL_NR_GERACAO_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrGeracaoVer: number | null;

	@Column({
		name: "FL_NR_VAZAO_AFL_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrVazaoAflVer: number | null;

	@Column({
		name: "FL_NR_VAZAO_DEFL_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrVazaoDeflVer: number | null;

	@Column({
		name: "FL_NR_VAZAO_INCR_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrVazaoIncrVer: number | null;

	@Column({
		name: "FL_NR_VAZAO_TURB_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrVazaoTurbVer: number | null;

	@Column({
		name: "FL_NR_VAZAO_VERTIDA_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flNrVazaoVertidaVer: number | null;

	@Column({
		name: "FL_VL_DISPONIVEL",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flVlDisponivel: number | null;

	@Column({
		name: "FL_VL_NIVEL_RESER_VER",
		type: "numeric",
		precision: 1,
		scale: 0,
		nullable: true,
	})
	flVlNivelReserVer: number | null;

	@ManyToOne(
		() => PrgHistoriadorEntity,
		(historiador) => historiador.dados,
		{ createForeignKeyConstraints: false },
	)
	@JoinColumn({ name: "CD_HISTORIADOR", referencedColumnName: "cdHistoriador" })
	historiador: PrgHistoriadorEntity;
}
