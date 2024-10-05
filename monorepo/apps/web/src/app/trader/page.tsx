"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, AlertCircle, FileUp, PlayCircle, DollarSign, Code2 } from "lucide-react"
import { tradeFactoryAbi } from "@/generated"
import { parseEther } from "viem"
import { useConnect, useWatchContractEvent, useWriteContract } from "wagmi"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TradingTest() {
    const [file, setFile] = useState<File | null>(null)
    const [testFee, setTestFee] = useState<number>(0.1) // Default test fee
    const [tradeAddress, setTradeAddress] = useState<`0x${string}` | undefined>(undefined)
    const [broker, setBroker] = useState("oanda")
    const [isVerifying, setIsVerifying] = useState(false)
    const handleBrokerChange = (value: string) => {
    setBroker(value)
  }
    const factoryContractAddress = '0x16293836D97B2836e8fcfdD4529c596ff5dC6581'
    const router = useRouter()
    const { connectors, connect, status, error } = useConnect()

    useEffect(() => {
        const _tradeAddress = localStorage.getItem('tradeAddress')
        if (!!_tradeAddress) {
            setTradeAddress(_tradeAddress as `0x${string}`)
        }
    }, [])

    useEffect(() => {
        if (!!tradeAddress) {
            router.push(`/trade?tradeAddress=${tradeAddress}`)
        }
    }, [tradeAddress])

    useWatchContractEvent({
        address: factoryContractAddress,
        abi: tradeFactoryAbi,
        eventName: 'TradeDeployed',
        syncConnectedChain: true,
        onLogs(logs) {
            logs.forEach((log) => {
                const _tradeAddress = log.args.deployedAddress
                if (!!_tradeAddress) {
                    setTradeAddress(_tradeAddress)
                    localStorage.setItem('tradeAddress', _tradeAddress)
                }
                console.log('New logs!', log)
            })
        },
        onError(error) {
            console.log('Error!', error)
        }
    })

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0])
        }
    }

    const { data: hash, writeContract, error: writeError } = useWriteContract()


    const handleStartTest = () => {
        const connector = connectors.find((connector) => connector.name == "MetaMask");
        if (!!connector) {
            connect({
                connector,
            }, {
                onSuccess(data) {

                },
                onError(error) {
                    console.log("Error connecting to MetaMask", error)
                },
                onSettled(data, error) {
                    writeContract({
                        abi: tradeFactoryAbi,
                        address: factoryContractAddress,
                        functionName: 'deployTrade',
                        value: parseEther("0.1"),
                    });
                }
            })
        } else {
            console.log("MetaMask connector not found");
        }
    }

    const handleImportHistory = () => {
        if (file) {
            console.log("Importing trading history:", file.name)
            // Implement file import logic here
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Proof of Profit Trading Protocol</h1>

            <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Welcome to our Proof of Profit platform!</AlertTitle>
                <AlertDescription>
                    Demonstrate your trading skills and gain access to capital. Choose to start a new test or import your existing trading history. A smart contract will be deployed to receive price feeds for your trades.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="start-test" className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="start-test">Start New Test</TabsTrigger>
                    <TabsTrigger value="import-history">Import Trading History</TabsTrigger>
                </TabsList>
                <TabsContent value="start-test">
                    <Card>
                        <CardHeader>
                            <CardTitle>Start a New Trading Test</CardTitle>
                            <CardDescription>Begin a simulated trading session to prove your profitability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="test-duration">Test Duration</Label>
                                    <select id="test-duration" className="w-full p-2 border rounded">
                                        <option value="1-week">1 Week</option>
                                        <option value="2-weeks">2 Weeks</option>
                                        <option value="1-month">1 Month</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="initial-capital">Initial Capital</Label>
                                    <Input id="initial-capital" type="number" placeholder="100000" disabled value="100000" />
                                </div>
                                <Alert>
                                    <DollarSign className="h-4 w-4" />
                                    <AlertTitle>Test Fee</AlertTitle>
                                    <AlertDescription>
                                        This test requires a fee of ETH {testFee}. The fee covers smart contract deployment and price feed integration.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleStartTest} className="w-full">
                                <PlayCircle className="mr-2 h-4 w-4" /> Start Test (Pay ETH {testFee})
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="import-history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Your Trading History</CardTitle>
                            <CardDescription>Upload your past trading data for analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="broker-select">Select Broker</Label>
                                    <Select value={broker} onValueChange={handleBrokerChange}>
                                        <SelectTrigger id="broker-select">
                                            <SelectValue placeholder="Select broker" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="oanda">Oanda</SelectItem>
                                            <SelectItem value="metatrader">MetaTrader</SelectItem>
                                            <SelectItem value="interactive-brokers">Interactive Brokers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="file-upload">Verify and Import Trading History</Label>
                                    <Input id="file-upload" type="file" onChange={handleFileChange} accept=".csv,.xlsx" />
                                </div>
                                {file && (
                                    <Alert>
                                        <FileUp className="h-4 w-4" />
                                        <AlertTitle>File selected</AlertTitle>
                                        <AlertDescription>{file.name}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleImportHistory} className="w-full" disabled={!file}>
                                <ArrowUpRight className="mr-2 h-4 w-4" /> Import History
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is the Proof of Profit protocol?</AccordionTrigger>
                        <AccordionContent>
                            The Proof of Profit protocol allows skilled traders to demonstrate their profitability and gain access to capital without requiring initial funds. It&apos;s designed to identify and reward successful trading strategies.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How does the trading test work?</AccordionTrigger>
                        <AccordionContent>
                            The trading test provides you with a simulated trading environment. You&apos;ll have a set period of time and initial capital to trade with. Your performance will be evaluated based on factors such as total return, risk management, and consistency. A smart contract will be deployed to receive real-time price feeds for the assets you&apos;ll be trading.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Why is there a fee for the test?</AccordionTrigger>
                        <AccordionContent>
                            The test fee covers the cost of deploying a smart contract specific to your test and integrating it with reliable price feeds. This ensures the integrity and accuracy of your trading test, providing a fair and transparent evaluation of your skills.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What happens if I pass the test?</AccordionTrigger>
                        <AccordionContent>
                            If you successfully pass the test, you&apos;ll be eligible for funding from our capital pool. The amount of funding will depend on your performance during the test and the risk management protocols in place. Your deployed smart contract will serve as a verifiable record of your trading performance.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Smart Contract Integration</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Trading Smart Contract</CardTitle>
                        <CardDescription>A custom smart contract will be deployed for your test</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Code2 className="h-4 w-4" />
                            <AlertTitle>Smart Contract Features</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside">
                                    <li>Receives real-time price feeds for accurate trade execution</li>
                                    <li>Records all your trades transparently on the blockchain</li>
                                    <li>Calculates your profit/loss in real-time</li>
                                    <li>Ensures fair and tamper-proof evaluation of your trading performance</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Current Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Traders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">1,234</p>
                            <Badge className="mt-2">+15% this month</Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">32%</p>
                            <Badge variant="outline" className="mt-2">Average</Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Funded</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">$5.2M</p>
                            <Badge variant="secondary" className="mt-2">This Year</Badge>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}