import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  // Use /files/ prefix to avoid conflict with /uploads API endpoint
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/files/',
  });

  // Serve static files from public directory (for branding assets)
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  // Enable CORS for frontend - supports multiple domains
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];
  
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable validation pipes with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.error('🚨 [VALIDATION] Validation failed:', JSON.stringify(errors, null, 2));
        return errors;
      },
    }),
  );

  // Setup Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Dashboard Customization API')
    .setDescription(
      'AI-optimized dashboard customization system with widget-based layouts, ' +
      'dynamic navigation, and comprehensive permission management. ' +
      '\n\n## Features\n' +
      '- Widget-based dashboard composition\n' +
      '- Drag-and-drop layout editor\n' +
      '- Pre-built layout templates\n' +
      '- Permission-based widget filtering\n' +
      '- Natural language widget search\n' +
      '- Layout validation and suggestions\n' +
      '\n\n## Quick Start for AI Agents\n' +
      '1. Call `GET /capabilities` to discover available widgets and permissions\n' +
      '2. Search widgets by intent: `GET /widgets/registry/search?query=show revenue`\n' +
      '3. Get widget details: `GET /widgets/registry/:key`\n' +
      '4. Create layout: `POST /dashboard-layouts` with pageId and widgets\n' +
      '5. Or apply template: `POST /dashboard-layouts/templates/:key/apply`\n' +
      '\n\n## Authentication\n' +
      'Most endpoints require JWT authentication. Include the token in the Authorization header:\n' +
      '```\nAuthorization: Bearer <your-jwt-token>\n```'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('capabilities', 'System capabilities and AI discovery')
    .addTag('widgets', 'Widget registry and search')
    .addTag('layouts', 'Dashboard layout management')
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User management')
    .addTag('permissions', 'Permission management')
    .addTag('settings', 'System settings')
    .addTag('notifications', 'Notification system')
    .addTag('blog', 'Blog management')
    .addTag('pages', 'Page management')
    .addTag('landing', 'Landing page CMS')
    .addTag('profile', 'User profile management')
    .addTag('ecommerce', 'E-commerce functionality')
    .addTag('uploads', 'File upload management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Dashboard API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
