import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '@/common/logger/logger.module';
import { HttpLoggerMiddleware } from '@/common/middlewares/http-logger.middleware';

import configuration from '@/config/configuration';
import { configValidationSchema } from '@/config/config.validation';

import { PrismaModule } from '@/prisma/prisma.module';
import { AppConfigService } from './config/app-config.service';
import { HealthModule } from './health/health.module';
import { HotelsModule } from './hotels/hotels.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    LoggerModule,
    PrismaModule,
    HealthModule,
    HotelsModule,
  ],
  controllers: [],
  providers: [AppConfigService, PrismaService],
  exports: [AppConfigService], // so you can inject it anywhere
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
