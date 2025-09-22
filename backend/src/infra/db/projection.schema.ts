// schema de proyeccion en mongo sin acentos ni punto final
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// reemplaza lo anterior por esta version con nrc opcional
export type Motivo = 'REPROBADO' | 'PENDIENTE';

export interface ProjectionItem {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  motivo: Motivo;
  nrc?: string; // opcional
}

export const ProjectionItemSchema = new MongooseSchema<ProjectionItem>(
  {
    codigo: { type: String, required: true },
    asignatura: { type: String, required: true },
    creditos: { type: Number, required: true },
    nivel: { type: Number, required: true },
    motivo: { type: String, enum: ['REPROBADO', 'PENDIENTE'], required: true },
    nrc: { type: String },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  toJSON: { versionKey: false },
})
export class Projection {
  @Prop({ required: true, index: true }) rut!: string;
  @Prop({ required: true }) codCarrera!: string;
  @Prop({ required: true }) catalogo!: string;
  @Prop() nombre?: string;
  @Prop({ default: false, index: true }) isFavorite!: boolean;
  @Prop({ required: true }) totalCreditos!: number;
  @Prop({ type: [ProjectionItemSchema], default: [] }) items!: ProjectionItem[];
}

export type ProjectionDocument = Projection & Document;
export const ProjectionSchema = SchemaFactory.createForClass(Projection);
ProjectionSchema.index({ rut: 1, createdAt: -1 });
ProjectionSchema.index({ isFavorite: 1, codCarrera: 1 });
