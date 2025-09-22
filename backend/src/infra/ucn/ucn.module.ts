// modulo ucn que expone los endpoints proxy
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UcnController } from './ucn.controller';
import { AvanceGateway, LoginGateway, MallasGateway } from './ucn.gateways';
import { UcnBackupController } from './ucn.backup.controller';
import { AdminKeyGuard } from './admin-key.guard';
import { MallaBackup, MallaBackupSchema } from '../db/malla-backup.schema';
import { AvanceBackup, AvanceBackupSchema } from '../db/avance-backup.schema';
import { MallaBackupRepository } from '../db/malla-backup.repository';
import { AvanceBackupRepository } from '../db/avance-backup.repository';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: MallaBackup.name, schema: MallaBackupSchema },
      { name: AvanceBackup.name, schema: AvanceBackupSchema },
    ]),
  ],
  controllers: [UcnController, UcnBackupController],
  providers: [
    LoginGateway,
    MallasGateway,
    AvanceGateway,
    AdminKeyGuard,
    MallaBackupRepository,
    AvanceBackupRepository,
  ],
  exports: [
    LoginGateway,
    MallasGateway,
    AvanceGateway,
    MallaBackupRepository,
    AvanceBackupRepository,
  ], // <- exporta para otros modulos
})
export class UcnModule {}
