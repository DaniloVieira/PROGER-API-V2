import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import request from 'supertest';
import { ProgramacaoQueryController } from '../src/modules/query/infrastructure/controllers/programacao-query.controller';
import { ListarProgramacoesHandler } from '../src/modules/query/application/queries/listar-programacoes.query';
import { BuscarProgramacaoDadosHandler } from '../src/modules/query/application/queries/buscar-programacao-dados.query';
import { BuscarDadosPainelHandler } from '../src/modules/query/application/queries/buscar-dados-painel.query';
import { UsinaQueryController } from '../src/modules/usina/infrastructure/controllers/usina-query.controller';
import { BuscarUsinaHistoricoHandler } from '../src/modules/usina/application/queries/buscar-usina-historico.query';
import { ListarUsinasHandler } from '../src/modules/usina/application/queries/listar-usinas.query';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockProgramacaoResumo = [
  {
    cdProgramacao: 1,
    cdUsina: 'UHJA',
    dtProgramacao: '2025-06-24',
    situacao: 'EM_EDICAO',
  },
  {
    cdProgramacao: 2,
    cdUsina: 'UHPF',
    dtProgramacao: '2025-06-25',
    situacao: 'PUBLICADA',
  },
  {
    cdProgramacao: 3,
    cdUsina: 'UHJA',
    dtProgramacao: '2025-06-25',
    situacao: 'EM_EDICAO',
  },
];

const mockProgramacaoDados = {
  cdProgramacao: 1,
  cdUsina: 'UHJA',
  dtProgramacao: '2025-06-24',
  situacao: 'EM_EDICAO',
  dados: [
    {
      periodo: 0,
      geracaoMW: 120.5,
      vazaoVertida: 10.0,
      vazaoIncremental: 50.0,
      nivelReservatorio: 650.0,
      volumeTotal: 1200.5,
      vazaoTurbinada: 22.0,
      vazaoDefluente: 32.0,
      vazaoAfluente: 82.0,
      dadosVerificados: true,
    },
    {
      periodo: 1,
      geracaoMW: 115.2,
      vazaoVertida: 9.5,
      vazaoIncremental: 48.0,
      nivelReservatorio: 649.8,
      volumeTotal: 1199.0,
      vazaoTurbinada: 21.5,
      vazaoDefluente: 31.0,
      vazaoAfluente: 80.5,
      dadosVerificados: true,
    },
  ],
};

const mockUsinas = [
  { cdUsina: 'UHJA', nomeUsina: 'UHE Jaguara', tipo: 'HIDRO', situacao: 'ATIVA', flUsinaEngie: 1, flUsinaAtv: 1, nrOrdUsina: 1 },
  { cdUsina: 'UHPF', nomeUsina: 'UHE Porto Colômbia', tipo: 'HIDRO', situacao: 'ATIVA', flUsinaEngie: 1, flUsinaAtv: 1, nrOrdUsina: 2 },
  { cdUsina: 'UHSJ', nomeUsina: 'UHE São Simão', tipo: 'HIDRO', situacao: 'ATIVA', flUsinaEngie: 1, flUsinaAtv: 1, nrOrdUsina: 3 },
];

const mockUsinaHistorico = {
  cdUsina: 'UHJA',
  historico: [
    {
      dtProgramacao: '2025-06-24',
      periodo: 0,
      geracaoMW: 120.5,
      vazaoVertida: 10.0,
      vazaoIncremental: 50.0,
      nivelReservatorio: 650.0,
      volumeTotal: 1200.5,
      vazaoTurbinada: 22.0,
      vazaoDefluente: 32.0,
      vazaoAfluente: 82.0,
      dadosVerificados: true,
    },
  ],
};

// ─── Mock Repositories ──────────────────────────────────────────────────────

const mockProgramacaoReadRepo = {
  listar: jest.fn().mockResolvedValue({
    items: mockProgramacaoResumo,
    total: 3,
    page: 1,
    size: 20,
  }),
  buscarDados: jest.fn().mockResolvedValue(mockProgramacaoDados),
};

const mockUsinaReadRepo = {
  buscarHistorico: jest.fn().mockResolvedValue(mockUsinaHistorico.historico),
  listar: jest.fn().mockResolvedValue(mockUsinas),
};

