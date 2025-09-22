// repositorio de oferta sin acentos ni punto final
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model } from 'mongoose';
import type {
  OfferParallel,
  OfferSlot,
} from '../../domain/entities/offer.entity';
import { Offer, OfferDocument } from './offer.schema';

@Injectable()
export class OfferRepository {
  constructor(
    @InjectModel(Offer.name) private readonly model: Model<OfferDocument>,
  ) {}

  // upsert masivo simple
  async upsertMany(rows: OfferParallel[]): Promise<number> {
    const ops = rows.map((r) => ({
      updateOne: {
        filter: { nrc: r.nrc },
        update: {
          $set: {
            period: r.period,
            nrc: r.nrc,
            course: r.course,
            codigoParalelo: r.codigoParalelo,
            cupos: r.cupos,
            slots: r.slots,
          },
        },
        upsert: true,
      },
    }));
    if (ops.length === 0) return 0;
    const res = await this.model.bulkWrite(ops, { ordered: false });
    return res.modifiedCount + res.upsertedCount;
  }

  async listByCourseAndPeriod(
    course: string,
    period: string,
  ): Promise<OfferParallel[]> {
    const docs = await this.model.find({ course, period }).lean().exec();
    return docs.map((d) => ({
      period: d.period,
      nrc: d.nrc,
      course: d.course,
      codigoParalelo: d.codigoParalelo,
      cupos: d.cupos,
      slots: d.slots as OfferSlot[],
    }));
  }
}
