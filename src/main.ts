import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from '@common/config/env';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = validationErrors.map((error) => {
          const constraints = error.constraints
            ? Object.values(error.constraints)
            : ['Invalid input'];

          return {
            property: error.property,
            message: constraints[0],
          };
        });

        return new BadRequestException({
          code: 1001,
          message: 'Validation failed',
          errors,
        });
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('API for user authentication and management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'accessBearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  const port = env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Server is running at: http://localhost:${port}`, 'Bootstrap');
  Logger.log(
  `📘 Swagger UI: http://localhost:${port}/api-docs`,
    'Swagger',
  );
}
bootstrap();
