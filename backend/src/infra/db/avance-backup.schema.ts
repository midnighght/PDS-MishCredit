// schema de respaldo de avance sin acentos ni punto final
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { AvanceItem } from '../../domain/entities/avance.entity';

@Schema({ timestamps: true })
export class AvanceBackup {
  @Prop({ required: true, index: true }) rut!: string;
  @Prop({ required: true, index: true }) codCarrera!: string;
  @Prop({ type: Array, required: true }) data!: AvanceItem[];
}
export type AvanceBackupDocument = AvanceBackup & Document;
export const AvanceBackupSchema = SchemaFactory.createForClass(AvanceBackup);
AvanceBackupSchema.index({ rut: 1, codCarrera: 1 }, { unique: true });
