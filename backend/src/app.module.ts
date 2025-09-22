// modulo raiz con config http mongoose y schedule
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { validateEnvConfig } from './config/env.validation';
import { UcnModule } from './infra/ucn/ucn.module';
import { OffersModule } from './offers/offers.module';
import { ProjectionsModule } from './projections/projections.module';
import { HealthController } from './web/health.controller';
import { AuthController } from './web/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvConfig }),
    HttpModule.register({ timeout: 10000 }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/planificador',
    ),
    UcnModule,
    OffersModule,
    ProjectionsModule,
  ],
  controllers: [HealthController, AuthController],
})
export class AppModule {}
