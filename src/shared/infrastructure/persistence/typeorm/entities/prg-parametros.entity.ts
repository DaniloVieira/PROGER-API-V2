import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity("PRG_PARAMETROS")
export class PrgParametrosEntity {
	@PrimaryGeneratedColumn("increment", { name: "CD_PARAM" })
	cdParam!: number;

	@Column({ name: "CD_USINA", length: 10, nullable: false })
	cdUsina!: string;

	@Column({ name: "NM_PARAMETRO", length: 40, nullable: false })
	nmParametro!: string;

	@Column({ name: "VL_PARAMETRO", length: 4000, nullable: false })
	vlParametro!: string;

	@Column({ name: "CD_USUARIO_PROGRAMACAO", length: 200, nullable: true })
	cdUsuarioProgramacao?: string;

	@Column({ name: "TIPO", length: 20, nullable: true })
	tipo?: string;

	@Column({ name: "CD_PERFIL_PROGRAMACAO", length: 200, nullable: true })
	cdPerfilProgramacao?: string;
}
