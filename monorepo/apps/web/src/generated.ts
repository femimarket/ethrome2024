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
      {
        name: 'price',
        internalType: 'struct inEuint32',
        type: 'tuple',
        components: [
          { name: 'data', internalType: 'bytes', type: 'bytes' },
          { name: 'securityZone', internalType: 'int32', type: 'int32' },
        ],
      },
    ],
    name: 'addPrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'asset', internalType: 'string', type: 'string' },
      {
        name: '_qty',
        internalType: 'struct inEuint32',
        type: 'tuple',
        components: [
          { name: 'data', internalType: 'bytes', type: 'bytes' },
          { name: 'securityZone', internalType: 'int32', type: 'int32' },
        ],
      },
      { name: '_buy', internalType: 'ebool', type: 'uint256' },
    ],
    name: 'enterTrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'string', type: 'string' }],
    name: 'exitTrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'asset', internalType: 'string', type: 'string' }],
    name: 'getPl',
    outputs: [
      { name: '', internalType: 'euint32', type: 'uint256' },
      { name: '', internalType: 'euint32', type: 'uint256' },
    ],
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
      { name: 'price', internalType: 'euint32', type: 'uint256' },
      { name: 'qty', internalType: 'euint32', type: 'uint256' },
      { name: 'entry', internalType: 'euint32', type: 'uint256' },
      { name: 'p', internalType: 'euint32', type: 'uint256' },
      { name: 'l', internalType: 'euint32', type: 'uint256' },
      { name: 'tp', internalType: 'euint32', type: 'uint256' },
      { name: 'tl', internalType: 'euint32', type: 'uint256' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'buy', internalType: 'ebool', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'asset', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'price',
        internalType: 'euint32',
        type: 'uint256',
        indexed: false,
      },
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
