import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminContentController } from './admin-content.controller';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminContentController, ContentController],
  providers: [ContentService],
})
export class ContentModule {}
