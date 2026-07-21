import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("PRG_RESTRICAO_USINA")
export class PrgRestricaoUsinaEntity {
	@PrimaryGeneratedColumn("increment", { name: "CD_RESTRICAO_USINA" })
	cdRestricaoUsina!: number;

	@Column({ name: "CD_USINA", length: 10, nullable: false })
	cdUsina!: string;

	@Column({ name: "CD_TP_RESTRICAO", nullable: false })
	cdTpRestricao!: number;

	@Column({ name: "TP_VIG_RESTRICAO", nullable: false })
	tpVigRestricao!: number;

	@Column({ name: "FL_STATUS", nullable: false })
	flStatus!: number;

	@Column({
		name: "NR_PER_RESTRICAO",
		type: "decimal",
		precision: 22,
		scale: 1,
		nullable: false,
	})
	nrPerRestricao!: number;

	@Column({ name: "DT_INI_RESTRICAO", type: "date", nullable: true })
	dtIniRestricao?: Date;

	@Column({ name: "DT_FIM_RESTRICAO", type: "date", nullable: true })
	dtFimRestricao?: Date;

	@Column({
		name: "VL_RESTRICAO",
		type: "decimal",
		precision: 22,
		scale: 7,
		nullable: true,
	})
	vlRestricao?: number;

	@Column({
		name: "VL_FX_INI_REST",
		type: "decimal",
		precision: 22,
		scale: 0,
		nullable: true,
	})
	vlFxIniRest?: number;

	@Column({
		name: "VL_FX_FIM_REST",
		type: "decimal",
		precision: 22,
		scale: 0,
		nullable: true,
	})
	vlFxFimRest?: number;

	@CreateDateColumn({ name: "DT_ALTERACAO" })
	dtAlteracao!: Date;

	@Column({ name: "ARQUIVO", length: 4000, nullable: true })
	arquivo?: string;

	@Column({ name: "CD_ARQUIVO", nullable: true })
	cdArquivo?: number;

	@Column({ name: "DS_RESTRICAO", length: 4000, nullable: true })
	dsRestricao?: string;

	@CreateDateColumn({ name: "DT_CRIACAO" })
	dtCriacao!: Date;

	@Column({ name: "CD_USUARIO_PROGRAMACAO", length: 200, nullable: true })
	cdUsuarioProgramacao?: string;

	@Column({ name: "CD_PERFIL_PROGRAMACAO", length: 400, nullable: true })
	cdPerfilProgramacao?: string;
}
