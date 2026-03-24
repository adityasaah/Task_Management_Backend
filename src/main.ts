import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { runMigrations } from './database/run-migrations';

async function bootstrap() {
  // Run migrations on startup
  // const databaseUrl =
  //   process.env.DATABASE_URL ||
  //   'postgresql://postgres:postgres@localhost:5432/tasks';
  // await runMigrations(databaseUrl);

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
