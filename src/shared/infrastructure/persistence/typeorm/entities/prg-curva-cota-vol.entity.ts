import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity("PRG_CURVA_COTA_VOL")
export class PrgCurvaCotaVolEntity {
	@PrimaryGeneratedColumn("increment", { name: "CD_COTA_VOL" })
	cdCotaVol!: number;

	@Column({ name: "CD_USINA", length: 10, nullable: false })
	cdUsina!: string;

	@Column({ name: "VL_COTA_OPR", type: "numeric", precision: 10, scale: 2, nullable: false })
	vlCotaOpr!: number;

	@Column({ name: "VL_VOLUME", type: "numeric", precision: 17, scale: 7, nullable: false })
	vlVolume!: number;

	@Column({ name: "VL_VOLUME_UTIL", type: "numeric", precision: 17, scale: 7, nullable: false })
	vlVolumeUtil!: number;

	@Column({ name: "VL_PERC_VOLUME", type: "numeric", precision: 5, scale: 2, nullable: false })
	vlPercVolume!: number;
}
