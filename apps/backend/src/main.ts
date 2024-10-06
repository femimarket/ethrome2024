import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EthService } from './tick/eth/eth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const app2 = await NestFactory.createApplicationContext(AppModule);

  console.log("Starting backend...33")
  const ethService = app.get(EthService);
  ethService.watchContract()
  await app.listen(4200)

}
bootstrap();
