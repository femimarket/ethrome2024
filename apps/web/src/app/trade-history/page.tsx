"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Save, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Mock data for imported trading history
const mockTradingHistory = [
  { id: 1, date: "2023-06-01", pair: "BTC/USD", type: "Buy", amount: 0.5, price: 30000, profit: 500 },
  { id: 2, date: "2023-06-02", pair: "ETH/USD", type: "Sell", amount: 2, price: 1800, profit: -100 },
  { id: 3, date: "2023-06-03", pair: "BTC/USD", type: "Sell", amount: 0.3, price: 31000, profit: 300 },
  { id: 4, date: "2023-06-04", pair: "XRP/USD", type: "Buy", amount: 1000, price: 0.5, profit: 50 },
  { id: 5, date: "2023-06-05", pair: "ETH/USD", type: "Buy", amount: 1.5, price: 1750, profit: 75 },
]

export default function ImportedTradingHistory() {
  const [selectedTrades, setSelectedTrades] = useState<number[]>([])
  const [savingToBlockchain, setSavingToBlockchain] = useState(false)
  const [savedToBlockchain, setSavedToBlockchain] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTradeSelection = (tradeId: number) => {
    setSelectedTrades(prev => 
      prev.includes(tradeId) 
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
    )
  }


  const handleSaveToBlockchain = async () => {
    setSavingToBlockchain(true)



    

    // const protectData = async () => {
    //   const createCollectionResult = await dataProtectorSharing.createCollection();

      
    //   const { txHash } = await dataProtectorSharing.addToCollection({
    //     protectedData: protectedData.address,
    //     collectionId: createCollectionResult.collectionId,
    //     addOnlyAppWhitelist: '0x256bcd881c33bdf9df952f2a0148f27d439f2e64',
    //   });
    //   const setToSubscriptionResult =
    //     await dataProtectorSharing.setProtectedDataToSubscription({
    //       protectedData: protectedData.address,
    //     });
    //   await dataProtectorSharing.subscribeToCollection({
    //     collectionId: createCollectionResult.collectionId,
    //     price: 0, // 1 nRLC
    //     duration: 60 * 60 * 24 * 365, // 172,800 sec = 2 days
    //   });
    //   console.log(protectedData, 2233);
     
    //   console.log(listProtectedData, 111);
    //   const consumeProtectedDataResult =
    //     await dataProtectorSharing.consumeProtectedData({
    //       protectedData: protectedData.address,
    //       app: '0x1cb7D4F3FFa203F211e57357D759321C6CE49921',
    //     });
    //   console.log(consumeProtectedDataResult, 444);
    //   return protectedData;
    // }



    // Simulating blockchain interaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSavingToBlockchain(false)
    setSavedToBlockchain(true)
    setTransactionHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
  }

  const totalProfit = Number(searchParams.get("pl") || "0")

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Imported Trading History</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Review and Save Your Trading History</AlertTitle>
        <AlertDescription>
          Select the trades you want to save to the blockchain. This will create an immutable record of your trading performance.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trading Performance Summary</CardTitle>
          <CardDescription>Overview of your imported trading history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold">{mockTradingHistory.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Profit/Loss</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">
                {((mockTradingHistory.filter(trade => trade.profit > 0).length / mockTradingHistory.length) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle></CardTitle>
          {/* <CardDescription>Select trades to save to the blockchain</CardDescription> */}
        </CardHeader>
        {/* <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Profit/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTradingHistory.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTrades.includes(trade.id)}
                      onCheckedChange={() => handleTradeSelection(trade.id)}
                    />
                  </TableCell>
                  <TableCell>{trade.date}</TableCell>
                  <TableCell>{trade.pair}</TableCell>
                  <TableCell>
                    <Badge variant={trade.type === "Buy" ? "default" : "secondary"}>{trade.type}</Badge>
                  </TableCell>
                  <TableCell>{trade.amount}</TableCell>
                  <TableCell>${trade.price}</TableCell>
                  <TableCell className={trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${trade.profit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent> */}
        <CardFooter>
          <Button 
            onClick={handleSaveToBlockchain} 
            disabled={selectedTrades.length === 0 || savingToBlockchain || savedToBlockchain}
            className="w-full"
          >
            {savingToBlockchain ? (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4 animate-spin" /> Saving to Blockchain...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save to Blockchain
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {savedToBlockchain && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Successfully Saved to Blockchain</AlertTitle>
          <AlertDescription>
            Your selected trades have been saved to the blockchain. Transaction Hash:
            <Input 
              value={transactionHash} 
              readOnly 
              className="mt-2"
            />
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}