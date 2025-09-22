// controller de oferta CSV sin acentos ni punto final
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type { OfferParallel } from '../domain/entities/offer.entity';
import { OfferRepository } from '../infra/db/offer.repository';
import { AdminKeyGuard } from '../infra/ucn/admin-key.guard';

class CargarOfertaDto {
  @IsString() @IsNotEmpty() csv!: string;
}

class ListarOfertaDto {
  @IsString() @IsNotEmpty() course!: string;
  @IsString() @IsNotEmpty() period!: string;
}

function parseCsv(csv: string): OfferParallel[] {
  // formato esperado cabecera:
  // period,nrc,course,codigoParalelo,dia,inicio,fin,sala,cupos
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return [];
  const header = lines
    .shift()!
    .split(',')
    .map((x) => x.trim().toLowerCase());

  const idx = (k: string) => header.indexOf(k);
  const need = [
    'period',
    'nrc',
    'course',
    'codigoparalelo',
    'dia',
    'inicio',
    'fin',
    'sala',
    'cupos',
  ];
  for (const k of need)
    if (idx(k) === -1) throw new Error('csv invalido: falta ' + k);

  const map = new Map<string, OfferParallel>();
  for (const ln of lines) {
    const cols = ln.split(',').map((x) => x.trim());
    const key = cols[idx('nrc')];
    const slot = {
      dia: cols[idx('dia')],
      inicio: cols[idx('inicio')],
      fin: cols[idx('fin')],
      sala: cols[idx('sala')] || undefined,
    };
    const base = map.get(key);
    if (base) {
      base.slots.push(slot);
    } else {
      map.set(key, {
        period: cols[idx('period')],
        nrc: cols[idx('nrc')],
        course: cols[idx('course')],
        codigoParalelo: cols[idx('codigoparalelo')],
        cupos: Number(cols[idx('cupos')] || 0),
        slots: [slot],
      });
    }
  }
  return [...map.values()];
}

@ApiTags('oferta')
@Controller('oferta')
export class OffersController {
  constructor(private readonly repo: OfferRepository) {}

  @Post('cargar')
  @ApiOperation({ summary: 'Cargar oferta desde CSV' })
  @ApiBody({ schema: { properties: { csv: { type: 'string' } } } })
  @UseGuards(AdminKeyGuard)
  async cargar(@Body() dto: CargarOfertaDto) {
    let rows: OfferParallel[] = [];
    try {
      rows = parseCsv(dto.csv);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'csv invalido';
      throw new BadRequestException(msg);
    }
    const up = await this.repo.upsertMany(rows);
    return { ok: true, upserts: up, rows: rows.length };
  }

  @Get('listar')
  @ApiOperation({ summary: 'Listar oferta por curso y periodo' })
  @ApiQuery({ name: 'course', required: true })
  @ApiQuery({ name: 'period', required: true })
  @ApiResponse({ status: 200 })
  listar(@Query() q: ListarOfertaDto) {
    return this.repo.listByCourseAndPeriod(q.course, q.period);
  }
}
