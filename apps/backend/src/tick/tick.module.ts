import { Module } from '@nestjs/common';
import { OandaService } from './oanda/oanda.service';
import { HttpModule } from '@nestjs/axios';
import { EthService } from './eth/eth.service';
import { TickService } from './tick.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeAddress } from 'src/entity/trade.entity';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([TradeAddress])
  ],
  providers: [OandaService, EthService, TickService],
  exports: [TypeOrmModule]
})
export class TickModule {}
