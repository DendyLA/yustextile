import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { SiteModule } from './modules/site/site.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ContentModule } from './modules/content/content.module';

@Module({
  // Content's generic routes are registered after the specific API routes.
  imports: [AuthModule, SiteModule, OrdersModule, NewsletterModule, UploadsModule, ContentModule],
})
export class AppModule {}
