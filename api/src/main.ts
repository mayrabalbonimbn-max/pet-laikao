import "reflect-metadata";

import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  const prefix = config.get<string>("API_GLOBAL_PREFIX", "apiv2");
  app.setGlobalPrefix(prefix);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOrigins = (config.get<string>("CORS_ORIGINS", "") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true
  });

  const port = config.get<number>("PORT", 4018);
  await app.listen(port, "127.0.0.1");

  Logger.log(`laikao-api ouvindo em http://127.0.0.1:${port}/${prefix}`, "Bootstrap");
}

void bootstrap();
