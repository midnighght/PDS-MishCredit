// schema de respaldo de malla sin acentos ni punto final
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { Course } from '../../domain/entities/course.entity';

@Schema({ timestamps: true })
export class MallaBackup {
  @Prop({ required: true, index: true }) codCarrera!: string;
  @Prop({ required: true, index: true }) catalogo!: string;
  @Prop({ type: Array, required: true }) data!: Course[];
}
export type MallaBackupDocument = MallaBackup & Document;
export const MallaBackupSchema = SchemaFactory.createForClass(MallaBackup);
MallaBackupSchema.index({ codCarrera: 1, catalogo: 1 }, { unique: true });
