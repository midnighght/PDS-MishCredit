// servicio de dominio que selecciona cursos segun reglas sin acentos ni punto final
import type { AvanceItem } from '../entities/avance.entity';
import type { Course } from '../entities/course.entity';

export interface ProjectionInput {
  malla: Course[];
  avance: AvanceItem[];
  topeCreditos: number;
  nivelObjetivo?: number; // semestre objetivo declarado por el usuario (1..n)
  prioritarios?: string[]; // codigos de cursos a priorizar si cumplen reglas
}

export interface ProjectionCourse {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  motivo: 'REPROBADO' | 'PENDIENTE';
  nrc?: string; // <- agregado para no usar any en otros archivos
}

export interface ProjectionResult {
  seleccion: ProjectionCourse[];
  totalCreditos: number;
  reglas: {
    topeCreditos: number;
    priorizaReprobados: true;
    verificaPrereq: true;
  };
}

export class ProjectionService {
  static buildOptions(
    input: ProjectionInput,
    maxOptions = 5,
  ): ProjectionResult[] {
    const base = ProjectionService.build(input);
    const opciones: ProjectionResult[] = [base];

    // recomputar candidatos como en build para generar variantes
    const { malla, avance } = input;
    const tope =
      Number.isFinite(input.topeCreditos) && input.topeCreditos > 0
        ? input.topeCreditos
        : 22;
    const aprobados = new Set<string>(
      avance.filter((a) => a.status === 'APROBADO').map((a) => a.course),
    );
    const reprobados = new Set<string>(
      avance.filter((a) => a.status === 'REPROBADO').map((a) => a.course),
    );
    const pendientes = malla.filter((c) => !aprobados.has(c.codigo));
    const nivelObjetivo =
      Number.isFinite(input.nivelObjetivo) && (input.nivelObjetivo ?? 0) > 0
        ? (input.nivelObjetivo as number)
        : undefined;
    const prioritarios = new Set<string>(
      (input.prioritarios || []).map((s) => (s || '').trim()).filter(Boolean),
    );
    const candidatos = pendientes
      .filter(
        (c) =>
          reprobados.has(c.codigo) ||
          ProjectionService.hasPrereqs(c, aprobados),
      )
      .map((c) => {
        const isReprob = reprobados.has(c.codigo);
        const isBacklog = Boolean(
          nivelObjetivo && c.nivel < (nivelObjetivo as number),
        );
        const isPrio = prioritarios.has(c.codigo);
        const rank = isReprob ? 0 : isBacklog ? 1 : isPrio ? 2 : 3;
        return {
          codigo: c.codigo,
          asignatura: c.asignatura,
          creditos: c.creditos,
          nivel: c.nivel,
          motivo: isReprob ? 'REPROBADO' : 'PENDIENTE',
          _rank: rank,
        } as ProjectionCourse & { _rank: number };
      })
      .sort((a, b) => {
        if (a._rank !== b._rank) return a._rank - b._rank;
        if (a.nivel !== b.nivel) return a.nivel - b.nivel;
        return b.creditos - a.creditos;
      });

    // generar variantes saltando uno a uno de la base
    for (let i = 0; i < base.seleccion.length && opciones.length < maxOptions; i++) {
      const skipCode = base.seleccion[i].codigo;
      let total = 0;
      const pick: ProjectionCourse[] = [];
      for (const c of candidatos) {
        if (c.codigo === skipCode) continue;
        if (total + c.creditos <= tope) {
          const { _rank, ...rest } = c as ProjectionCourse & { _rank?: number };
          pick.push(rest as ProjectionCourse);
          total += c.creditos;
        }
        if (total >= tope) break;
      }
      // evitar duplicados respecto a base
      const same =
        pick.length === base.seleccion.length &&
        pick.every((p, idx) => p.codigo === base.seleccion[idx].codigo);
      if (!same && pick.length > 0) {
        opciones.push({
          seleccion: pick,
          totalCreditos: total,
          reglas: base.reglas,
        });
      }
    }

    // generar variantes forzando incluir cursos prioritarios si no quedaron en base
    const prios = new Set<string>((input.prioritarios || []).filter(Boolean));
    for (const code of prios) {
      if (opciones.length >= maxOptions) break;
      const inBase = base.seleccion.some((s) => s.codigo === code);
      const cand = candidatos.find((c) => c.codigo === code);
      if (inBase || !cand) continue;
      let total = 0;
      const pick: ProjectionCourse[] = [];
      // incluir prioritario primero
      if (cand.creditos > tope) continue;
      const { _rank: _r1, ...restP } = cand as ProjectionCourse & { _rank?: number };
      pick.push(restP as ProjectionCourse);
      total += cand.creditos;
      for (const c of candidatos) {
        if (c.codigo === code) continue;
        if (total + c.creditos <= tope) {
          const { _rank, ...rest } = c as ProjectionCourse & { _rank?: number };
          pick.push(rest as ProjectionCourse);
          total += c.creditos;
        }
        if (total >= tope) break;
      }
      const dup = opciones.some(
        (opt) =>
          opt.seleccion.length === pick.length &&
          opt.seleccion.every((p, idx) => p.codigo === pick[idx].codigo),
      );
      if (!dup) {
        opciones.push({ seleccion: pick, totalCreditos: total, reglas: base.reglas });
      }
    }

    return opciones;
  }
  static hasPrereqs(course: Course, aprobados: Set<string>): boolean {
    const p = (course.prereq || '').trim();
    if (!p) return true;
    const reqs = p
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return reqs.every((code) => aprobados.has(code));
  }

