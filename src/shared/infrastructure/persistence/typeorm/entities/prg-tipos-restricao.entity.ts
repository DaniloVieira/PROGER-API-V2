import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("PRG_TIPOS_RESTRICAO")
export class PrgTiposRestricaoEntity {
	@PrimaryGeneratedColumn("increment", { name: "CD_TP_RESTRICAO" })
	cdTpRestricao!: number;

	@Column({ name: "DS_RESTRICAO", length: 4000, nullable: false })
	dsRestricao!: string;

	@Column({ name: "CD_TP_REGRA", nullable: false })
	cdTpRegra!: number;

	@Column({ name: "DS_VAR_REF", length: 50, nullable: false })
	dsVarRef!: string;

	@Column({ name: "DS_TP_REGRA", length: 4000, nullable: false })
	dsTpRegra!: string;

	@Column({ name: "CD_TIPO_ATRIBUTO", nullable: false })
	cdTipoAtributo!: number;
}
