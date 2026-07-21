import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalculationModule } from "@modules/calculation/calculation.module";
import { CommandModule } from "@modules/command/command.module";
import { QueryModule } from "@modules/query/query.module";
import { UsinaModule } from "@modules/usina/usina.module";
import { RestrictionModule } from "@modules/restriction/restriction.module";
import {
	PrgProgramacaoEntity,
	PrgDadosProgramacaoEntity,
	PrgUsinaEntity,
	PrgOutboxEntity,
	PrgProdutibilidadeEntity,
	PrgRestricaoUsinaEntity,
	PrgTiposRestricaoEntity,
	PrgHistoriadorEntity,
	PrgDadosHistoriadorEntity,
	PrgCurvaCotaVolEntity,
	PrgRelacUsinasEntity,
	PrgParametrosEntity,
} from "@shared/infrastructure/persistence/typeorm/entities";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: "oracle",
				host: config.getOrThrow("DB_HOST"),
				port: config.getOrThrow("DB_PORT"),
				username: config.getOrThrow("DB_USERNAME"),
				password: config.getOrThrow("DB_PASSWORD"),
				serviceName: config.getOrThrow("DB_NAME"),
				schema: config.getOrThrow("DB_SCHEMA"),
				entities: [
					PrgProgramacaoEntity,
					PrgDadosProgramacaoEntity,
					PrgUsinaEntity,
					PrgOutboxEntity,
					PrgProdutibilidadeEntity,
					PrgRestricaoUsinaEntity,
					PrgTiposRestricaoEntity,
					PrgHistoriadorEntity,
					PrgDadosHistoriadorEntity,
					PrgCurvaCotaVolEntity,
					PrgRelacUsinasEntity,
					PrgParametrosEntity,
				],
				synchronize: false,
				logging: config.get("NODE_ENV") === "development",
			}),
		}),
		CalculationModule,
		QueryModule,
		UsinaModule,
		CommandModule,
		RestrictionModule,
	],
})
export class AppModule {}
