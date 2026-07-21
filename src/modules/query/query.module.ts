import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalculationModule } from "@modules/calculation/calculation.module";
import { RestrictionModule } from "@modules/restriction/restriction.module";
import { ProgramacaoQueryController } from "./infrastructure/controllers/programacao-query.controller";
import { ListarProgramacoesHandler } from "./application/queries/listar-programacoes.query";
import { BuscarProgramacaoDadosHandler } from "./application/queries/buscar-programacao-dados.query";
import { BuscarDadosPainelHandler } from "./application/queries/buscar-dados-painel.query";
import { TypeOrmProgramacaoReadRepository } from "@shared/infrastructure/persistence/typeorm/repositories";
import {
	TypeOrmCurvaCotaVolRepository,
	TypeOrmRelacUsinasRepository,
	TypeOrmParametrosRepository,
} from "@shared/infrastructure/persistence/typeorm/repositories";
import {
	PrgProgramacaoEntity,
	PrgDadosProgramacaoEntity,
	PrgHistoriadorEntity,
	PrgDadosHistoriadorEntity,
	PrgCurvaCotaVolEntity,
	PrgRelacUsinasEntity,
	PrgParametrosEntity,
} from "@shared/infrastructure/persistence/typeorm/entities";

@Module({
	imports: [
		ConfigModule,
		CalculationModule,
		RestrictionModule,
		TypeOrmModule.forFeature([
			PrgProgramacaoEntity,
			PrgDadosProgramacaoEntity,
			PrgHistoriadorEntity,
			PrgDadosHistoriadorEntity,
			PrgCurvaCotaVolEntity,
			PrgRelacUsinasEntity,
			PrgParametrosEntity,
		]),
	],
	controllers: [ProgramacaoQueryController],
	providers: [
		ListarProgramacoesHandler,
		BuscarProgramacaoDadosHandler,
		BuscarDadosPainelHandler,
		TypeOrmCurvaCotaVolRepository,
		TypeOrmRelacUsinasRepository,
		TypeOrmParametrosRepository,
		{
			provide: "IProgramacaoReadRepository",
			useClass: TypeOrmProgramacaoReadRepository,
		},
	],
})
export class QueryModule {}
