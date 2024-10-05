import { Chain, createPublicClient, getContract, parseEther, WalletClient } from 'viem'
import { tradeAbi, tradeFactoryAbi } from './generated.js';
 


// export const tradeFactory = (
//   walletClient: WalletClient,
//   chain: Chain,
//   address: `0x${string}`
// ) => {
//   const contract = getContract({
//     address,
//     abi: tradeAbi,
//     client: walletClient,
//   })!!;

//   const opt = {account: walletClient.account!!.address, chain};

//   return ({
//     async addPrice(asset: string, price: bigint) {
//       return await contract.write.addPrice(
//         [ asset, price],
//         {
//           ...opt
//         }
//       )
//     }

//   })

// }