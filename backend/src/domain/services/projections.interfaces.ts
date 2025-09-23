import { AvanceItem } from "../entities/avance.entity";
import { Course } from "../entities/course.entity";

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