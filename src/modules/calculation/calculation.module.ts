import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalculoHidraulicoService } from "./domain/services/calculo-hidraulico.service";
import { TypeOrmProdutibilidadeRepository } from "@shared/infrastructure/persistence/typeorm/repositories";
import { PrgProdutibilidadeEntity } from "@shared/infrastructure/persistence/typeorm/entities";
import { CalcularProgramacaoHidraulicoUseCase } from "./application/use-cases/calcular-programacao-hidraulico.use-case";
import { CalcularHidraulicoBatchUseCase } from "./application/use-cases/calcular-hidraulico-batch.use-case";
import { CalculoHidraulicoController } from "./infrastructure/controllers/calculo-hidraulico.controller";
import { RestrictionModule } from "@modules/restriction/restriction.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([PrgProdutibilidadeEntity]),
		RestrictionModule,
	],
	controllers: [CalculoHidraulicoController],
	providers: [
		{
			provide: "ICalculoHidraulicoService",
			useClass: CalculoHidraulicoService,
		},
		{
			provide: "IProdutibilidadeRepository",
			useClass: TypeOrmProdutibilidadeRepository,
		},
		CalcularProgramacaoHidraulicoUseCase,
		CalcularHidraulicoBatchUseCase,
	],
	exports: [
		"ICalculoHidraulicoService",
		"IProdutibilidadeRepository",
		CalcularProgramacaoHidraulicoUseCase,
		CalcularHidraulicoBatchUseCase,
	],
})
export class CalculationModule {}
