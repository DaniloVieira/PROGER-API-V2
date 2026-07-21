import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("PRG_PRODUTIBILIDADE")
export class PrgProdutibilidadeEntity {
	@PrimaryGeneratedColumn("increment", { name: "CD_PRODUTIBILIDADE" })
	cdProdutibilidade!: number;

	@Column({ name: "CD_USINA", length: 100, nullable: false })
	cdUsina!: string;

	@Column({
		name: "VL_PRODUTIBILIDADE",
		type: "decimal",
		precision: 38,
		scale: 17,
		nullable: false,
	})
	vlProdutibilidade!: number;

	@Column({
		name: "VL_PRODUTIBILIDADE_MANUAL",
		type: "decimal",
		precision: 38,
		scale: 17,
		nullable: true,
	})
	vlProdutibilidadeManual?: number;

	@CreateDateColumn({ name: "DT_CRIACAO" })
	dtCriacao!: Date;

	@UpdateDateColumn({ name: "DT_UPDATE", nullable: true })
	dtUpdate?: Date;

	@Column({ name: "DS_CRITERIO", length: 100, nullable: false })
	dsCriterio!: string;

	@Column({ name: "CD_USUARIO_PROGRAMACAO", length: 100, nullable: true })
	cdUsuarioProgramacao?: string;

	@Column({ name: "CD_PERFIL_PROGRAMACAO", length: 100, nullable: true })
	cdPerfilProgramacao?: string;
}
