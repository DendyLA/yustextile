import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { parse } from '../../common/validation/parse';
import { schemas } from './content.schemas';

type Resource = keyof typeof schemas;
const models: Record<Resource, keyof PrismaClient> = {
  promos: 'promo', catalogs: 'catalog', categories: 'category', products: 'product',
  'about-blocks': 'aboutBlock', partners: 'partner', complexes: 'productionComplex',
  faqs: 'faq', blog: 'blogPost',
};

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  private config(resource: string) {
    if (!(resource in models)) throw new NotFoundException('Unknown resource');
    const name = resource as Resource;
    return { schema: schemas[name], model: (this.prisma as any)[models[name]] as any };
  }

  private include(resource: string) {
    return resource === 'products' ? { specs: { orderBy: { sortOrder: 'asc' } }, category: { select: { id: true, slug: true, title: true } } } : undefined;
  }

  async list(resource: string, query: Record<string, string>, admin = false) {
    const { model } = this.config(resource);
    const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit || '20', 10) || 20));
    const where: any = {};
    if (!admin) where.active = true;
    if (resource === 'products') {
      if (query.categoryId || query.categorySlug) {
        const categories = await this.prisma.category.findMany({ where: admin ? {} : { active: true }, select: { id: true, slug: true, parentId: true } });
        const root = categories.find((item) => item.id === query.categoryId || item.slug === query.categorySlug);
        const ids = new Set(root ? [root.id] : []);
        let previousSize = -1;
        while (previousSize !== ids.size) {
          previousSize = ids.size;
          for (const category of categories) if (category.parentId && ids.has(category.parentId)) ids.add(category.id);
        }
        where.categoryId = { in: [...ids] };
      }
      if (query.recommended === 'true') where.recommended = true;
    }
    if (resource === 'categories' && query.parentId) where.parentId = query.parentId === 'root' ? null : query.parentId;
    const orderBy = resource === 'blog'
      ? { publishedAt: 'desc' }
      : resource === 'catalogs'
        ? { updatedAt: 'desc' }
        : { sortOrder: 'asc' };
    const [items, total] = await Promise.all([
      model.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: this.include(resource) }),
      model.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async tree(admin = false) {
    const categories = await this.prisma.category.findMany({ where: admin ? {} : { active: true }, orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }] });
    const counts = await this.prisma.product.groupBy({ by: ['categoryId'], where: admin ? {} : { active: true }, _count: { _all: true } });
    const directCounts = new Map(counts.map((count) => [count.categoryId, count._count._all]));
    const nodes = new Map(categories.map((category) => [category.id, { ...category, children: [] as any[], directProductCount: directCounts.get(category.id) || 0, productCount: 0 }]));
    const roots: any[] = [];
    for (const node of nodes.values()) {
      const parent = node.parentId && nodes.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    const countSubtree = (node: (typeof roots)[number]): number => {
      node.productCount = node.directProductCount + node.children.reduce((sum: number, child: any) => sum + countSubtree(child), 0);
      return node.productCount;
    };
    roots.forEach(countSubtree);
    return roots;
  }

  async one(resource: string, idOrSlug: string, admin = false) {
    const { model } = this.config(resource);
    const where = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
    if (!['categories', 'products', 'complexes', 'blog'].includes(resource) && !('id' in where)) throw new BadRequestException('UUID required');
    const item = await model.findFirst({ where: { ...where, ...(!admin && { active: true }) }, include: this.include(resource) });
    if (!item) throw new NotFoundException();
    return item;
  }

  private async validateParent(id: string | null | undefined, ownId?: string) {
    if (!id) return;
    let current: string | null = id;
    while (current) {
      if (current === ownId) throw new BadRequestException('Category cycle is not allowed');
      const parent: { parentId: string | null } | null = await this.prisma.category.findUnique({ where: { id: current }, select: { parentId: true } });
      if (!parent) throw new BadRequestException('Parent category not found');
      current = parent.parentId;
    }
  }

  async create(resource: string, body: unknown) {
    const { schema, model } = this.config(resource);
    const data: any = parse(schema, body);
    if (resource === 'categories') await this.validateParent(data.parentId);
    if (resource === 'products') {
      const specs = data.specs;
      delete data.specs;
      data.specs = { create: specs };
    }
    try { return await model.create({ data, include: this.include(resource) }); }
    catch (error) { this.handlePrisma(error); }
  }

  async update(resource: string, id: string, body: unknown) {
    const { schema, model } = this.config(resource);
    const data: any = parse(schema.partial(), body);
    if (Object.keys(data).length === 0) throw new BadRequestException('Empty update');
    if (resource === 'categories' && 'parentId' in data) await this.validateParent(data.parentId, id);
    if (resource === 'products' && 'specs' in data) {
      const specs = data.specs;
      delete data.specs;
      data.specs = { deleteMany: {}, create: specs };
    }
    try { return await model.update({ where: { id }, data, include: this.include(resource) }); }
    catch (error) { this.handlePrisma(error); }
  }

  async remove(resource: string, id: string) {
    const { model } = this.config(resource);
    try { await model.delete({ where: { id } }); return { deleted: true }; }
    catch (error) { this.handlePrisma(error); }
  }

  private handlePrisma(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw new ConflictException('Slug or other unique field already exists');
      if (error.code === 'P2025') throw new NotFoundException();
      if (error.code === 'P2003') throw new BadRequestException('Referenced record does not exist or is still in use');
    }
    throw error;
  }
}
