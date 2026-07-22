import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidarRestricoesUseCase } from "./application/use-cases/validar-restricoes.use-case";
import { ValidarPainelUseCase } from "./application/use-cases/validar-painel.use-case";
import { TypeOrmRestricaoRepository } from "@shared/infrastructure/persistence/typeorm/repositories";
import {
	PrgRestricaoUsinaEntity,
	PrgTiposRestricaoEntity,
} from "@shared/infrastructure/persistence/typeorm/entities";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			PrgRestricaoUsinaEntity,
			PrgTiposRestricaoEntity,
		]),
	],
	providers: [
		ValidarRestricoesUseCase,
		ValidarPainelUseCase,
		{
			provide: "IRestricaoRepository",
			useClass: TypeOrmRestricaoRepository,
		},
	],
	exports: [ValidarRestricoesUseCase, ValidarPainelUseCase, "IRestricaoRepository"],
})
export class RestrictionModule {}
