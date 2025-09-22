// controller http para proyecciones sin acentos ni punto final
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { GenerateProjectionWithOfferUseCase } from '../application/use-cases/generate-projection-with-offer.usecase';
import { GenerateProjectionUseCase } from '../application/use-cases/generate-projection.usecase';
import { GenerateProjectionOptionsUseCase } from '../application/use-cases/generate-projection-options.usecase';
import { ProjectionRepository } from '../infra/db/projection.repository';

export class GenerarProyeccionDto {
  @IsString() @IsNotEmpty() rut!: string;
  @IsString() @IsNotEmpty() codCarrera!: string;
  @IsString() @IsNotEmpty() catalogo!: string;
  @Type(() => Number) @IsNumber() @Min(1) topeCreditos!: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) nivelObjetivo?: number;
  @IsOptional() @Type(() => String) prioritarios?: string[];
}

export class GuardarProyeccionDto extends GenerarProyeccionDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsBoolean() favorite?: boolean;
}

export class GenerarConOfertaDto extends GenerarProyeccionDto {
  @IsString() @IsNotEmpty() period!: string;
}

class FavoritaDto {
  @IsString() @IsNotEmpty() rut!: string;
}

@ApiTags('proyecciones')
@Controller('proyecciones')
export class ProjectionsController {
  constructor(
    private readonly usecase: GenerateProjectionUseCase,
    private readonly repo: ProjectionRepository,
    private readonly usecaseOffer: GenerateProjectionWithOfferUseCase,
    private readonly usecaseOptions: GenerateProjectionOptionsUseCase,
  ) {}

  @Post('generar')
  @ApiOperation({ summary: 'Generar proyeccion sin oferta' })
  @ApiBody({ type: GenerarProyeccionDto })
  generar(@Body() dto: GenerarProyeccionDto) {
    return this.usecase.exec(dto);
  }

  @Post('generar-con-oferta')
  @ApiOperation({ summary: 'Generar proyeccion seleccionando NRCs de oferta' })
  @ApiBody({ type: GenerarConOfertaDto })
  generarConOferta(@Body() dto: GenerarConOfertaDto) {
    return this.usecaseOffer.exec(dto);
  }

  @Post('generar-opciones')
  @ApiOperation({ summary: 'Generar varias opciones de proyeccion (sin oferta)' })
  @ApiBody({ type: GenerarProyeccionDto })
  generarOpciones(@Body() dto: GenerarProyeccionDto & { maxOptions?: number }) {
    return this.usecaseOptions.exec(dto);
  }

  @Post('guardar')
  @ApiOperation({ summary: 'Generar y guardar proyeccion' })
  @ApiBody({ type: GuardarProyeccionDto })
  async guardar(@Body() dto: GuardarProyeccionDto) {
    const result = await this.usecase.exec(dto);
    return this.repo.createAndMaybeFavorite({
      rut: dto.rut,
      codCarrera: dto.codCarrera,
      catalogo: dto.catalogo,
      nombre: dto.nombre,
      favorite: dto.favorite,
      totalCreditos: result.totalCreditos,
      items: result.seleccion.map((x) => ({
        codigo: x.codigo,
        asignatura: x.asignatura,
        creditos: x.creditos,
        nivel: x.nivel,
        motivo: x.motivo,
        nrc: x.nrc, // ya tipado en ProjectionCourse
      })),
    });
  }

  @Get('mias')
  @ApiOperation({ summary: 'Listar mis proyecciones' })
  @ApiQuery({ name: 'rut', required: true })
  listar(@Query('rut') rut: string) {
    return this.repo.listByRut(rut);
  }

  @Patch('favorita/:id')
  @ApiOperation({ summary: 'Marcar proyeccion favorita' })
  async favorita(@Param('id') id: string, @Body() body: FavoritaDto) {
    await this.repo.setFavorite(body.rut, id);
    return { ok: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar proyeccion' })
  async borrar(@Param('id') id: string, @Query('rut') rut: string) {
    await this.repo.delete(rut, id);
    return { ok: true };
  }

  @Patch(':id/nombre')
  @ApiOperation({ summary: 'Renombrar proyeccion' })
  async renombrar(
    @Param('id') id: string,
    @Body() body: { rut: string; nombre: string },
  ) {
    await this.repo.updateName(body.rut, id, body.nombre);
    return { ok: true };
  }

  @Post('guardar-directo')
  @ApiOperation({ summary: 'Guardar proyeccion desde items ya calculados' })
  @ApiBody({ description: 'Recibe items tal cual para persistir' })
  async guardarDirecto(
    @Body()
    body: {
      rut: string;
      codCarrera: string;
      catalogo: string;
      nombre?: string;
      favorite?: boolean;
      totalCreditos: number;
      items: Array<{
        codigo: string;
        asignatura: string;
        creditos: number;
        nivel: number;
        motivo: 'REPROBADO' | 'PENDIENTE';
        nrc?: string;
      }>;
    },
  ) {
    return this.repo.createAndMaybeFavorite(body);
  }

  @Get('demanda/agregada')
  @ApiOperation({ summary: 'Demanda agregada por codigo o nrc de favoritas' })
  @ApiQuery({ name: 'codCarrera', required: false })
  @ApiQuery({
    name: 'por',
    required: false,
    description: 'usar "nrc" para agrupar por nrc',
  })
  demanda(
    @Query('codCarrera') codCarrera?: string,
    @Query('por') por?: string,
  ) {
    return this.repo.demandByCourse(codCarrera, por === 'nrc');
  }
}
