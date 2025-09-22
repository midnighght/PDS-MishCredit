// repositorio de respaldo malla sin acentos ni punto final
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Course } from '../../domain/entities/course.entity';
import { MallaBackup, MallaBackupDocument } from './malla-backup.schema';

@Injectable()
export class MallaBackupRepository {
  constructor(
    @InjectModel(MallaBackup.name)
    private readonly model: Model<MallaBackupDocument>,
  ) {}

  async upsert(codCarrera: string, catalogo: string, data: Course[]) {
    await this.model
      .updateOne({ codCarrera, catalogo }, { $set: { data } }, { upsert: true })
      .exec();
  }

  async get(codCarrera: string, catalogo: string) {
    return this.model.findOne({ codCarrera, catalogo }).lean().exec();
  }
}
