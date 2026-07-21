import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { PrgDadosHistoriadorEntity } from "./prg-dados-historiador.entity";

@Entity({ name: "PRG_HISTORIADOR" })
export class PrgHistoriadorEntity {
	@PrimaryColumn({
		name: "CD_HISTORIADOR",
		type: "numeric",
		precision: 15,
		scale: 0,
	})
	cdHistoriador: number;

	@Column({ name: "CD_USINA", type: "varchar", length: 10 })
	cdUsina: string;

	@Column({ name: "DT_PROGRAMACAO", type: "date" })
	dtProgramacao: Date;

	@Column({ name: "DT_ULTIMA_CONCILIACAO", type: "date" })
	dtUltimaConciliacao: Date;

	@OneToMany(
		() => PrgDadosHistoriadorEntity,
		(dados) => dados.historiador,
	)
	dados: PrgDadosHistoriadorEntity[];
}
