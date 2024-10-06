"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, AlertCircle, DollarSign, TrendingUp, BarChart2 } from "lucide-react"

interface Trader {
  id: string
  name: string
  winRate: number
  profitFactor: number
  totalReturn: number
  maxDrawdown: number
}

const traders: Trader[] = [
  { id: "1", name: "Alice Smith", winRate: 68, profitFactor: 2.5, totalReturn: 45, maxDrawdown: 15 },
  { id: "2", name: "Bob Johnson", winRate: 72, profitFactor: 2.8, totalReturn: 52, maxDrawdown: 12 },
  { id: "3", name: "Charlie Brown", winRate: 65, profitFactor: 2.2, totalReturn: 38, maxDrawdown: 18 },
  { id: "4", name: "Diana Lee", winRate: 70, profitFactor: 2.6, totalReturn: 48, maxDrawdown: 14 },
]

export default function TraderSelection() {
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [totalAllocated, setTotalAllocated] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleAllocation = (traderId: string, amount: string) => {
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      setError("Please enter a valid positive number.")
      return
    }

    setAllocations(prev => ({ ...prev, [traderId]: numAmount }))
    setTotalAllocated(Object.values({ ...allocations, [traderId]: numAmount }).reduce((a, b) => a + b, 0))
    setError(null)
  }

  const handleSubmit = () => {
    if (totalAllocated === 0) {
      setError("Please allocate some capital before submitting.")
      return
    }
    // Here you would typically send the allocation data to your backend
    console.log("Submitting allocations:", allocations)
    setError(null)
    // Reset allocations after submission
    setAllocations({})
    setTotalAllocated(0)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Select Profitable Traders</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Investor Dashboard</AlertTitle>
        <AlertDescription>
          Allocate your capital to top-performing traders. Their performance is verified using blockchain technology and zero-knowledge proofs.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trader Performance</CardTitle>
          <CardDescription>Select traders to allocate your capital</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trader</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Profit Factor</TableHead>
                <TableHead>Total Return</TableHead>
                <TableHead>Max Drawdown</TableHead>
                <TableHead>Allocate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traders.map((trader) => (
                <TableRow key={trader.id}>
                  <TableCell className="font-medium">{trader.name}</TableCell>
                  <TableCell>{trader.winRate}%</TableCell>
                  <TableCell>{trader.profitFactor}</TableCell>
                  <TableCell>{trader.totalReturn}%</TableCell>
                  <TableCell>{trader.maxDrawdown}%</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={allocations[trader.id] || ""}
                        onChange={(e) => handleAllocation(trader.id, e.target.value)}
                        className="w-24"
                      />
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allocation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Total Allocated:</span>
            </div>
            <span className="text-2xl font-bold">${totalAllocated.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Submit Allocations
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics Explained</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <Badge variant="outline">Win Rate</Badge>
              <span className="text-sm text-muted-foreground">Percentage of profitable trades</span>
            </li>
            <li className="flex items-start space-x-2">
              <Badge variant="outline">Profit Factor</Badge>
              <span className="text-sm text-muted-foreground">Ratio of gross profit to gross loss</span>
            </li>
            <li className="flex items-start space-x-2">
              <Badge variant="outline">Total Return</Badge>
              <span className="text-sm text-muted-foreground">Overall percentage gain on initial capital</span>
            </li>
            <li className="flex items-start space-x-2">
              <Badge variant="outline">Max Drawdown</Badge>
              <span className="text-sm text-muted-foreground">Largest peak-to-trough decline in account value</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}