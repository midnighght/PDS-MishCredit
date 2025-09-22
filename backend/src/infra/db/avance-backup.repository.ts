// repositorio de respaldo avance sin acentos ni punto final
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { AvanceItem } from '../../domain/entities/avance.entity';
import { AvanceBackup, AvanceBackupDocument } from './avance-backup.schema';

@Injectable()
export class AvanceBackupRepository {
  constructor(
    @InjectModel(AvanceBackup.name)
    private readonly model: Model<AvanceBackupDocument>,
  ) {}

  async upsert(rut: string, codCarrera: string, data: AvanceItem[]) {
    await this.model
      .updateOne({ rut, codCarrera }, { $set: { data } }, { upsert: true })
      .exec();
  }

  async get(rut: string, codCarrera: string) {
    return this.model.findOne({ rut, codCarrera }).lean().exec();
  }
}
