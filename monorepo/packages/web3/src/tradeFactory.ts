import { Chain, createPublicClient, getContract, parseEther, WalletClient } from 'viem'
import { tradeFactoryAbi } from './generated.js';
 


export const tradeFactory = (
  walletClient: WalletClient,
  chain: Chain,
  address: `0x${string}`
) => {
  const contract = getContract({
    address,
    abi: tradeFactoryAbi,
    client: walletClient,
  })!!;

  return ({
    async deployTrade(){
      return await contract.write.deployTrade({
        account: walletClient.account!!.address,
        chain,
        value: parseEther('0.1'),
      })
    }

  })

}