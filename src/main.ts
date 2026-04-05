import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Debug environment variables
  
  const app = await NestFactory.create(AppModule);

  // Enable CORS
app.enableCors({
  origin: ['https://www.triovaeduconnect.com','localhost:3000', 'http://localhost:5173'], // must be explicit when using credentials
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'https://www.triovaeduconnect.com';
  await app.listen(port);
  console.log(` Application is running on: ${host}`);
}

bootstrap();
