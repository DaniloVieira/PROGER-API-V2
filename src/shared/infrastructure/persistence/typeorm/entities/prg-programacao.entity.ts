import {
	Entity,
	PrimaryColumn,
	Column,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from "typeorm";
import { PrgUsinaEntity } from "./prg-usina.entity";
import { PrgDadosProgramacaoEntity } from "./prg-dados-programacao.entity";

@Entity({ name: "PRG_PROGRAMACAO" })
export class PrgProgramacaoEntity {
	@PrimaryColumn({
		name: "CD_PROGRAMACAO",
		type: "numeric",
		precision: 15,
		scale: 0,
	})
	cdProgramacao: number;

	@Column({ name: "CD_USINA", type: "varchar", length: 10 })
	cdUsina: string;

	@Column({ name: "DT_PROGRAMACAO", type: "date" })
	dtProgramacao: Date;

	@Column({ name: "NM_USUARIO", type: "varchar", length: 400 })
	nmUsuario: string;

	@Column({ name: "DT_ALTERACAO", type: "date" })
	dtAlteracao: Date;

	@Column({
		name: "DS_COMENTARIO",
		type: "varchar",
		length: 4000,
		nullable: true,
	})
	dsComentario: string | null;

	@Column({ name: "DT_ULTIMA_CONCILIACAO", type: "date", nullable: true })
	dtUltimaConciliacao: Date | null;

	@Column({ name: "DT_PUBLICACAO", type: "date", nullable: true })
	dtPublicacao: Date | null;

	@Column({
		name: "NM_USUARIO_PUBLICACAO",
		type: "varchar",
		length: 400,
		nullable: true,
	})
	nmUsuarioPublicacao: string | null;

	@Column({
		name: "CD_USUARIO_PROGRAMACAO",
		type: "varchar",
		length: 400,
		nullable: true,
	})
	cdUsuarioProgramacao: string | null;

	@Column({
		name: "CD_PERFIL_PROGRAMACAO",
		type: "varchar",
		length: 400,
		nullable: true,
	})
	cdPerfilProgramacao: string | null;

	@Column({
		name: "DT_SOBRESCRITA_DADOS_PROGRAMADOR",
		type: "date",
		nullable: true,
	})
	dtSobrescritaDadosProgramador: Date | null;

	@Column({ name: "DT_NOTIFICADO_SOBRESCRITA", type: "date", nullable: true })
	dtNotificadoSobrescrita: Date | null;

	@Column({
		name: "DS_OBSERVACAO",
		type: "varchar",
		length: 4000,
		nullable: true,
	})
	dsObservacao: string | null;

	@ManyToOne(
		() => PrgUsinaEntity,
		(usina) => usina.cdUsina,
		{ createForeignKeyConstraints: false },
	)
	@JoinColumn({ name: "CD_USINA", referencedColumnName: "cdUsina" })
	usina: PrgUsinaEntity;

	@OneToMany(
		() => PrgDadosProgramacaoEntity,
		(dados) => dados.programacao,
	)
	dados: PrgDadosProgramacaoEntity[];
}
