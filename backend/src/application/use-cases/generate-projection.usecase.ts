// caso de uso para generar proyeccion sin acentos ni punto final
import { Injectable } from '@nestjs/common';
import type { AvanceItem } from '../../domain/entities/avance.entity';
import type { Course } from '../../domain/entities/course.entity';
import {
  ProjectionService,
  type ProjectionResult,
} from '../../domain/services/projection.service';
import { AvanceGateway, MallasGateway } from '../../infra/ucn/ucn.gateways';

// helpers seguros para parsear unknown y evitar no-base-to-string
function s(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}
function n(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return 0;
}
function b(v: unknown): boolean {
  return v === true || v === 'true';
}

function parseMalla(data: unknown): Course[] {
  if (!Array.isArray(data)) {
    // si no viene como array, devolvemos vacio y seguimos
    return [];
  }
  return data.map((x) => {
    const obj = x as Record<string, unknown>;
    return {
      codigo: s(obj.codigo),
      asignatura: s(obj.asignatura),
      creditos: n(obj.creditos),
      nivel: n(obj.nivel),
      prereq: s(obj.prereq),
    };
  });
}

function parseAvance(data: unknown): AvanceItem[] {
  if (!Array.isArray(data)) {
    // si viene {error: "..."} o cualquier otra cosa, tratamos como sin avance
    return [];
  }
  return data.map((x) => {
    const obj = x as Record<string, unknown>;
    return {
      nrc: s(obj.nrc),
      period: s(obj.period),
      student: s(obj.student),
      course: s(obj.course),
      excluded: b(obj.excluded),
      inscriptionType: s(obj.inscriptionType),
      status: s(obj.status),
    };
  });
}

@Injectable()
export class GenerateProjectionUseCase {
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
  }): Promise<ProjectionResult> {
    const mallaRaw = await this.mallasGw.malla(
      params.codCarrera,
      params.catalogo,
    );
    const avanceRaw = await this.avanceGw.avance(params.rut, params.codCarrera);

    const malla = parseMalla(mallaRaw);
    const avance = parseAvance(avanceRaw);

    // diagnostico minimo

    console.log('diag.proyeccion', {
      mallaLen: malla.length,
      avanceLen: avance.length,
      aprobados: avance.filter((a) => a.status === 'APROBADO').length,
      reprobados: avance.filter((a) => a.status === 'REPROBADO').length,
      ejemploMalla: malla.slice(0, 3).map((c) => c.codigo),
      ejemploReprob: avance
        .filter((a) => a.status === 'REPROBADO')
        .slice(0, 5)
        .map((a) => a.course),
      tope: params.topeCreditos,
    });

    return ProjectionService.build({
      malla,
      avance,
      topeCreditos: params.topeCreditos,
      nivelObjetivo: params.nivelObjetivo,
      prioritarios: params.prioritarios,
    });
  }
}
