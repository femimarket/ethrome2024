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
import { parseEther, parseGwei } from "viem"
import Chart from "./chart"
import { SeriesMarker, Time, UTCTimestamp } from "lightweight-charts"
import { useRouter } from "next/navigation"
import { BrowserProvider, JsonRpcProvider, Contract } from 'ethers';
import { FheMath } from "@/lib/utils"
import {EncryptionTypes, FhenixClient} from "fhenixjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export interface SupportedProvider {
  request?(args: { method: string; params?: unknown[] }): Promise<unknown>;
  send?(method: string, params?: unknown[]): Promise<unknown>;
  getSigner?(): unknown;
  getSigner?(addressOrIndex?: string | number): Promise<unknown>;
}


interface Trade {
  price: number;
  dt: number;
  qty: number;
}



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
  "EUR_USD": {
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
  "EUR_USD": { price: 34825.00, change: 2.5 },
  "ETH/USD": { price: 2318.75, change: 1.8 },
  "XRP/USD": { price: 0.5345, change: -0.5 },
}





export default function TradingView() {
  const [orderType, setOrderType] = useState("market")
  const client = usePublicClient()
  const walletClient = useWalletClient()
  const [side, setSide] = useState("buy")
  const [qty, setQty] = useState(0)
  const [selectedPair, setSelectedPair] = useState("EUR_USD")
  const [markers, setMarkers] = useState<SeriesMarker<Time>[]>([])
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: hash, writeContract, error: writeError } = useWriteContract()
  const result = useSimulateContract()
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState<{ time: UTCTimestamp; value: number }|undefined>(undefined);
  const [ticks, setTicks] = useState<{ time: UTCTimestamp; value: number }[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pl, setPl] = useState<number>(0);
  const [tpl, setTpl] = useState<number>(0);
  const [isTrading, setIsTrading] = useState<boolean|undefined>(undefined);
  const [time, setTime] = useState<UTCTimestamp|undefined>(undefined);
  const [pendingTrade, setPendingTrade] = useState<boolean>(false);
  const [tradeAddress, setTradeAddress] = useState<`0x${string}` | undefined>(undefined)
  const router = useRouter()

  const _pl = useReadContract({
    abi:tradeAbi,
    address: tradeAddress as `0x${string}` | undefined,
    functionName: 'getPl',
    args: ['EUR_USD'],
  }); 

  const _tpl = useReadContract({
    abi:tradeAbi,
    address: tradeAddress as `0x${string}` | undefined,
    functionName: 'getTpl',
    args: ['EUR_USD'],
  }); 

  const _isTrading = useReadContract({
    abi:tradeAbi,
    address: tradeAddress as `0x${string}` | undefined,
    functionName: 'isTrading',
    args: ['EUR_USD'],
  }); 
  
  // Handler for changing the trading pair
  const handlePairChange = (newPair: string) => {
    setSelectedPair(newPair)
  }

