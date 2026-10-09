import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';

@Module({ imports: [PrismaModule, AuthModule], controllers: [OrdersController] })
export class OrdersModule {}
