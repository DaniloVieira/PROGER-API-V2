import { Test, type TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { ProgramacaoCommandController } from './programacao-command.controller';

describe('ProgramacaoCommandController', () => {
  let controller: ProgramacaoCommandController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramacaoCommandController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProgramacaoCommandController>(ProgramacaoCommandController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('deve chamar CommandBus com PublicarProgramacaoCommand', async () => {
    const executeSpy = jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

    const result = await controller.publicar('1', { usuarioId: 'user-123' });

    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        cdProgramacao: 1,
        usuarioId: 'user-123',
      }),
    );
    expect(result).toEqual({
      cdProgramacao: 1,
      situacao: 'PUBLICADA',
      mensagem: 'Programação publicada com sucesso.',
    });
  });
});