const eurUsdTradingHistory = trades.map((trade) => {
  const tick = ticks.find((tick) => tick.time === trade.dt)
  const _trade = {
    dt: trade.dt,
    price: tick!!.value,
    qty: trade.qty
  }
  return _trade
})
  const tradingHistoryData: { [key: string]: Trade[] } = {
    "EUR_USD": eurUsdTradingHistory,
  }


  useEffect(() => {
    const _tradeAddress = localStorage.getItem('tradeAddress')
    if (!!_tradeAddress) {
      setTradeAddress(_tradeAddress as `0x${string}`)
    } else {
      router.push('/')
    }

    const _localTrades = localStorage.getItem("trades")
    const _trades = !!_localTrades ? JSON.parse(_localTrades) : [];
    if (_trades.length > 0 ) {
      setTrades(_trades)
      localStorage.setItem("trades", JSON.stringify(_trades))
    }

    const _localMarkers = localStorage.getItem("markers")
    const _markers = !!_localMarkers ? JSON.parse(_localMarkers) : [];
    if (_markers.length > 0 ) {
      setMarkers(_markers)
      localStorage.setItem("markers", JSON.stringify(_markers))
    }


    const _localTicks = localStorage.getItem("ticks")
    let _ticks = !!_localTicks ? JSON.parse(_localTicks) : [];
    if (_ticks.length > 0) {
      setTicks(_ticks)
    } else {
      _ticks = [
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
      setTicks(_ticks)
      localStorage.setItem("ticks", JSON.stringify(_ticks))
    }

  }, [])




  useEffect(() => {
    if (pendingTrade && !!time) {
      setPendingTrade(false)
      const _markers = markers
      _markers.push({
        time:time!!,
        position: side === "buy" ? 'belowBar' : "aboveBar",
        color: side === "buy" ? 'green' : "red",
        shape: side === "buy" ? 'arrowUp' : "arrowDown",
      });
      
      console.log("markers", _markers, side)
      setMarkers(_markers)
      localStorage.setItem("markers", JSON.stringify(_markers))
      setTime(undefined)

      const _trades = trades
      _trades.push({
        dt:time!!,
        price: tick!!.value,
        qty,
      });
      setTrades(_trades)
      localStorage.setItem("trades", JSON.stringify(_trades))

      setQty(0);
    }
  }, [pendingTrade, time])

  useEffect(() => {
    if (!!_pl.data) {
      const p = _pl.data[0];
      const l = _pl.data[1];
      setPl(p-l)
    }
  }, [_pl.data])
  useEffect(() => {
    if (!!_tpl.data) {
      const p = _tpl.data[0];
      const l = _tpl.data[1];
      setTpl(p-l)
    }
  }, [_tpl.data])

  useEffect(() => {
    if (!!_isTrading.data) {
      setIsTrading(_isTrading.data)
    }
  }, [_isTrading.data])


  console.log("pl you", pl)
  console.log("tpl you", tpl)
  console.log("isTrading", _isTrading.data)
  console.log("ticks", ticks)

  // useEffect(() => {
  //   if (!!writeError) {
  //     console.log("writeError", writeError);
  //    const _markers = markers
  //    _markers.pop();
  //    setMarkers(_markers)
  //   }
  // }, [writeError])

  useWatchContractEvent({
    address: tradeAddress,
    abi:tradeAbi,
    eventName: 'NewTick',
    syncConnectedChain:true,
    onLogs(logs) {
      logs.forEach((log) => {
        const time = new Date().valueOf()/1000 as UTCTimestamp;
        setTick({time, value: Number(log.args.price!!)})
        const _ticks = ticks
        _ticks.push({time, value: Number(log.args.price!!)})
        localStorage.setItem("ticks", JSON.stringify(_ticks))
        setTime(time)
        _pl.refetch()
        _tpl.refetch()
        _isTrading.refetch()
        console.log('New Tick!', log)
      })
    },
    onError(error) {
      console.log('Error!', error)
    }
  })
  



  


  const marketOrder = async () => {
    setPendingTrade(true)
 
    // const { FhenixClient } = await (eval(`import('fhenixjs')`) as Promise<typeof import('fhenixjs')>);
    const provider = new BrowserProvider(window.ethereum);

const fhenixClient = new FhenixClient({ provider });
let eqty = await fhenixClient.encrypt_uint32(qty);
let ebuy = await fhenixClient.encrypt_bool(side === "buy");



const contract = new Contract(tradeAddress as `0x${string}`, tradeAbi)
const c = contract.connect(await provider.getSigner())
const tx =  await c.enterTrade("EUR_USD", eqty,ebuy )
console.log("tx", tx)


    // writeContract({
    //   abi:tradeAbi,
    //   address: tradeAddress!!,
    //   functionName: 'enterTrade',
    //   args: ["EUR_USD", eqty,ebuy],
    //   gas: parseGwei('200000000'), 
      
    // }); 

  }

  




  console.log("hash", hash,writeError,isTrading)
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
       
    
   
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Select value={selectedPair} onValueChange={handlePairChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select trading pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR_USD">EUR_USD</SelectItem>
            </SelectContent>
          </Select>
          <h1 className="text-2xl font-bold">{selectedPair}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold">{ (tick?.value?.toFixed(2)) || "..."}</span>
          <span className={`flex items-center ${currentPrices[selectedPair].change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {currentPrices[selectedPair].change >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {Math.abs(currentPrices[selectedPair].change)}%
          </span>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 h-full">
            <Chart tick={tick} ticks={ticks} markers={markers} />
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
                    <td className="py-2">{new Date(trade.dt * 1000).toLocaleTimeString()}</td>
                    <td className="py-2">{trade.price.toFixed(4)}</td>
                    <td className="py-2">{trade.qty}</td>
                    <td className={`py-2 ${trade.qty > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.qty > 0 ? "Buy" : "Sell"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-80 border-l p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Performance</h2>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                {pl >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Number(pl).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Realized: ${pl.toFixed(2)} | Unrealized: ${tpl.toFixed(2)}
                </p>
              </CardContent>
            </Card>
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
                  {isTrading !== undefined && !isTrading && (
                    <>
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
                    <Input id="amount" type="number" placeholder="0" step="1" onChange={(e) => setQty(Number(e.target.value))} />
                  </div>
                    </>
                  )}
                  
                  {!isTrading || isTrading === undefined ? 
                    <Button className="w-full" onClick={marketOrder} disabled={isTrading !== undefined && isTrading}>Enter Market Order</Button> : 
                    <Button className="w-full" onClick={marketOrder} disabled={!isTrading}>Exit Market Order</Button>
                  }
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