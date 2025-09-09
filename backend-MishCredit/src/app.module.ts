import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [ProxyModule], // Make sure this is here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}