// endpoint de salud basico
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Estado del servicio y mongo' })
  ok() {
    const mongo = {
      readyState: this.connection.readyState, // 1 conectado
    };
    return { ok: true, mongo };
  }
}
