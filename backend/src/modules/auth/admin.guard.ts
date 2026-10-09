import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

function equal(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminToken(secret: string): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.ADMIN_API_KEY;
    if (!secret || secret === 'replace-with-a-long-random-secret') throw new ServiceUnavailableException('ADMIN_API_KEY is not configured');
    const headers = context.switchToHttp().getRequest().headers;
    const provided = headers['x-admin-key'];
    if (typeof provided === 'string' && equal(provided, secret)) return true;
    const bearer = typeof headers.authorization === 'string' ? headers.authorization.match(/^Bearer (\S+)$/i)?.[1] : undefined;
    if (bearer) {
      const [payload, signature, extra] = bearer.split('.');
      if (payload && signature && !extra) {
        const expected = createHmac('sha256', secret).update(payload).digest('base64url');
        if (equal(signature, expected)) {
          try {
            const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
            if (typeof parsed.exp === 'number' && parsed.exp > Date.now()) return true;
          } catch { /* Invalid token */ }
        }
      }
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }
}