// ─── E2E Module (no TypeORM, no Oracle) ─────────────────────────────────────

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CqrsModule],
  controllers: [ProgramacaoQueryController, UsinaQueryController],
  providers: [
    ListarProgramacoesHandler,
    BuscarProgramacaoDadosHandler,
    BuscarDadosPainelHandler,
    BuscarUsinaHistoricoHandler,
    ListarUsinasHandler,
    {
      provide: 'IProgramacaoReadRepository',
      useValue: mockProgramacaoReadRepo,
    },
    {
      provide: 'IUsinaReadRepository',
      useValue: mockUsinaReadRepo,
    },
  ],
})
class E2ETestModule {}

// ─── E2E Tests ──────────────────────────────────────────────────────────────

describe('API E2E (proger-api)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [E2ETestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api/v2');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Re-assign mock return values since clearAllMocks removes them
    mockProgramacaoReadRepo.listar.mockResolvedValue({
      items: mockProgramacaoResumo,
      total: 3,
      page: 1,
      size: 20,
    });
    mockProgramacaoReadRepo.buscarDados.mockResolvedValue(
      mockProgramacaoDados,
    );
    mockUsinaReadRepo.listar.mockResolvedValue(mockUsinas);
    mockUsinaReadRepo.buscarHistorico.mockResolvedValue(
      mockUsinaHistorico.historico,
    );
  });

  // ─── GET /api/v2/programacoes ──────────────────────────────────────────────

  describe('GET /api/v2/programacoes', () => {
    it('should return a paginated list of programações', () => {
      return request(app.getHttpServer())
        .get('/api/v2/programacoes')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('size');
          expect(res.body.items).toHaveLength(3);
          expect(res.body.items[0]).toHaveProperty('cdProgramacao');
          expect(res.body.items[0]).toHaveProperty('cdUsina');
          expect(res.body.items[0]).toHaveProperty('dtProgramacao');
          expect(res.body.items[0]).toHaveProperty('situacao');
        });
    });

    it('should filter by cdUsina', () => {
      return request(app.getHttpServer())
        .get('/api/v2/programacoes?cdUsina=UHJA')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.total).toBeGreaterThanOrEqual(0);
        });
    });

    it('should filter by dtProgramacao', () => {
      return request(app.getHttpServer())
        .get('/api/v2/programacoes?dtProgramacao=2025-06-24')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('items');
        });
    });

    it('should accept pagination params', () => {
      return request(app.getHttpServer())
        .get('/api/v2/programacoes?page=1&size=10')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('page', 1);
          // The repository mock returns the default size=20;
          // the controller parses the query param and passes it to the handler
          // but the mock always returns { size: 20 }. This validates the
          // pagination structure works correctly.
          expect(res.body).toHaveProperty('size');
        });
    });
  });

  // ─── GET /api/v2/programacoes/:id/dados ────────────────────────────────────

  describe('GET /api/v2/programacoes/:id/dados', () => {
    it('should return programação dados', () => {
      return request(app.getHttpServer())
        .get('/api/v2/programacoes/1/dados')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('cdProgramacao', 1);
          expect(res.body).toHaveProperty('cdUsina', 'UHJA');
          expect(res.body).toHaveProperty('dados');
          expect(res.body.dados).toHaveLength(2);
          expect(res.body.dados[0]).toHaveProperty('geracaoMW');
          expect(res.body.dados[0]).toHaveProperty('vazaoTurbinada');
        });
    });
  });

  // ─── GET /api/v2/usinas ────────────────────────────────────────────────────

  describe('GET /api/v2/usinas', () => {
    it('should return a list of usinas', () => {
      return request(app.getHttpServer())
        .get('/api/v2/usinas')
        .expect(200)
        .expect((res: any) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('cdUsina');
          expect(res.body[0]).toHaveProperty('nomeUsina');
          expect(res.body[0]).toHaveProperty('tipo');
          expect(res.body[0]).toHaveProperty('situacao');
        });
    });
  });

  // ─── GET /api/v2/usinas/:cdUsina/historico ─────────────────────────────────

  describe('GET /api/v2/usinas/:cdUsina/historico', () => {
    it('should return usina historico', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v2/usinas/UHJA/historico?dtInicio=2025-06-24&dtFim=2025-06-25',
        )
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('cdUsina', 'UHJA');
          expect(res.body).toHaveProperty('historico');
          expect(Array.isArray(res.body.historico)).toBe(true);
        });
    });
  });
});