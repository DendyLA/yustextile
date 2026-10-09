import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { ContentService } from './content.service';
import { localizedResponse, validLang } from '../../common/i18n/localization';

@Controller('api')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('categories/tree')
  async categoryTree(@Query('lang') lang?: string) {
    return localizedResponse(await this.content.tree(), validLang(lang));
  }

  @Get(':resource')
  async list(@Param('resource') resource: string, @Query() query: Record<string, string>) {
    return localizedResponse(await this.content.list(resource, query), validLang(query.lang));
  }

  @Get(':resource/:idOrSlug')
  async one(@Param('resource') resource: string, @Param('idOrSlug') id: string, @Query('lang') lang?: string) {
    return localizedResponse(await this.content.one(resource, id), validLang(lang));
  }

  @UseGuards(AdminGuard)
  @Post(':resource')
  create(@Param('resource') resource: string, @Body() body: unknown) { return this.content.create(resource, body); }

  @UseGuards(AdminGuard)
  @Patch(':resource/:id')
  update(@Param('resource') resource: string, @Param('id') id: string, @Body() body: unknown) { return this.content.update(resource, id, body); }

  @UseGuards(AdminGuard)
  @Delete(':resource/:id')
  remove(@Param('resource') resource: string, @Param('id') id: string) { return this.content.remove(resource, id); }
}
