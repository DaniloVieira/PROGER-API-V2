import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { IProgramacaoWriteRepository } from '../../domain/ports/programacao-write-repository.port';
import { Programacao, SituacaoProgramacao } from '../../domain/entities/programacao.entity';
import { DomainException } from '@shared/domain/domain.exception';

export class EditarDadosProgramacaoItemDto {
  @ApiProperty({ example: 0, description: 'Período (0-47)' })
  @IsNumber()
  @Type(() => Number)
  periodo!: number;

  @ApiProperty({ example: 120.5, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  geracaoMW?: number;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vazaoVertida?: number;

  @ApiProperty({ example: 50.0, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vazaoIncremental?: number;
}

export class EditarDadosProgramacaoRequestDto {
  @ApiProperty({ type: [EditarDadosProgramacaoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditarDadosProgramacaoItemDto)
  dados!: EditarDadosProgramacaoItemDto[];

  @ApiProperty({ description: 'Data da última alteração para controle de concorrência (optimistic locking)', example: '2025-06-24T12:00:00.000Z', required: false })
  @IsOptional()
  @IsString()
  dtAlteracao?: string;
}

export class EditarDadosProgramacaoResponseDto {
  @ApiProperty({ example: 1 })
  cdProgramacao!: number;

  @ApiProperty({ example: 'EM_EDICAO' })
  situacao!: string;

  @ApiProperty({ example: 'Dados atualizados com sucesso.' })
  mensagem!: string;
}

export class EditarDadosProgramacaoCommand {
  constructor(
    public readonly cdProgramacao: number,
    public readonly dados: Array<{ periodo: number; geracaoMW?: number; vazaoVertida?: number; vazaoIncremental?: number }>,
    public readonly dtAlteracao?: string,
  ) {}
}

@Injectable()
@CommandHandler(EditarDadosProgramacaoCommand)
export class EditarDadosProgramacaoHandler implements ICommandHandler<EditarDadosProgramacaoCommand> {
  constructor(
    @Inject('IProgramacaoWriteRepository')
    private readonly programacaoRepo: IProgramacaoWriteRepository,
  ) {}

  async execute(command: EditarDadosProgramacaoCommand): Promise<void> {
    const programacao = await this.programacaoRepo.buscarPorId(command.cdProgramacao);

    if (!programacao) {
      throw new DomainException(`Programação ${command.cdProgramacao} não encontrada.`);
    }

    if (programacao.situacao !== SituacaoProgramacao.EM_EDICAO) {
      throw new DomainException(`Somente programação em edição pode ser alterada. Situação atual: ${programacao.situacao}`);
    }

    await this.programacaoRepo.atualizarDados(command.cdProgramacao, command.dados, command.dtAlteracao);
  }
}
