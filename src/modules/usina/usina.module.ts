import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsinaQueryController } from "./infrastructure/controllers/usina-query.controller";
import { BuscarUsinaHistoricoHandler } from "./application/queries/buscar-usina-historico.query";
import { ListarUsinasHandler } from "./application/queries/listar-usinas.query";
import { TypeOrmUsinaReadRepository } from "@shared/infrastructure/persistence/typeorm/repositories";
import {
	PrgUsinaEntity,
	PrgDadosProgramacaoEntity,
} from "@shared/infrastructure/persistence/typeorm/entities";

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([PrgUsinaEntity, PrgDadosProgramacaoEntity]),
	],
	controllers: [UsinaQueryController],
	providers: [
		BuscarUsinaHistoricoHandler,
		ListarUsinasHandler,
		{
			provide: "IUsinaReadRepository",
			useClass: TypeOrmUsinaReadRepository,
		},
	],
})
export class UsinaModule {}
