import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalculoHidraulicoService } from "./domain/services/calculo-hidraulico.service";
import { TypeOrmProdutibilidadeRepository } from "@shared/infrastructure/persistence/typeorm/repositories";
import { PrgProdutibilidadeEntity } from "@shared/infrastructure/persistence/typeorm/entities";
import { CalcularProgramacaoHidraulicoUseCase } from "./application/use-cases/calcular-programacao-hidraulico.use-case";

@Module({
	imports: [TypeOrmModule.forFeature([PrgProdutibilidadeEntity])],
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
	],
	exports: [
		"ICalculoHidraulicoService",
		"IProdutibilidadeRepository",
		CalcularProgramacaoHidraulicoUseCase,
	],
})
export class CalculationModule {}
