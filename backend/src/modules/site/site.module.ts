import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SiteController } from './site.controller';

@Module({ imports: [PrismaModule, AuthModule], controllers: [SiteController] })
export class SiteModule {}
