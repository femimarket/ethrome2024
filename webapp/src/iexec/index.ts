import { IExecDataProtector } from '@iexec/dataprotector';

const web3Provider = (window as any).ethereum;
// Instantiate using the umbrella module for full functionality
const dataProtector = new IExecDataProtector(web3Provider);

export const dataProtectorCore = dataProtector.core;
export const dataProtectorSharing = dataProtector.sharing;


export const protectData = async () => {
  const createCollectionResult = await dataProtectorSharing.createCollection();
  
    const protectedData = await dataProtectorCore.protectData({
        data: { 
          email: 'example@gmail.com',
        },
        
      });
      const { txHash } = await dataProtectorSharing.addToCollection({
        protectedData: protectedData.address,
        collectionId: createCollectionResult.collectionId,
        addOnlyAppWhitelist: '0x256bcd881c33bdf9df952f2a0148f27d439f2e64',
      });
      const setToSubscriptionResult =
  await dataProtectorSharing.setProtectedDataToSubscription({
    protectedData: protectedData.address,
  });
  await dataProtectorSharing.subscribeToCollection({
    collectionId: createCollectionResult.collectionId,
    price: 0, // 1 nRLC
    duration: 60 * 60 * 24 * 365, // 172,800 sec = 2 days
  });
      console.log(protectedData,2233);
      const listProtectedData = await dataProtectorCore.getProtectedData({
        owner: "0x881FC311506B1Dd04c5A73455ceeA2fB99658779",
        requiredSchema: {
          email: 'string',
        },
      });
      console.log(listProtectedData,111);
      const consumeProtectedDataResult =
  await dataProtectorSharing.consumeProtectedData({
    protectedData: protectedData.address,
    app: '0x1cb7D4F3FFa203F211e57357D759321C6CE49921',
  });
console.log(consumeProtectedDataResult,444);
    return protectedData;
}

// export const shareData = async (data: string) => {
//     const sharedData = await dataProtectorSharing.share(data);
//     return sharedData;
// }