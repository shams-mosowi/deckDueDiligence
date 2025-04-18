"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, Sparkles, Search, LineChart, Users, Building, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from "react-markdown"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FormData {
  pdfDeckLink: string
  website: string
}

interface TeamMember {
  name: string
  role: string
}

interface ParsedDeck {
  team: TeamMember[]
  moat: string
  market: string
  summery: string
  keyDifferentiation: string
  traction: string
  redFlags: string[]
  highlights: string[]
  founders: TeamMember[]
}

interface FundingData {
  fundingAmmount: number
  reasoning: string
  hasFunding: boolean
}

interface StartupScoring {
  productFounderFitScore: number
  timingScore: number
  tractionScore: number
  differentiationScore: number
}

interface CompetitorSummary {
  content: string
}

interface AnalysisResult {
  productFounderFit: string
  parsedDeck: ParsedDeck
  fundingData: FundingData
  startupScoring: {
    productFounderFitScore: number
    timingScore: number
    tractionScore: number
    differentiationScore: number
    "": string
  }
  competitorSummary: {
    content: string
    citations: Record<string, string>
  }
}

// Analysis stages with corresponding icons and descriptions
const analysisStages = [
  {
    icon: Search,
    title: "Gathering information",
    description: "Scanning deck and website for key data points...",
  },
  {
    icon: Building,
    title: "Analyzing business model",
    description: "Evaluating market fit, revenue streams, and scalability...",
  },
  {
    icon: Users,
    title: "Evaluating team",
    description: "Assessing founder experience and product-founder fit...",
  },
  {
    icon: LineChart,
    title: "Measuring traction",
    description: "Analyzing growth metrics and customer validation...",
  },
  {
    icon: Zap,
    title: "Identifying differentiators",
    description: "Determining unique value proposition and competitive advantages...",
  },
  {
    icon: Sparkles,
    title: "Finalizing analysis",
    description: "Compiling insights and generating comprehensive report...",
  },
]

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    pdfDeckLink: "",
    website: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loadingStage, setLoadingStage] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Effect to handle the fake loading progress and stage changes
  useEffect(() => {
    if (!isLoading) {
      setLoadingStage(0)
      setLoadingProgress(0)
      return
    }

    // Total loading time is approximately 40 seconds
    // We'll divide it into stages with slightly different durations
    const stageDurations = [5000, 7000, 6000, 8000, 7000, 7000] // Total: 40 seconds
    const totalDuration = stageDurations.reduce((sum, duration) => sum + duration, 0)

    // Update progress every 100ms
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 100 / (totalDuration / 100)
        return Math.min(newProgress, 100)
      })
    }, 100)

    // Update stages based on elapsed time
    let elapsedTime = 0
    const stageIntervals: NodeJS.Timeout[] = []

    stageDurations.forEach((duration, index) => {
      if (index === 0) return // Skip first stage as it's already set

      elapsedTime += stageDurations[index - 1]

      const timeout = setTimeout(() => {
        setLoadingStage(index)
      }, elapsedTime)

      stageIntervals.push(timeout)
    })

    return () => {
      clearInterval(progressInterval)
      stageIntervals.forEach(clearTimeout)
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least one field is filled
    if (!formData.pdfDeckLink && !formData.website) {
      setError("Please provide either a PDF deck link or a website URL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate the API call with a delay to match the loading animation
      setTimeout(async () => {
        try {
          const result = await callEndpoint(formData.pdfDeckLink, formData.website)
          setResult(result)
        } catch (err) {
          setError("Failed to analyze the startup deck. Please try again.")
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      }, 40000) // Match the total loading time
    } catch (err) {
      setError("Failed to analyze the startup deck. Please try again.")
      console.error(err)
      setIsLoading(false)
    }
  }

  async function callEndpoint(pdfDeckLink: string, website: string) {
    const url = "https://aic0pe.buildship.run/deckAnalyzer"
    const data = {
      pdfDeckLink: pdfDeckLink || undefined,
      website: website || undefined,
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Success:", result)
      return result
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  const currentStage = analysisStages[loadingStage]
  const IconComponent = currentStage?.icon || Loader2

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Startup Deck Analyzer</h1>
        <p className="text-muted-foreground mb-8">
          Supercharge your VC due diligence with AI-powered startup deck analysis
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Analyze a Startup</CardTitle>
            <CardDescription>
              Enter a PDF deck link, company website, or both to get a comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pdfDeckLink" className="text-sm font-medium">
                  PDF Deck Link
                </label>
                <Input
                  id="pdfDeckLink"
                  name="pdfDeckLink"
                  type="url"
                  placeholder="https://example.com/deck.pdf"
                  value={formData.pdfDeckLink}
                  onChange={handleChange}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium">
                  Company Website
                </label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://company.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <Card className="border border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary animate-pulse" />
                        <div className="absolute -inset-1 rounded-full border border-primary/20 animate-ping opacity-20"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{currentStage.title}</h3>
                        <p className="text-muted-foreground text-sm">{currentStage.description}</p>
                      </div>
                      <div className="w-full space-y-1">
                        <Progress value={loadingProgress} className="h-2" />
                        <p className="text-xs text-right text-muted-foreground">{Math.round(loadingProgress)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Analyze Startup
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Analysis Results</h2>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="funding">Funding</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{result.parsedDeck.summery}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        {result.parsedDeck.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Red Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        {result.parsedDeck.redFlags.map((flag, index) => (
                          <li key={index} className="text-red-500">
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Founding Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.parsedDeck.founders.map((founder, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg">{founder.name}</h3>
                            <p className="text-muted-foreground">{founder.role}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="font-bold mb-2">Product-Founder Fit</h3>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{result.productFounderFit}</ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{result.parsedDeck.market}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Moat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{result.parsedDeck.moat}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Differentiation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{result.parsedDeck.keyDifferentiation}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{result.parsedDeck.traction}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="funding" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Funding Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <Badge variant={result.fundingData.hasFunding ? "default" : "outline"} className="mr-2">
                        {result.fundingData.hasFunding ? "Funded" : "No Funding Data"}
                      </Badge>
                      {result.fundingData.hasFunding && (
                        <span className="text-lg font-bold">${result.fundingData.fundingAmmount.toLocaleString()}</span>
                      )}
                    </div>
                    <p>{result.fundingData.reasoning}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluation" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold mb-2">Scores</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Product-Founder Fit</p>
                            <Progress value={result.startupScoring.productFounderFitScore} className="mt-2" />
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.startupScoring.productFounderFitScore}/100
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Timing</p>
                            <Progress value={result.startupScoring.timingScore} className="mt-2" />
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.startupScoring.timingScore}/100
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Traction</p>
                            <Progress value={result.startupScoring.tractionScore} className="mt-2" />
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.startupScoring.tractionScore}/100
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Differentiation</p>
                            <Progress value={result.startupScoring.differentiationScore} className="mt-2" />
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.startupScoring.differentiationScore}/100
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-bold mb-2">Analysis</h3>
                        <p>{result.startupScoring[""]}</p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-bold mb-2">Strengths</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {result.parsedDeck.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-bold mb-2">Concerns</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {result.parsedDeck.redFlags.map((flag, index) => (
                            <li key={index}>{flag}</li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-bold mb-2">Market Fit</h3>
                        <p>{result.parsedDeck.market}</p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-bold mb-2">Competitive Advantage</h3>
                        <p>{result.parsedDeck.moat}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <ReactMarkdown>{result.competitorSummary.content}</ReactMarkdown>
                    </div>
                    {result.competitorSummary.citations &&
                      Object.keys(result.competitorSummary.citations).length > 0 && (
                        <>
                          <h3 className="font-bold mt-4">Citations</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">Citation</TableHead>
                                <TableHead>Link</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(result.competitorSummary.citations).map(([citation, link]) => (
                                <TableRow key={citation}>
                                  <TableCell className="font-medium">{citation}</TableCell>
                                  <TableCell>
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {link}
                                    </a>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                      )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </main>
  )
}
