import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity("PRG_RELAC_USINAS")
export class PrgRelacUsinasEntity {
	@PrimaryGeneratedColumn("increment", { name: "CD_RELAC_USINAS" })
	cdRelacUsinas!: number;

	@Column({ name: "CD_USINA_MONTANTE", length: 10, nullable: false })
	cdUsinaMontante!: string;

	@Column({ name: "CD_USINA_REFERENCIA", length: 10, nullable: false })
	cdUsinaReferencia!: string;

	@Column({ name: "VL_TMP_VIAGEM_INI", type: "numeric", precision: 5, scale: 2, nullable: false })
	vlTmpViagemIni!: number;

	@Column({ name: "VL_TMP_VIAGEM_FIM", type: "numeric", precision: 5, scale: 2, nullable: false })
	vlTmpViagemFim!: number;
}
