import { DataSource, getMetadataArgsStorage } from "typeorm";
import { PrgProgramacaoEntity } from "../entities/prg-programacao.entity";
import { PrgDadosProgramacaoEntity } from "../entities/prg-dados-programacao.entity";
import { PrgUsinaEntity } from "../entities/prg-usina.entity";
import { PrgOutboxEntity } from "../entities/prg-outbox.entity";

function patchTimestampToDatetime(): void {
	const storage = getMetadataArgsStorage();
	for (const column of storage.columns) {
		if (column.options?.type === "timestamp") {
			(column.options as Record<string, unknown>).type = "datetime";
		}
	}
}

export async function createTestDataSource(): Promise<DataSource> {
	patchTimestampToDatetime();

	const ds = new DataSource({
		type: "sqlite",
		database: ":memory:",
		entities: [
			PrgProgramacaoEntity,
			PrgDadosProgramacaoEntity,
			PrgUsinaEntity,
			PrgOutboxEntity,
		],
		synchronize: true,
		logging: false,
	});

	await ds.initialize();
	return ds;
}

export async function closeTestDataSource(ds: DataSource): Promise<void> {
	if (ds.isInitialized) {
		await ds.destroy();
	}
}
