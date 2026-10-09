import { Body, Controller, Post, Req, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { createAdminToken } from './admin.guard';
import { parse } from '../../common/validation/parse';
import { z } from 'zod';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();

@Controller('api/admin')
export class AuthController {
  private readonly attempts = new Map<string, { count: number; reset: number }>();

  @Post('login')
  login(@Body() body: unknown, @Req() request: Request) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_API_KEY;
    if (!email || !password || !secret || password === 'replace-with-a-strong-password' || secret === 'replace-with-a-long-random-secret') {
      throw new ServiceUnavailableException('Admin credentials are not configured');
    }
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const prior = this.attempts.get(ip);
    const state = !prior || prior.reset < now ? { count: 0, reset: now + 15 * 60_000 } : prior;
    state.count += 1;
    this.attempts.set(ip, state);
    if (state.count > 10) throw new UnauthorizedException('Too many login attempts');
    const input = parse(loginSchema, body);
    const a = Buffer.from(input.password);
    const b = Buffer.from(password);
    if (input.email.toLowerCase() !== email.toLowerCase() || a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid credentials');
    return { accessToken: createAdminToken(secret), tokenType: 'Bearer', expiresIn: 28800 };
  }
}
