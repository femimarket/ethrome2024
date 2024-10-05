//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Trade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tradeAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_owner', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'string', type: 'string' },
      { name: 'price', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'addPrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'string', type: 'string' },
      { name: '_qty', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'addTrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'string', type: 'string' }],
    name: 'getPl',
    outputs: [{ name: '', internalType: 'int32', type: 'int32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'trades',
    outputs: [
      { name: 'price', internalType: 'uint32', type: 'uint32' },
      { name: 'qty', internalType: 'uint32', type: 'uint32' },
      { name: 'entry', internalType: 'uint32', type: 'uint32' },
      { name: 'pl', internalType: 'uint32', type: 'uint32' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'buy', internalType: 'ebool', type: 'uint256' },
      { name: 'init', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'asset', internalType: 'string', type: 'string', indexed: false },
      { name: 'price', internalType: 'uint32', type: 'uint32', indexed: false },
    ],
    name: 'NewTick',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TradeFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tradeFactoryAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'deployTrade',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deploymentFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'deployedAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TradeDeployed',
  },
] as const
