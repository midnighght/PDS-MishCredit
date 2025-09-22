// controller seguro para cargar y obtener respaldos de malla y avance sin acentos ni punto final
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Course } from '../../domain/entities/course.entity';
import type { AvanceItem } from '../../domain/entities/avance.entity';
import { MallaBackupRepository } from '../db/malla-backup.repository';
import { AvanceBackupRepository } from '../db/avance-backup.repository';
import { AdminKeyGuard } from './admin-key.guard';

class MallaItemDto {
  @IsString() @IsNotEmpty() codigo!: string;
  @IsString() @IsNotEmpty() asignatura!: string;
  @IsString() @IsNotEmpty() prereq!: string;
  @Type(() => Number) creditos!: number;
  @Type(() => Number) nivel!: number;
}

class AvanceItemDto {
  @IsString() @IsNotEmpty() nrc!: string;
  @IsString() @IsNotEmpty() period!: string;
  @IsString() @IsNotEmpty() student!: string;
  @IsString() @IsNotEmpty() course!: string;
  @IsString() @IsNotEmpty() inscriptionType!: string;
  @IsString() @IsNotEmpty() status!: string;
  // excluded llega como string o boolean, se deja suelto y parser en cliente
}

class CargarMallaDto {
  @IsString() @IsNotEmpty() codCarrera!: string;
  @IsString() @IsNotEmpty() catalogo!: string;
  @IsOptional() @IsString() csv?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MallaItemDto)
  items?: MallaItemDto[];
}

class CargarAvanceDto {
  @IsString() @IsNotEmpty() rut!: string;
  @IsString() @IsNotEmpty() codCarrera!: string;
  @IsOptional() @IsString() csv?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvanceItemDto)
  items?: AvanceItemDto[];
}

function parseCsv(lines: string[]): string[][] {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(',').map((x) => x.trim()));
}

function parseMallaCsv(csv: string): Course[] {
  const rows = parseCsv(csv.split(/\r?\n/));
  if (rows.length <= 1) return [];
  const header = rows.shift()!.map((h) => h.toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const need = ['codigo', 'asignatura', 'creditos', 'nivel', 'prereq'];
  for (const k of need)
    if (idx(k) === -1) throw new Error('csv invalido: falta ' + k);
  return rows.map((r) => ({
    codigo: r[idx('codigo')],
    asignatura: r[idx('asignatura')],
    creditos: Number(r[idx('creditos')] || 0),
    nivel: Number(r[idx('nivel')] || 0),
    prereq: r[idx('prereq')] || '',
  }));
}

function parseAvanceCsv(csv: string): AvanceItem[] {
  const rows = parseCsv(csv.split(/\r?\n/));
  if (rows.length <= 1) return [];
  const header = rows.shift()!.map((h) => h.toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const need = [
    'nrc',
    'period',
    'student',
    'course',
    'excluded',
    'inscriptiontype',
    'status',
  ];
  for (const k of need)
    if (idx(k) === -1) throw new Error('csv invalido: falta ' + k);
  const b = (v: string) =>
    ['true', '1', 'si', 'yes'].includes((v || '').toLowerCase());
  return rows.map((r) => ({
    nrc: r[idx('nrc')],
    period: r[idx('period')],
    student: r[idx('student')],
    course: r[idx('course')],
    excluded: b(r[idx('excluded')]),
    inscriptionType: r[idx('inscriptiontype')],
    status: r[idx('status')],
  }));
}

@ApiTags('ucn-respaldo')
@UseGuards(AdminKeyGuard)
@Controller('ucn/respaldo')
export class UcnBackupController {
  constructor(
    private readonly mallaRepo: MallaBackupRepository,
    private readonly avanceRepo: AvanceBackupRepository,
  ) {}

  @Post('malla')
  @ApiOperation({ summary: 'Cargar respaldo de malla' })
  @ApiBody({ description: 'Enviar csv o items' })
  async cargarMalla(@Body() dto: CargarMallaDto) {
    const items: Course[] = dto.items?.length
      ? (dto.items as unknown as Course[])
      : dto.csv
        ? parseMallaCsv(dto.csv)
        : [];
    await this.mallaRepo.upsert(dto.codCarrera, dto.catalogo, items);
    return { ok: true, items: items.length };
  }

  @Get('malla/:cod/:catalogo')
  @ApiOperation({ summary: 'Obtener respaldo de malla' })
  async obtenerMalla(
    @Param('cod') cod: string,
    @Param('catalogo') catalogo: string,
  ) {
    const doc = await this.mallaRepo.get(cod, catalogo);
    return doc?.data ?? [];
  }

  @Post('avance')
  @ApiOperation({ summary: 'Cargar respaldo de avance' })
  @ApiBody({ description: 'Enviar csv o items' })
  async cargarAvance(@Body() dto: CargarAvanceDto) {
    const items: AvanceItem[] = dto.items?.length
      ? (dto.items as unknown as AvanceItem[])
      : dto.csv
        ? parseAvanceCsv(dto.csv)
        : [];
    await this.avanceRepo.upsert(dto.rut, dto.codCarrera, items);
    return { ok: true, items: items.length };
  }

  @Get('avance')
  @ApiOperation({ summary: 'Obtener respaldo de avance' })
  @ApiQuery({ name: 'rut', required: true })
  @ApiQuery({ name: 'codCarrera', required: true })
  async obtenerAvance(
    @Query('rut') rut: string,
    @Query('codCarrera') codCarrera: string,
  ) {
    const doc = await this.avanceRepo.get(rut, codCarrera);
    return doc?.data ?? [];
  }
}
