// entidades de oferta sin acentos ni punto final
export interface OfferSlot {
  dia: string; // LU MA MI JU VI SA
  inicio: string; // HH:MM
  fin: string; // HH:MM
  sala?: string;
}

export interface OfferParallel {
  period: string; // 202520
  nrc: string; // 22099
  course: string; // DCCB-00264
  codigoParalelo: string; // A1 etc
  cupos: number; // 0..n
  slots: OfferSlot[]; // bloques horarios del paralelo
}
