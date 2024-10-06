//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Trade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tradeAbi =  [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "asset",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "price",
        "type": "uint32"
      }
    ],
    "name": "NewTick",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "asset",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct inEuint32",
        "name": "price",
        "type": "tuple"
      }
    ],
    "name": "addPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "asset",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct inEuint32",
        "name": "_qty",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct inEbool",
        "name": "_buy",
        "type": "tuple"
      }
    ],
    "name": "enterTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "asset",
        "type": "string"
      }
    ],
    "name": "exitTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "asset",
        "type": "string"
      }
    ],
    "name": "getPl",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "asset",
        "type": "string"
      }
    ],
    "name": "getTpl",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "asset",
        "type": "string"
      }
    ],
    "name": "isTrading",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "trades",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "qty",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "entry",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "p",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "l",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "tp",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "tl",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "ebool",
        "name": "buy",
        "type": "uint256"
      },
      {
        "internalType": "ebool",
        "name": "isTrading",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
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
