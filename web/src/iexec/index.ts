import { IExecDataProtector } from '@iexec/dataprotector';

const web3Provider = (window as any).ethereum;
// Instantiate using the umbrella module for full functionality
const dataProtector = new IExecDataProtector(web3Provider);

export const dataProtectorCore = dataProtector.core;
export const dataProtectorSharing = dataProtector.sharing;


export const protectData = async () => {
    const protectedData = await dataProtectorCore.protectData({
        data: {
          email: 'example@gmail.com',
        },
      });
      console.log(protectedData);
    return protectedData;
}

// export const shareData = async (data: string) => {
//     const sharedData = await dataProtectorSharing.share(data);
//     return sharedData;
// }