import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../../database/prisma.service';
import { localizedResponse, validLang } from '../../common/i18n/localization';
import { parse } from '../../common/validation/parse';
import { aboutSchema, contactSchema } from './site.schemas';

@Controller('api')
export class SiteController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('site/about')
  async about(@Query('lang') lang?: string) {
    return localizedResponse(await this.prisma.aboutPage.findUnique({ where: { id: 'main' } }), validLang(lang));
  }

  @UseGuards(AdminGuard)
  @Patch('site/about')
  updateAbout(@Body() body: unknown) {
    const data = parse(aboutSchema, body);
    return this.prisma.aboutPage.upsert({ where: { id: 'main' }, create: data, update: data });
  }

  @Get('site/contact')
  async contact(@Query('lang') lang?: string) {
    return localizedResponse(await this.prisma.companyContact.findUnique({ where: { id: 'main' } }), validLang(lang));
  }

  @UseGuards(AdminGuard)
  @Patch('site/contact')
  updateContact(@Body() body: unknown) {
    const data = parse(contactSchema, body);
    return this.prisma.companyContact.upsert({ where: { id: 'main' }, create: data, update: data });
  }

}