  static build(input: ProjectionInput): ProjectionResult {
    const { malla, avance } = input;
    const tope =
      Number.isFinite(input.topeCreditos) && input.topeCreditos > 0
        ? input.topeCreditos
        : 22;
    const nivelObjetivo =
      Number.isFinite(input.nivelObjetivo) && (input.nivelObjetivo ?? 0) > 0
        ? (input.nivelObjetivo as number)
        : undefined;
    const prioritarios = new Set<string>(
      (input.prioritarios || []).map((s) => (s || '').trim()).filter(Boolean),
    );

    const aprobados = new Set<string>(
      avance.filter((a) => a.status === 'APROBADO').map((a) => a.course),
    );
    const reprobados = new Set<string>(
      avance.filter((a) => a.status === 'REPROBADO').map((a) => a.course),
    );

    const pendientes = malla.filter((c) => !aprobados.has(c.codigo));

    const candidatos: Array<ProjectionCourse & { _rank: number }> = pendientes
      .filter(
        (c) =>
          reprobados.has(c.codigo) ||
          ProjectionService.hasPrereqs(c, aprobados),
      )
      .map((c) => {
        const isReprob = reprobados.has(c.codigo);
        const isBacklog = Boolean(
          nivelObjetivo && c.nivel < (nivelObjetivo as number),
        );
        const isPrio = prioritarios.has(c.codigo);
        // ranking: 0 reprobados, 1 backlog pendiente, 2 prioritarios, 3 resto
        const rank = isReprob ? 0 : isBacklog ? 1 : isPrio ? 2 : 3;
        return {
          codigo: c.codigo,
          asignatura: c.asignatura,
          creditos: c.creditos,
          nivel: c.nivel,
          motivo: isReprob ? 'REPROBADO' : 'PENDIENTE',
          _rank: rank,
        };
      });

    candidatos.sort((a, b) => {
      if (a._rank !== b._rank) return a._rank - b._rank;
      if (a.nivel !== b.nivel) return a.nivel - b.nivel;
      return b.creditos - a.creditos;
    });

    const seleccion: ProjectionCourse[] = [];
    let total = 0;
    for (const c of candidatos) {
      if (total + c.creditos <= tope) {
        // quitar campo auxiliar
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _rank, ...rest } = c as ProjectionCourse & { _rank?: number };
        seleccion.push(rest as ProjectionCourse);
        total += c.creditos;
      }
      if (total >= tope) break;
    }

    return {
      seleccion,
      totalCreditos: total,
      reglas: {
        topeCreditos: tope,
        priorizaReprobados: true,
        verificaPrereq: true,
      },
    };
  }
}
