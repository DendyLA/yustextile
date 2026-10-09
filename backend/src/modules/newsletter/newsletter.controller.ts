import { Body, ConflictException, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../../database/prisma.service';
import { parse } from '../../common/validation/parse';
import { emailSchema } from './newsletter.schema';

@Controller('api')
export class NewsletterController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('newsletter')
  @HttpCode(201)
  async subscribe(@Body() body: unknown) {
    const { email } = parse(emailSchema, body);
    try {
      await this.prisma.newsletterSubscriber.create({ data: { email: email.toLowerCase() } });
      return { subscribed: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Email is already subscribed');
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Get('admin/newsletter')
  subscribers() { return this.prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } }); }
}
