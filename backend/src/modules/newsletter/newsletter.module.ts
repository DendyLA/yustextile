import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NewsletterController } from './newsletter.controller';

@Module({ imports: [PrismaModule, AuthModule], controllers: [NewsletterController] })
export class NewsletterModule {}
