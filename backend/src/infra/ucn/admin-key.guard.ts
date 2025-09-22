// guard sencillo por header x-admin-key sin acentos ni punto final
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, unknown> }>();
    const headers = req.headers || {};
    const key = (headers['x-admin-key'] || headers['X-ADMIN-KEY']) as
      | string
      | undefined;
    const expected = process.env.ADMIN_API_KEY || '';
    if (!expected) {
      throw new UnauthorizedException('admin key no configurada');
    }
    if (!key || key !== expected) {
      throw new UnauthorizedException('admin key invalida');
    }
    return true;
  }
}
