import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const PORT = configService.get("PORT");

  app.setGlobalPrefix("api");
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(PORT);

  console.log("[SERVER] running at port: ", PORT);
  
}
bootstrap();
