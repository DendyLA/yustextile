import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { ContentService } from './content.service';

@Controller('api/admin')
@UseGuards(AdminGuard)
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get('content/:resource')
  list(@Param('resource') resource: string, @Query() query: Record<string, string>) {
    return this.content.list(resource, query, true);
  }

  @Get('categories/tree')
  tree() { return this.content.tree(true); }

  @Get('content/:resource/:idOrSlug')
  one(@Param('resource') resource: string, @Param('idOrSlug') id: string) {
    return this.content.one(resource, id, true);
  }
}
