// entidad de curso de la malla sin acentos ni punto final
export interface Course {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string; // codigos separados por coma o string vacio
}
