/// <reference types="react-scripts" />

interface Window {
    ethereum: any;
  }

  declare global {
    interface Window {
      ethereum?: import('ethers').providers.ExternalProvider;
    }
  }