// repositorio mongo de proyecciones sin acentos ni punto final
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Types,
  isValidObjectId,
  type Model,
  type PipelineStage,
  type UpdateResult,
} from 'mongoose';
import { Projection, ProjectionDocument } from './projection.schema';

@Injectable()
export class ProjectionRepository {
  constructor(
    @InjectModel(Projection.name)
    private readonly model: Model<ProjectionDocument>,
  ) {}

  async createAndMaybeFavorite(input: {
    rut: string;
    codCarrera: string;
    catalogo: string;
    nombre?: string;
    favorite?: boolean;
    totalCreditos: number;
    items: Array<{
      codigo: string;
      asignatura: string;
      creditos: number;
      nivel: number;
      motivo: 'REPROBADO' | 'PENDIENTE';
      nrc?: string;
    }>;
  }) {
    if (input.favorite) {
      await this.model
        .updateMany({ rut: input.rut }, { $set: { isFavorite: false } })
        .exec();
    }
    const doc = await this.model.create({
      rut: input.rut,
      codCarrera: input.codCarrera,
      catalogo: input.catalogo,
      nombre: input.nombre,
      isFavorite: Boolean(input.favorite),
      totalCreditos: input.totalCreditos,
      items: input.items,
    });
    return doc.toObject();
  }

  async listByRut(rut: string) {
    return this.model.find({ rut }).sort({ createdAt: -1 }).lean().exec();
  }

  async setFavorite(rut: string, id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id invalido');
    }
    const _id = new Types.ObjectId(id);

    await this.model
      .updateMany({ rut }, { $set: { isFavorite: false } })
      .exec();

    const res: UpdateResult = await this.model
      .updateOne({ _id, rut }, { $set: { isFavorite: true } })
      .exec();

    const matched = res.matchedCount ?? 0;
    if (matched === 0) {
      throw new NotFoundException('proyeccion no encontrada');
    }
  }

  async delete(rut: string, id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id invalido');
    }
    const _id = new Types.ObjectId(id);
    await this.model.deleteOne({ _id, rut }).exec();
  }

  async demandByCourse(codCarrera?: string, porNrc?: boolean) {
    const match: Record<string, unknown> = { isFavorite: true };
    if (codCarrera) match.codCarrera = codCarrera;

    const groupKey = porNrc ? '$items.nrc' : '$items.codigo';
    const pipeline: PipelineStage[] = [
      { $match: match },
      { $unwind: '$items' },
      ...(porNrc
        ? [{ $match: { 'items.nrc': { $exists: true, $ne: null } } }]
        : []),
      {
        $group: {
          _id: groupKey,
          codigo: { $first: '$items.codigo' },
          nrc: { $first: '$items.nrc' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ];
    return this.model.aggregate(pipeline).exec();
  }

  async updateName(rut: string, id: string, nombre: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id invalido');
    }
    const _id = new Types.ObjectId(id);
    const res = await this.model
      .updateOne({ _id, rut }, { $set: { nombre } })
      .exec();
    const matched = res.matchedCount ?? 0;
    if (matched === 0) {
      throw new NotFoundException('proyeccion no encontrada');
    }
  }
}
