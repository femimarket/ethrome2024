import { Injectable, Logger } from '@nestjs/common';
import { parseEther } from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
// import { http, cookieStorage, createStorage, webSocket, writeContract } from '@wagmi/core'
import { Chain, mainnet, sepolia } from '@wagmi/core/chains'
import { ConfigService } from '@nestjs/config';
import { tradeAbi, tradeFactoryAbi } from "../../generated";
import { Tick } from '../oanda/oanda.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TradeAddress } from 'src/entity/trade.entity';
import { Repository } from 'typeorm';
import { FhenixClient, EncryptedUint8,  } from 'fhenixjs';
import { JsonRpcProvider } from 'ethers'

export class FheMath {
    private static readonly OFFSET: number = 1 << 31;
  
    static fromInt(x: number): number {
        return (x + FheMath.OFFSET) >>> 0;
    }
  
    static toInt(x: number): number {
        return (x - FheMath.OFFSET) | 0;
    }
  
    static add(a: number, b: number): number {
        return (a + b - FheMath.OFFSET) >>> 0;
    }
  
    static sub(a: number, b: number): number {
        return (a - b + FheMath.OFFSET) >>> 0;
    }
  
    static negate(x: number): number {
        return (2 * FheMath.OFFSET - x) >>> 0;
    }
  
    static mul(a: number, b: number): number {
        const isNegativeA = a < FheMath.OFFSET;
        const isNegativeB = b < FheMath.OFFSET;
        const isNegative = isNegativeA !== isNegativeB;
  
        const absA = isNegativeA ? FheMath.OFFSET - a : a - FheMath.OFFSET;
        const absB = isNegativeB ? FheMath.OFFSET - b : b - FheMath.OFFSET;
  
        const absResult = Math.floor((absA * absB) / FheMath.OFFSET);
        return (isNegative ? FheMath.OFFSET - absResult : FheMath.OFFSET + absResult) >>> 0;
    }
  
    static div(a: number, b: number): number {
        if (b === FheMath.OFFSET) {
            throw new Error("Math: division by zero");
        }
  
        const isNegativeA = a < FheMath.OFFSET;
        const isNegativeB = b < FheMath.OFFSET;
        const isNegative = isNegativeA !== isNegativeB;
  
        const absA = isNegativeA ? FheMath.OFFSET - a : a - FheMath.OFFSET;
        const absB = isNegativeB ? FheMath.OFFSET - b : b - FheMath.OFFSET;
  
        const absResult = Math.floor((absA * FheMath.OFFSET) / absB);
        return (isNegative ? FheMath.OFFSET - absResult : FheMath.OFFSET + absResult) >>> 0;
    }
  
    static isNegative(x: number): boolean {
        return x < FheMath.OFFSET;
    }
  
    static abs(x: number): number {
        return x < FheMath.OFFSET ? (2 * FheMath.OFFSET - x) >>> 0 : x;
    }
  }


const localFhenix = {
    id: 412346,
    name: 'LocalFhenix',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['http://localhost:8547'], webSocket: ['ws://localhost:8548'] },
    },
} as const satisfies Chain

function randomIntFromInterval(min: number, max: number) { // min and max included 
    
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const tradeFactoryAddress = '0x9F8A89f254179e3ce602869aBa821885083969A4'

@Injectable()
export class EthService {
    constructor(
        @InjectRepository(TradeAddress)
        private readonly tradeAddressRepository: Repository<TradeAddress>,
        private readonly configService: ConfigService,

    ) { }
    private readonly logger = new Logger(EthService.name);

    privateKey = this.configService.get<`0x${string}`>('ETH_PRIVATE_KEY');
    account = privateKeyToAccount(this.privateKey)

// initialize Fhenix Client
    // client = new FhenixClient({ provider:new JsonRpcProvider("http://localhost:8547") });


    async watchContract() {
        const { createConfig, webSocket, simulateContract, writeContract, waitForTransactionReceipt, getTransactionReceipt, watchContractEvent } = await (eval(`import('@wagmi/core')`) as Promise<typeof import('@wagmi/core')>);
        const config = createConfig({
            chains: [localFhenix],
            transports: {
                [localFhenix.id]: webSocket(),
            },
        });
        console.log("hello matssss e");
        const unwatch = watchContractEvent(config, {
            address:tradeFactoryAddress,
            abi: tradeFactoryAbi,
            eventName: 'TradeDeployed',
            onLogs: (logs) => {
                console.log('New logs!', logs)
                logs.forEach(log => {
                    const address = log.args.deployedAddress as string;
                    this.tradeAddressRepository.save({ address: address });
                })
            },
            onError(error) {
                console.log('Error!', error)
            }  
        })
    }

    async addTick() {

        const tradeAddresses = await this.tradeAddressRepository.find();


        const { createConfig, http, simulateContract, writeContract, waitForTransactionReceipt, getTransactionReceipt } = await (eval(`import('@wagmi/core')`) as Promise<typeof import('@wagmi/core')>);


        const config = createConfig({ 
            chains: [localFhenix],
            transports: {
                [localFhenix.id]: http(),
            },
        });   


        for await (const res of tradeAddresses.map(f => f.address as `0x${string}`).map(async (tradeAddress) => {
            // let result: EncryptedUint32 = await client.encrypt(number, EncryptionTypes.uint32);
            const result = await writeContract(config, {
                abi: tradeAbi,
                address: tradeAddress,
                functionName: 'addPrice',
                args: [
                    'EUR_USD',
                    BigInt(randomIntFromInterval(10000, 20000)),
                ],
                account: this.account,
                chain: localFhenix
            });
            const receipt = await waitForTransactionReceipt(config, {hash: result, chainId: localFhenix.id, })
            // console.log(receipt)
        }));

        console.log(tradeAddresses.length, "tradeAddresses")

    }
}




