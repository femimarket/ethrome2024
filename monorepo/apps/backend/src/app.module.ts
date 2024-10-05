import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TickModule } from './tick/tick.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeAddress } from './entity/trade.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [TradeAddress],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TickModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
