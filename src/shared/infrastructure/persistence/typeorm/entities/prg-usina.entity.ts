import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "PRG_USINA" })
export class PrgUsinaEntity {
	@PrimaryColumn({ name: "CD_USINA", type: "varchar", length: 10 })
	cdUsina: string;

	@Column({ name: "NM_USINA", type: "varchar", length: 400 })
	nmUsina: string;

	@Column({ name: "CD_TIPO_USINA", type: "int" })
	cdTipoUsina: number;

	@Column({ name: "FL_USINA_ENGIE", type: "int" })
	flUsinaEngie: number;

	@Column({ name: "CD_SIGLA_USINA", type: "varchar", length: 40 })
	cdSiglaUsina: string;

	@Column({ name: "CD_GRP_USINA", type: "varchar", length: 2 })
	cdGrpUsina: string;

	@Column({ name: "NR_ORD_USINA", type: "int" })
	nrOrdUsina: number;

	@Column({ name: "FL_USINA_ATV", type: "int" })
	flUsinaAtv: number;
}
