// genera varias opciones de proyeccion variando la seleccion base sin acentos ni punto final
import { Injectable } from '@nestjs/common';
import type { ProjectionResult } from '../../domain/services/projection.service';
import { ProjectionService } from '../../domain/services/projection.service';
import { AvanceGateway, MallasGateway } from '../../infra/ucn/ucn.gateways';

@Injectable()
export class GenerateProjectionOptionsUseCase {
  constructor(
    private readonly mallasGw: MallasGateway,
    private readonly avanceGw: AvanceGateway,
  ) {}

  async exec(params: {
    rut: string;
    codCarrera: string;
    catalogo: string;
    topeCreditos: number;
    nivelObjetivo?: number;
    prioritarios?: string[];
    maxOptions?: number;
  }): Promise<{ opciones: ProjectionResult[] }> {
    const mallaRaw = await this.mallasGw.malla(params.codCarrera, params.catalogo);
    const avanceRaw = await this.avanceGw.avance(params.rut, params.codCarrera);

    // parse functions from generate-projection.usecase
    const s = (v: unknown) => (typeof v === 'string' ? v : String(v ?? ''));
    const n = (v: unknown) => {
      const x = Number(v);
      return Number.isFinite(x) ? x : 0;
    };
    const parseMalla = (data: unknown) =>
      Array.isArray(data)
        ? data.map((x) => {
            const obj = x as Record<string, unknown>;
            return {
              codigo: s(obj.codigo),
              asignatura: s(obj.asignatura),
              creditos: n(obj.creditos),
              nivel: n(obj.nivel),
              prereq: s(obj.prereq || ''),
            };
          })
        : [];
    const parseAvance = (data: unknown) =>
      Array.isArray(data)
        ? data.map((x) => {
            const obj = x as Record<string, unknown>;
            return {
              nrc: s(obj.nrc),
              period: s(obj.period),
              student: s(obj.student),
              course: s(obj.course),
              excluded: Boolean(obj.excluded),
              inscriptionType: s(obj.inscriptionType),
              status: s(obj.status),
            };
          })
        : [];

    const malla = parseMalla(mallaRaw);
    const avance = parseAvance(avanceRaw);

    const opciones = ProjectionService.buildOptions(
      {
        malla,
        avance,
        topeCreditos: params.topeCreditos,
        nivelObjetivo: params.nivelObjetivo,
        prioritarios: params.prioritarios,
      },
      params.maxOptions ?? 5,
    );
    return { opciones };
  }
}

