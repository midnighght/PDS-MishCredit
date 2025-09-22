// schema de oferta en mongo sin acentos ni punto final
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import type { OfferSlot } from '../../domain/entities/offer.entity';

const OfferSlotSchema = new MongooseSchema<OfferSlot>(
  {
    dia: { type: String, required: true },
    inicio: { type: String, required: true },
    fin: { type: String, required: true },
    sala: { type: String },
  },
  { _id: false },
);

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true, index: true }) period!: string;
  @Prop({ required: true, unique: true }) nrc!: string;
  @Prop({ required: true, index: true }) course!: string;
  @Prop({ required: true }) codigoParalelo!: string;
  @Prop({ required: true }) cupos!: number;
  @Prop({ type: [OfferSlotSchema], default: [] }) slots!: OfferSlot[];
}
export type OfferDocument = Offer & Document;
export const OfferSchema = SchemaFactory.createForClass(Offer);
OfferSchema.index({ course: 1, period: 1 });
