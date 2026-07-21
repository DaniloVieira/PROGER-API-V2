import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidarRestricoesUseCase } from "./application/use-cases/validar-restricoes.use-case";
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
		{
			provide: "IRestricaoRepository",
			useClass: TypeOrmRestricaoRepository,
		},
	],
	exports: [ValidarRestricoesUseCase, "IRestricaoRepository"],
})
export class RestrictionModule {}
