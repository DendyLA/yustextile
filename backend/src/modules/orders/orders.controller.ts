import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../../database/prisma.service';
import { parse } from '../../common/validation/parse';
import { orderSchema, statusSchema } from './orders.schemas';

@Controller('api/orders')
export class OrdersController {
  private readonly attempts = new Map<string, { count: number; reset: number }>();
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() body: unknown, @Req() request: Request) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const previous = this.attempts.get(ip);
    const state = !previous || previous.reset < now ? { count: 0, reset: now + 60_000 } : previous;
    state.count += 1;
    this.attempts.set(ip, state);
    if (state.count > 5) throw new BadRequestException('Too many orders; try again in a minute');
    const input = parse(orderSchema, body);
    const ids = [...new Set(input.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({ where: { id: { in: ids }, active: true } });
    if (products.length !== ids.length) throw new BadRequestException('One or more products are unavailable');
    const byId = new Map(products.map((product) => [product.id, product]));
    return this.prisma.order.create({
      data: {
        name: input.name, phone: input.phone, email: input.email.toLowerCase(),
        country: input.country, address: input.address, comment: input.comment,
        items: { create: input.items.map((item) => ({ productId: item.productId, quantity: item.quantity, productTitle: byId.get(item.productId)!.title as any })) },
      },
      include: { items: true },
    });
  }

  @UseGuards(AdminGuard)
  @Get()
  async list(@Query('status') status?: string) {
    if (status && !['NEW', 'CONTACTED', 'CLOSED', 'CANCELLED'].includes(status)) throw new BadRequestException('Invalid status');
    return this.prisma.order.findMany({ where: status ? { status: status as any } : {}, include: { items: true }, orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  async one(@Param('id') id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException();
    return order;
  }

  @UseGuards(AdminGuard)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: unknown) {
    const { status } = parse(statusSchema, body);
    try { return await this.prisma.order.update({ where: { id }, data: { status } }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException();
      throw error;
    }
  }
}
