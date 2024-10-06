import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EthService } from './eth/eth.service';


@Injectable()
export class TickService {
    constructor(
        private readonly ethService: EthService,
    ) {}
    private readonly logger = new Logger(TickService.name);


    @Cron(CronExpression.EVERY_10_SECONDS)
    async tick() {
        this.ethService.addTick();
        console.log('Called every 30 seconds');
        this.logger.debug('Called every 30 seconds');
    }

}
