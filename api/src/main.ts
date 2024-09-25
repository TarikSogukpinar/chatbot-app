//Custom Modules, Packages, Configs, etc.
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

//pnpm packages
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { SwaggerService } from './core/swagger/swagger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(
    configService.get<string>('API_GLOBAL_PREFIX', { infer: true }),
  );
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(helmet());
  app.use(hpp());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const swaggerService = app.get(SwaggerService);
  swaggerService.setupSwagger(app);

  await app.listen(
    configService.get<number>('API_PORT', { infer: true }),
    '0.0.0.0',
  );

  const apiPort = configService.get<number>('API_PORT', { infer: true });
  Logger.log(`🚀 Application is running on: http://localhost:${apiPort}/`);
}
bootstrap();
