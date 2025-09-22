// item de avance del estudiante sin acentos ni punto final
export interface AvanceItem {
  nrc: string;
  period: string;
  student: string;
  course: string;
  excluded: boolean;
  inscriptionType: string;
  status: string; // APROBADO REPROBADO INSCRITO etc
}
