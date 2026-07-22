import { ApiProperty } from "@nestjs/swagger";
import {
	IsString,
	IsNumber,
	IsArray,
	ValidateNested,
	IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class CurvaCotaVolumeItemDto {
	@ApiProperty({ example: 557.61 })
	@IsNumber()
	@Type(() => Number)
	cota!: number;

	@ApiProperty({ example: 1200.5 })
	@IsNumber()
	@Type(() => Number)
	volume!: number;
}

class CalcularHidraulicoPeriodoRequestDto {
	@ApiProperty({ example: 0, description: "Período (0-47)" })
	@IsNumber()
	@Type(() => Number)
	periodo!: number;

	@ApiProperty({ example: 120.5 })
	@IsNumber()
	@Type(() => Number)
	geracaoMW!: number;

	@ApiProperty({ example: 10.0 })
	@IsNumber()
	@Type(() => Number)
	vazaoVertida!: number;

	@ApiProperty({ example: 50.0 })
	@IsNumber()
	@Type(() => Number)
	vazaoIncremental!: number;

	@ApiProperty({
		example: [10.0, 20.0],
		required: false,
		description: "Vazões defluentes das usinas a montante (m³/s)",
	})
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	@Type(() => Number)
	vazoesMontantes?: number[];
}

class CalcularHidraulicoPeriodoResponseDto {
	@ApiProperty({ example: 0 })
	periodo!: number;

	@ApiProperty({ example: 22.0 })
	vazaoTurbinada!: number;

	@ApiProperty({ example: 32.0 })
	vazaoDefluente!: number;

	@ApiProperty({ example: 82.0 })
	vazaoAfluente!: number;

	@ApiProperty({ example: 1201.2 })
	volumeTotalHm3!: number;

	@ApiProperty({ example: 557.62 })
	nivelReservatorio!: number;

	@ApiProperty({
		example: 200.0,
		required: false,
		description: "Disponibilidade de geração (MW)",
	})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	disponivel?: number;
}

class AlertaRestricaoItemDto {
	@ApiProperty({ example: 22 })
	cdTpRestricao!: number;

	@ApiProperty({ example: "Geração Mínima (MW)" })
	descricao!: string;
}

class AlertasRestricoesPainelDto {
	@ApiProperty({ type: [AlertaRestricaoItemDto] })
	geracao!: AlertaRestricaoItemDto[];

	@ApiProperty({ type: [AlertaRestricaoItemDto] })
	hidrico!: AlertaRestricaoItemDto[];

	@ApiProperty({ type: [AlertaRestricaoItemDto] })
	nivel!: AlertaRestricaoItemDto[];
}

export class CalcularHidraulicoRequestDto {
	@ApiProperty({ example: "UHJA" })
	@IsString()
	cdUsina!: string;

	@ApiProperty({
		example: 0.0026,
		description: "Coeficiente de conversão minuto para hm³",
	})
	@IsNumber()
	@Type(() => Number)
	coefConvMin!: number;

	@ApiProperty({
		example: 1200.5,
		description: "Volume inicial do reservatório (hm³)",
	})
	@IsNumber()
	@Type(() => Number)
	volumeInicialHm3!: number;

	@ApiProperty({ type: [CurvaCotaVolumeItemDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CurvaCotaVolumeItemDto)
	curvaCotaVolume!: CurvaCotaVolumeItemDto[];

	@ApiProperty({
		type: [CalcularHidraulicoPeriodoRequestDto],
		description: "Array de períodos (tipicamente 48)",
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CalcularHidraulicoPeriodoRequestDto)
	periodos!: CalcularHidraulicoPeriodoRequestDto[];
}

export class CalcularHidraulicoResponseDto {
	@ApiProperty({ example: "UHJA" })
	cdUsina!: string;

	@ApiProperty({ type: [CalcularHidraulicoPeriodoResponseDto] })
	periodos!: CalcularHidraulicoPeriodoResponseDto[];

	@ApiProperty({ type: AlertasRestricoesPainelDto })
	alertas!: AlertasRestricoesPainelDto;
}
