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
import { providers } from 'ethers'


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

const tradeFactoryAddress = '0x16293836D97B2836e8fcfdD4529c596ff5dC6581'

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
    const client = new FhenixClient({ provider:new JsonRpcProvider("http://localhost:8545") });


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
            let result: EncryptedUint32 = await client.encrypt(number, EncryptionTypes.uint32);
            const result = await writeContract(config, {
                abi: tradeAbi,
                address: tradeAddress,
                functionName: 'addPrice',
                args: [
                    'EUR_USD',
                    randomIntFromInterval(1000,2000),
                ],
                account: this.account,
                chain: localFhenix
            });
            const receipt = await waitForTransactionReceipt(config, {hash: result, chainId: localFhenix.id, })
            // console.log(receipt)
        }));

    }
}




