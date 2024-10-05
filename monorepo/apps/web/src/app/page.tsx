"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, AlertCircle, FileUp, PlayCircle, DollarSign, Code2, CheckCircle2, RefreshCw } from "lucide-react"
import TransgateConnect from "@zkpass/transgate-js-sdk"
import { tradeFactoryAbi } from "@/generated"
import { useRouter } from "next/navigation"
import { useConnect, useWatchContractEvent, useWriteContract } from "wagmi"
import { parseEther } from "viem"


export default function TradingPlatform() {
  const [activeTab, setActiveTab] = useState("start-test")
  const [file, setFile] = useState<File | null>(null)
  const [broker, setBroker] = useState("oanda")
  const [isVerifying, setIsVerifying] = useState(false)
  const [testFee, setTestFee] = useState<number>(100) // Default test fee
  const [investorBroker, setInvestorBroker] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountBalance, setAccountBalance] = useState("")
  const [isVerifyingInvestor, setIsVerifyingInvestor] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "failed">("idle")
  const [tradeAddress, setTradeAddress] = useState<`0x${string}` | undefined>(undefined)
  const router = useRouter()
  const { connectors, connect, status, error } = useConnect()
  const { data: hash, writeContract, error: writeError } = useWriteContract()

  const factoryContractAddress = '0xAE18c5F9f497EDD2e1DD55dA4c97E474a2c79E5F'


  // Create the connector instance
  const connector = new TransgateConnect("af5b7cb0-ffcd-4ab4-bf66-d198b8641f5f")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleBrokerChange = (value: string) => {
    setBroker(value)
  }

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

  const     handleVerify = async () => {
    setIsVerifying(true)
    // Simulating verification process

  

    // Check if the TransGate extension is installed
    // If it returns false, please prompt to install it from chrome web store
    const isAvailable = await connector.isTransgateAvailable()
    const res = await connector.launch("b6efcd3667a9475aac19ee60e7f05808")

    console.log(res)


    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsVerifying(false)
    console.log("Verification complete for broker:", broker)
  }

  const handleInvestorVerification = async () => {
    setIsVerifyingInvestor(true)
    // Simulating verification process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsVerifyingInvestor(false)
    // In a real application, you would make an API call here and handle success/failure accordingly
    setVerificationStatus(parseFloat(accountBalance) >= 100000 ? "success" : "failed")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Proof of Profit Trading Protocol</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Welcome to our Proof of Profit platform!</AlertTitle>
        <AlertDescription>
          Traders can demonstrate their skills to gain access to capital, while investors can verify their capital to invest in profitable traders.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="start-test">Start New Test</TabsTrigger>
          <TabsTrigger value="import-history">Import Trading History</TabsTrigger>
          <TabsTrigger value="prove-capital">Prove Capital (Investors)</TabsTrigger>
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
                  <Select>
                    <SelectTrigger id="test-duration">
                      <SelectValue placeholder="Select test duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-week">1 Week</SelectItem>
                      <SelectItem value="2-weeks">2 Weeks</SelectItem>
                      <SelectItem value="1-month">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="initial-capital">Initial Capital</Label>
                  <Input id="initial-capital" type="number" placeholder="Enter initial capital" />
                </div>
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertTitle>Test Fee</AlertTitle>
                  <AlertDescription>
                    This test requires a fee of ${testFee}. The fee covers smart contract deployment and price feed integration.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartTest} className="w-full">
                <PlayCircle className="mr-2 h-4 w-4" /> Start Test (Pay ${testFee})
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
                  <Label htmlFor="file-upload">Upload Trading History</Label>
                  <Input id="file-upload" type="file" onChange={handleFileChange} accept=".csv,.xlsx,.mt4,.mt5" />
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
              <Button onClick={handleVerify} className="w-full" disabled={ isVerifying}>
                {isVerifying ? (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Verify and Import History
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="prove-capital">
          <Card>
            <CardHeader>
              <CardTitle>Prove Your Capital</CardTitle>
              <CardDescription>Verify your account to invest in profitable traders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="investor-broker">Broker</Label>
                  <Select value={investorBroker} onValueChange={setInvestorBroker}>
                    <SelectTrigger id="investor-broker">
                      <SelectValue placeholder="Select your broker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broker1">Broker 1</SelectItem>
                      <SelectItem value="broker2">Broker 2</SelectItem>
                      <SelectItem value="broker3">Broker 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your account number"
                  />
                </div>
                <div>
                  <Label htmlFor="account-balance">Account Balance (USD)</Label>
                  <Input
                    id="account-balance"
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    placeholder="Enter your account balance"
                  />
                </div>
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertTitle>Minimum Capital Requirement</AlertTitle>
                  <AlertDescription>
                    To invest in traders, you must prove a minimum capital of $100,000 in your broker account.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleInvestorVerification} className="w-full" disabled={isVerifyingInvestor}>
                {isVerifyingInvestor ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Account
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          {verificationStatus === "success" && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Verification Successful</AlertTitle>
              <AlertDescription>Your account has been verified. You can now invest in profitable traders.</AlertDescription>
            </Alert>
          )}
          {verificationStatus === "failed" && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>Your account balance does not meet the minimum requirement of $100,000.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is the Proof of Profit protocol?</AccordionTrigger>
            <AccordionContent>
              The Proof of Profit protocol allows skilled traders to demonstrate their profitability and gain access to capital without requiring initial funds. It's designed to identify and reward successful trading strategies.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does the trading test work?</AccordionTrigger>
            <AccordionContent>
              The trading test provides you with a simulated trading environment. You'll have a set period of time and initial capital to trade with. Your performance will be evaluated based on factors such as total return, risk management, and consistency. A smart contract will be deployed to receive real-time price feeds for the assets you'll be trading.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Why is there a fee for the test?</AccordionTrigger>
            <AccordionContent>
              The test fee covers the cost of deploying a smart contract specific to your test and integrating it with reliable price feeds. This ensures the integrity and accuracy of your trading test, providing a fair and transparent evaluation of your skills.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>How can investors participate?</AccordionTrigger>
            <AccordionContent>
              Investors can prove their capital by verifying their broker account with a minimum balance of $100,000. Once verified, they can invest in traders who have successfully demonstrated their profitability through our platform.
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