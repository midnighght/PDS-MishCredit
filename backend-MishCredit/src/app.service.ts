// filepath: c:\Users\Pro360\Documents\Workspace\JS-HTML-CSS\PDS-MishCredit\backend-MishCredit\src\app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'MishCredit Proxy Server - Ready to proxy UCN API calls!';
  }
}