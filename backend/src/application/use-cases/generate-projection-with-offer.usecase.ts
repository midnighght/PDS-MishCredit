// caso de uso proyeccion con oferta eligiendo nrc sin choques sin acentos ni punto final
import { Injectable } from '@nestjs/common';
import type { OfferParallel } from '../../domain/entities/offer.entity';
import { ScheduleService } from '../../domain/services/schedule.service';
import { OfferRepository } from '../../infra/db/offer.repository';
import { GenerateProjectionUseCase } from './generate-projection.usecase';

@Injectable()
export class GenerateProjectionWithOfferUseCase {
  constructor(
    private readonly base: GenerateProjectionUseCase,
    private readonly offers: OfferRepository,
  ) {}

  async exec(params: {
    rut: string;
    codCarrera: string;
    catalogo: string;
    topeCreditos: number;
    period: string;
    nivelObjetivo?: number;
    prioritarios?: string[];
  }) {
    const baseProj = await this.base.exec({
      rut: params.rut,
      codCarrera: params.codCarrera,
      catalogo: params.catalogo,
      topeCreditos: params.topeCreditos,
      nivelObjetivo: params.nivelObjetivo,
      prioritarios: params.prioritarios,
    });

    const elegidos: Array<{
      codigo: string;
      nrc: string;
      slots: OfferParallel['slots'];
    }> = [];

    for (const curso of baseProj.seleccion) {
      const paralelos = await this.offers.listByCourseAndPeriod(
        curso.codigo,
        params.period,
      );
      paralelos.sort((a, b) => b.cupos - a.cupos);
      const pick = paralelos.find(
        (p) =>
          !elegidos.some((e) => ScheduleService.anyOverlap(e.slots, p.slots)),
      );
      if (pick) {
        elegidos.push({
          codigo: curso.codigo,
          nrc: pick.nrc,
          slots: pick.slots,
        });
        curso.nrc = pick.nrc; // ya es parte del tipo ProjectionCourse
      }
    }

    return {
      ...baseProj,
      seleccion: baseProj.seleccion, // ahora con nrc cuando se pudo
      reglas: {
        ...baseProj.reglas,
        semestralidad: params.period,
        evitaChoques: true,
      },
    };
  }
}
