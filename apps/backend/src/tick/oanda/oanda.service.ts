import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { fromUnixTime, getUnixTime, format } from 'date-fns';
import Decimal from 'decimal.js/decimal';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';


type Instrument = string; // You might want to replace this with a more specific type
interface Candle {
    ask: { c: string };
    bid: { c: string };
    mid: { c: string };
    volume: number;
    time: string;
}
interface OandaResponse {
    candles: Candle[];
}

export interface Tick {
    ask: number;
    bid: number;
    mid: number;
    v: number;
    dt: number;
    instrument: Instrument;
}

function fromInstrument(instrument: Instrument): string {
    // Implement this function based on your Instrument type
    return instrument.toString();
}

function timeIter(from: number, to: number, increaseTimeBy: number): number[] {
    let result: number[] = [];
    for (let i = from; i < to; i += increaseTimeBy) {
        result.push(i);
    }
    result.push(to);
    return result;
}

@Injectable()
export class OandaService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

    oandaApiKey = this.configService.get<string>('OANDA_API_KEY');

    // async oandaAccountSummary(account:string): Promise<Summary> {
    
    //     const url = `https://api-fxpractice.oanda.com/v3/accounts/${oandaAccount}/summary`;
    
    //     try {
    //       const response = await firstValueFrom(this.httpService.get(url, {
    //         headers: {
    //           Authorization: `Bearer ${this.oandaApiKey}`,
    //         },
    //       }));
    
    //       const account = response.data.account;
    //       const pl = parseFloat(account.pl);
    //       const balance = parseFloat(account.balance);
    
    //       return {
    //         pl,
    //         balance,
    //       };
    //     } catch (error) {
    //       if (error instanceof AxiosError) {
    //         console.error(`${error.response?.data} ${error.config?.url}`);
    //         throw new HttpException('Oanda API error', HttpStatus.BAD_REQUEST);
    //       }
    //       throw new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    //   }

    async fetchHlocvOanda(instrument: Instrument, from: number, to: number): Promise<Tick[]> {
        const instrumentStr = fromInstrument(instrument);
        console.log("from", format(fromUnixTime(from / 1000), "yyyy-MM-dd'T'HH:mm:ss'Z'"));
        console.log("to", format(fromUnixTime(to / 1000), "yyyy-MM-dd'T'HH:mm:ss'Z'"));

        const increaseTimeBy = 21600000;
        const granularity = "S5";

        const urls = timeIter(from, to, increaseTimeBy)
            .reduce<string[]>((acc, _, i, arr) => {
                if (i % 2 === 0 && i < arr.length - 1) {
                    const f = getUnixTime(fromUnixTime(arr[i] / 1000));
                    const t = getUnixTime(fromUnixTime(arr[i + 1] / 1000));
                    acc.push(`https://api-fxtrade.oanda.com/v3/instruments/${instrumentStr.toUpperCase()}/candles?granularity=${granularity}&alignmentTimezone=UTC&from=${f}&to=${t}&smooth=false&price=BAM`);
                }
                return acc;
            }, []);

        const fromS = (x: string): Decimal => new Decimal(x).mul(10000);

        const results = await Promise.all(urls.map(async (url) => {
            try {
                const response = await this.httpService.axiosRef.get<OandaResponse>(url, {
                    headers: { 'Authorization': `Bearer ${this.oandaApiKey}` }
                });
                return response.data;
            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    console.error(`${error.response.data} ${url}`);
                } else {
                    console.error(`Error fetching data: ${error}`);
                }
                throw new Error("Request failed");
            }
        }));

        return results.flatMap(x => x.candles).map(x => {
            const ask = fromS(x.ask.c).toNumber();
            const bid = fromS(x.bid.c).toNumber();
            const mid = fromS(x.mid.c).toNumber();
            const v = new Decimal(x.volume).toNumber();
            return {
                ask: Math.round(ask),
                bid: Math.round(bid),
                mid: Math.round(mid),
                v: Math.round(v),
                dt: new Date(x.time).getTime(),
                instrument
            };
        });
    }


}
