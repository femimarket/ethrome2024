"use client"

import { useEffect, useRef, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { useAccount, useClient, useConnect, useDisconnect, usePublicClient, useSimulateContract, useWalletClient, useWatchContractEvent, useWriteContract, useReadContract } from "wagmi"
import { tradeFactoryAbi, tradeAbi   } from "@/generated"
import { parseEther } from "viem"
import Chart from "./chart"
import { UTCTimestamp } from "lightweight-charts"
import { useRouter } from "next/navigation"

// Mock data for the chart (now with multiple assets)
const chartData: { [key: string]: { name: string; price: number }[] } = {
  "BTC/USD": [
    { name: "00:00", price: 33000 },
    { name: "04:00", price: 34200 },
    { name: "08:00", price: 33800 },
    { name: "12:00", price: 34500 },
    { name: "16:00", price: 34100 },
    { name: "20:00", price: 34800 },
    { name: "24:00", price: 35000 },
  ],
  "ETH/USD": [
    { name: "00:00", price: 2200 },
    { name: "04:00", price: 2250 },
    { name: "08:00", price: 2180 },
    { name: "12:00", price: 2300 },
    { name: "16:00", price: 2280 },
    { name: "20:00", price: 2350 },
    { name: "24:00", price: 2400 },
  ],
  "XRP/USD": [
    { name: "00:00", price: 0.50 },
    { name: "04:00", price: 0.52 },
    { name: "08:00", price: 0.51 },
    { name: "12:00", price: 0.53 },
    { name: "16:00", price: 0.52 },
    { name: "20:00", price: 0.54 },
    { name: "24:00", price: 0.55 },
  ],
}

// Mock data for the order book (now with multiple assets)
const orderBookData: { [key: string]: { asks: { price: number; amount: number }[]; bids: { price: number; amount: number }[] } } = {
  "BTC/USD": {
    asks: [
      { price: 34850, amount: 1.2 },
      { price: 34900, amount: 0.8 },
      { price: 34950, amount: 2.5 },
    ],
    bids: [
      { price: 34800, amount: 1.5 },
      { price: 34750, amount: 2.0 },
      { price: 34700, amount: 1.8 },
    ],
  },
  "ETH/USD": {
    asks: [
      { price: 2320, amount: 5.5 },
      { price: 2325, amount: 3.2 },
      { price: 2330, amount: 7.8 },
    ],
    bids: [
      { price: 2315, amount: 4.7 },
      { price: 2310, amount: 6.1 },
      { price: 2305, amount: 5.3 },
    ],
  },
  "XRP/USD": {
    asks: [
      { price: 0.535, amount: 10000 },
      { price: 0.536, amount: 8500 },
      { price: 0.537, amount: 12000 },
    ],
    bids: [
      { price: 0.534, amount: 9500 },
      { price: 0.533, amount: 11000 },
      { price: 0.532, amount: 9000 },
    ],
  },
}

// Mock current prices and changes
const currentPrices: { [key: string]: { price: number; change: number } } = {
  "BTC/USD": { price: 34825.00, change: 2.5 },
  "ETH/USD": { price: 2318.75, change: 1.8 },
  "XRP/USD": { price: 0.5345, change: -0.5 },
}

// Mock trading history data
const tradingHistoryData: { [key: string]: { time: string; price: number; amount: number; type: string }[] } = {
  "BTC/USD": [
    { time: "14:30:15", price: 34825.00, amount: 0.5, type: "buy" },
    { time: "14:29:58", price: 34820.50, amount: 0.3, type: "sell" },
    { time: "14:29:30", price: 34822.75, amount: 0.7, type: "buy" },
    { time: "14:28:45", price: 34818.25, amount: 0.2, type: "sell" },
    { time: "14:28:15", price: 34819.50, amount: 0.4, type: "buy" },
  ],
  "ETH/USD": [
    { time: "14:30:10", price: 2318.75, amount: 2.5, type: "buy" },
    { time: "14:29:55", price: 2318.50, amount: 1.8, type: "sell" },
    { time: "14:29:25", price: 2319.00, amount: 3.2, type: "buy" },
    { time: "14:28:50", price: 2317.75, amount: 1.5, type: "sell" },
    { time: "14:28:20", price: 2318.25, amount: 2.0, type: "buy" },
  ],
  "XRP/USD": [
    { time: "14:30:05", price: 0.5345, amount: 5000, type: "sell" },
    { time: "14:29:50", price: 0.5344, amount: 7500, type: "buy" },
    { time: "14:29:20", price: 0.5346, amount: 6000, type: "sell" },
    { time: "14:28:55", price: 0.5343, amount: 8000, type: "buy" },
    { time: "14:28:25", price: 0.5345, amount: 5500, type: "sell" },
  ],
}

export default function TradingView() {
  const [orderType, setOrderType] = useState("market")
  const client = usePublicClient()
  const walletClient = useWalletClient()
  const [side, setSide] = useState("buy")
  const [selectedPair, setSelectedPair] = useState("BTC/USD")
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: hash, writeContract, error: writeError } = useWriteContract()
  const result = useSimulateContract()
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState<{ time: UTCTimestamp; value: number }|undefined>(undefined);
  const [tradeAddress, setTradeAddress] = useState<`0x${string}` | undefined>(undefined)
  const router = useRouter()
  const ticks =  [
    { time: new Date('2023-01-01').valueOf()/1000 as UTCTimestamp, value: 1251 },
    { time: new Date('2023-01-02').valueOf()/1000 as UTCTimestamp, value: 1111 },
    { time: new Date('2023-01-03').valueOf()/1000 as UTCTimestamp, value: 1702 },
    { time: new Date('2023-01-04').valueOf()/1000 as UTCTimestamp, value: 1732 },
    { time: new Date('2023-01-05').valueOf()/1000 as UTCTimestamp, value: 1517 },
    { time: new Date('2023-01-06').valueOf()/1000 as UTCTimestamp, value: 1889 },
    { time: new Date('2023-01-07').valueOf()/1000 as UTCTimestamp, value: 1546 },
    { time: new Date('2023-01-08').valueOf()/1000 as UTCTimestamp, value: 1392 },
    { time: new Date('2023-01-09').valueOf()/1000 as UTCTimestamp, value: 1268 },
    { time: new Date('2023-01-10').valueOf()/1000 as UTCTimestamp, value: 1267 },
  ];

  // Handler for changing the trading pair
  const handlePairChange = (newPair: string) => {
    setSelectedPair(newPair)
  }

  const factoryContractAddress = '0xBEabf0cc91baB05CD78933312035A186307687e4'


  useEffect(() => {
    const _tradeAddress = localStorage.getItem('tradeAddress')
    if (!!_tradeAddress) {
      setTradeAddress(_tradeAddress as `0x${string}`)
    } else {
      router.push('/')
    }
  }, [])

  useWatchContractEvent({
    address: tradeAddress,
    abi:tradeAbi,
    eventName: 'NewTick',
    syncConnectedChain:true,
    onLogs(logs) {
      logs.forEach((log) => {
        setTick({time: new Date().valueOf()/1000 as UTCTimestamp, value: log.args.price!!})
        console.log('New Tick!', log)
      })
    },
    onError(error) {
      console.log('Error!', error)
    }
  })
  

  const deployContract = async () => {
    writeContract({
      abi:tradeFactoryAbi,
      address: factoryContractAddress,
      functionName: 'deployTrade',
      value: parseEther("0.1"),
    }); 
  }

  const ret = useReadContract({
    abi:tradeAbi,
    address: tradeAddress as `0x${string}` | undefined,
    functionName: 'getPl',
    args: ['EUR_USD'],
  }); 


  const getPl = async () => {
    console.log("getPl")
    await ret.refetch()
    console.log(ret)
  }

  console.log(ret)



  console.log("hash", hash,writeError)
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
       
       if (!!tradeAddress) {
        <Button type="button" onClick={getPl}>
        Get PL
      </Button>
       }
      <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

    </>
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Select value={selectedPair} onValueChange={handlePairChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select trading pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC/USD">BTC/USD</SelectItem>
              <SelectItem value="ETH/USD">ETH/USD</SelectItem>
              <SelectItem value="XRP/USD">XRP/USD</SelectItem>
            </SelectContent>
          </Select>
          <h1 className="text-2xl font-bold">{selectedPair}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold">{currentPrices[selectedPair].price.toFixed(2)}</span>
          <span className={`flex items-center ${currentPrices[selectedPair].change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {currentPrices[selectedPair].change >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {Math.abs(currentPrices[selectedPair].change)}%
          </span>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 h-full">
            <Chart tick={tick} ticks={ticks} />
            {/* <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData[selectedPair]}>
                <XAxis dataKey="name" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer> */}
          </div>
          <div className="h-64 mt-4 overflow-auto">
            <h2 className="text-lg font-semibold mb-2">Trading History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {tradingHistoryData[selectedPair].map((trade, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2">{trade.time}</td>
                    <td className="py-2">{trade.price.toFixed(4)}</td>
                    <td className="py-2">{trade.amount}</td>
                    <td className={`py-2 ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.type.charAt(0).toUpperCase() + trade.type.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-80 border-l p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Order Book</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <h3 className="font-medium text-green-500">Bids</h3>
                {orderBookData[selectedPair].bids.map((bid, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{bid.price.toFixed(2)}</span>
                    <span>{bid.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-medium text-red-500">Asks</h3>
                {orderBookData[selectedPair].asks.map((ask, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{ask.price.toFixed(2)}</span>
                    <span>{ask.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Place Order</h2>
            <Tabs defaultValue="market" className="w-full" onValueChange={setOrderType}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="market">Market</TabsTrigger>
                {/* <TabsTrigger value="limit">Limit</TabsTrigger> */}
              </TabsList>
              <TabsContent value="market">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={side === "buy" ? "default" : "outline"}
                      onClick={() => setSide("buy")}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={side === "sell" ? "default" : "outline"}
                      onClick={() => setSide("sell")}
                    >
                      Sell
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Qty</Label>
                    <Input id="amount" type="number" placeholder="0" step="1" />
                  </div>
                  <Button className="w-full">Place Market Order</Button>
                </div>
              </TabsContent>
              <TabsContent value="limit">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={side === "buy" ? "default" : "outline"}
                      onClick={() => setSide("buy")}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={side === "sell" ? "default" : "outline"}
                      onClick={() => setSide("sell")}
                    >
                      Sell
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit-price">Price ({selectedPair.split('/')[1]})</Label>
                    <Input id="limit-price" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit-amount">Amount ({selectedPair.split('/')[0]})</Label>
                    <Input id="limit-amount" type="number" placeholder="0.00" />
                  </div>
                  <Button className="w-full">Place Limit Order</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}