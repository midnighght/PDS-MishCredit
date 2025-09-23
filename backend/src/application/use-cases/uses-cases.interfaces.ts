
export interface StudentProjection {
  rut: string;
  codCarrera: string;
  catalogo: string;
  topeCreditos: number;
  nivelObjetivo?: number;
  prioritarios?: string[];
}
export interface StudentOfferProjection extends StudentProjection{

  period: string;
}
export interface  StudentsOptionsProjections extends StudentProjection{

  maxOptions?: number;
}

