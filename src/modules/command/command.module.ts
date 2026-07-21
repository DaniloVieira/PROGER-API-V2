import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProgramacaoCommandController } from "./infrastructure/controllers/programacao-command.controller";
import { PublicarProgramacaoHandler } from "./application/commands/publicar-programacao.command";
import { OutboxPublisher } from "./infrastructure/outbox/outbox-publisher.service";
import {
	TypeOrmProgramacaoWriteRepository,
	TypeOrmOutboxRepository,
} from "@shared/infrastructure/persistence/typeorm/repositories";
import {
	PrgProgramacaoEntity,
	PrgDadosProgramacaoEntity,
	PrgOutboxEntity,
} from "@shared/infrastructure/persistence/typeorm/entities";

@Module({
	imports: [
		CqrsModule,
		ConfigModule,
		TypeOrmModule.forFeature([
			PrgProgramacaoEntity,
			PrgDadosProgramacaoEntity,
			PrgOutboxEntity,
		]),
	],
	controllers: [ProgramacaoCommandController],
	providers: [
		PublicarProgramacaoHandler,
		OutboxPublisher,
		{
			provide: "IProgramacaoWriteRepository",
			useClass: TypeOrmProgramacaoWriteRepository,
		},
		{
			provide: "IOutboxRepository",
			useClass: TypeOrmOutboxRepository,
		},
	],
})
export class CommandModule {}
