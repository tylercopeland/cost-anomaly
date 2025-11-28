"use client"

import { useState } from "react"
import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"
import { findCostAnomalyItem } from "@/lib/cost-anomaly-data"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CostTrendChart, WorstCaseProjectionPoint } from "@/components/cost-trend-chart-chartjs"
import { Settings, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200"
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "low":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

export default function CostAnomalyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const item = findCostAnomalyItem(id)
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false)
  const [smartTags, setSmartTags] = useState(item?.smartTags || [])
  const [tagType, setTagType] = useState("")
  const [tagValue, setTagValue] = useState("")

  // Generate projection data from monthly impact - convert to daily values
  const projectedTrendData: WorstCaseProjectionPoint[] | undefined = item?.projectedMonthlyImpact !== undefined && item?.costTrendData
    ? (() => {
        // Use the exact same filter logic as CostTrendChart component
        const projectionDataPoints = item.costTrendData
          .filter((point) => 
            point.projection != null && 
            typeof point.projection === "number" && 
            (!point.dailyCost || point.dailyCost === null)
          )
          .slice(0, 7) // Only take first 7 to match what the chart displays
        
        if (projectionDataPoints.length === 0) return undefined

        // Calculate projected daily cost from monthly impact
        // Projected monthly = baselineDaily * 30 + projectedMonthlyImpact
        // Projected daily average = (baselineDaily * 30 + projectedMonthlyImpact) / 30
        const projectedDailyAverage = (item.baselineDaily * 30 + item.projectedMonthlyImpact) / 30

        // Generate projection points using the same dates as projection data
        const projectionPoints: WorstCaseProjectionPoint[] = projectionDataPoints.map((point) => ({
          date: point.date,
          value: projectedDailyAverage,
        }))
        
        console.log('Generated Projected Trend Data:', {
          projectedDailyAverage,
          projectionPoints,
          projectionDataPointsDates: projectionDataPoints.map(p => p.date)
        })
        
        return projectionPoints.length > 0 ? projectionPoints : undefined
      })()
    : undefined

  // Generate worst-case projection data if worstCaseMonthlyCost exists
  // IMPORTANT: Use the exact same filter logic as the chart component
  const worstCaseProjection: WorstCaseProjectionPoint[] | undefined = item?.worstCaseMonthlyCost !== undefined && item?.costTrendData
    ? (() => {
        // Use the exact same filter logic as CostTrendChart component
        const projectionDataPoints = item.costTrendData
          .filter((point) => 
            point.projection != null && 
            typeof point.projection === "number" && 
            (!point.dailyCost || point.dailyCost === null)
          )
          .slice(0, 7) // Only take first 7 to match what the chart displays
        
        if (projectionDataPoints.length === 0) return undefined

        // Calculate worst-case daily cost (monthly / 30)
        const worstCaseDaily = item.worstCaseMonthlyCost / 30

        // Generate worst-case projection points using the same dates as projection data
        const projectionPoints: WorstCaseProjectionPoint[] = projectionDataPoints.map((point) => ({
          date: point.date,
          value: worstCaseDaily,
        }))
        
        return projectionPoints.length > 0 ? projectionPoints : undefined
      })()
    : undefined

  if (!item) {
    return (
      <div className="flex h-screen bg-background">
        <StaticSidebar />
        <div className="flex-1 flex flex-col">
          <StaticHeader resourceGroupName="Not Found" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-2">Anomaly not found</h1>
              <p className="text-muted-foreground">The requested anomaly could not be found.</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <StaticSidebar />
      <div className="flex-1 flex flex-col">
        <StaticHeader resourceGroupName={item.resourceGroup} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Title + Severity badge */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">{item.resourceGroup}</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.subIdentifier}
                  {item.classification && (
                    <> | {item.classification}</>
                  )}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0.5 ${getSeverityColor(item.severity)}`}
              >
                {item.severity}
              </Badge>
            </div>

            {/* Anomaly Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Summary</p>
                    <p className="text-sm text-gray-700">
                    An {item.classification} was detected on{" "}
                    <span className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    , with costs{" "}
                    {item.costChangePercent >= 0 ? "increasing" : "decreasing"} by{" "}
                    <span className="font-semibold text-gray-900">{formatCurrency(Math.abs(item.costChangeDollar))}</span>{" "}
                    (<span className="font-semibold text-gray-900">
                      {item.costChangePercent > 0 ? "+" : ""}{item.costChangePercent.toFixed(1)}%
                    </span>){" "}
                    {item.costChangeDollar >= 0 ? "above" : "below"} baseline.
                  </p>
                  </div>
                  <button
                    onClick={() => setIsLearnMoreOpen(true)}
                    className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                    aria-label="Learn more about cost anomaly detection"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    {item.causes.length > 0 && (
                      <>
                        {item.causes.slice(0, -1).map((cause, index) => (
                          <span key={index}>
                            {cause}
                            {index < item.causes.length - 2 ? ", " : ", and "}
                          </span>
                        ))}
                        {item.causes[item.causes.length - 1]}.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary metrics row */}
            <div className={`grid grid-cols-1 gap-4 ${item.worstCaseMonthlyCost !== undefined ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="min-h-[32px] flex items-start mb-2.5">
                    <p className="text-xs font-medium text-gray-600">Normal Daily Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-0">{formatCurrency(item.baselineDaily)}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Baseline daily average</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="min-h-[32px] flex items-start mb-2.5">
                    <p className="text-xs font-medium text-gray-600">Current Daily Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-0">{formatCurrency(item.currentDaily)}</p>
                  <div className="mt-2">
                    <p className={`text-xs font-medium ${item.costChangeDollar >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {item.costChangeDollar > 0 ? "+" : ""}{formatCurrency(Math.abs(item.costChangeDollar))} above baseline
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="min-h-[32px] flex items-start mb-2.5">
                    <p className="text-xs font-medium text-gray-600">Projected Monthly Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-0">
                    {formatCurrency(item.baselineDaily * 30 + item.projectedMonthlyImpact)}
                  </p>
                  <div className="mt-2">
                    <p className={`text-xs font-medium ${item.projectedMonthlyImpact >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {item.projectedMonthlyImpact > 0 ? "+" : ""}{formatCurrency(Math.abs(item.projectedMonthlyImpact))} above monthly baseline
                    </p>
                  </div>
                </div>
              </Card>
              {item.worstCaseMonthlyCost !== undefined && (
                <Card className="p-4 bg-white border border-gray-200">
                  <div className="flex flex-col h-full">
                    <div className="min-h-[32px] flex items-start gap-1.5 mb-2.5">
                      <p className="text-xs font-medium text-gray-600">Projected Risk</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px]">
                          <p>Calculated using the past 7-day growth rate added on top of the current anomaly.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-0">
                      {formatCurrency(item.worstCaseMonthlyCost)}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-red-600">
                        +{formatCurrency(item.worstCaseMonthlyCost - (item.baselineDaily * 30 + item.projectedMonthlyImpact))} above projected cost
                      </p>
                      <p className="text-xs text-gray-600">
                        If the current spike worsens
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Cost Trend Chart */}
            <div className="flex flex-col">
              <div className="min-h-[32px] flex items-start mb-1">
                <p className="text-sm font-semibold text-gray-900">14-Day Cost Trend Analysis</p>
              </div>
              <div>
                {item.costTrendData ? (
                  <CostTrendChart
                    data={item.costTrendData}
                    average={item.baselineDaily}
                    showProjection={true}
                    projectedTrendData={projectedTrendData}
                    worstCaseProjection={worstCaseProjection}
                    height={400}
                  />
                ) : (
                  <div className="text-sm text-gray-500">No trend data available</div>
                )}
              </div>
            </div>

            {/* Recommended actions */}
            <div className="flex flex-col">
              <div className="min-h-[32px] flex items-start mb-2">
                <p className="text-sm font-semibold text-gray-900">Recommendations</p>
              </div>
              <div className="bg-blue-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {item.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-600">•</span>
                      <span className="flex-1 text-sm text-gray-700 leading-relaxed">{action.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Smart Tags */}
            <div className="flex flex-col">
              <div className="min-h-[32px] flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900">Smart Tags</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                      aria-label="Manage smart tags"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-4" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Manage Tags</h3>
                      </div>
                      
                      {/* Existing Tags */}
                      {smartTags.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {smartTags.map((tag, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1"
                              >
                                <span className="text-sm text-gray-800">{tag.key}: {tag.value}</span>
                                <button
                                  onClick={() => {
                                    setSmartTags(smartTags.filter((_, i) => i !== index))
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                                  aria-label={`Remove ${tag.key}: ${tag.value}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add New Tag */}
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Add New Tag</p>
                        <div className="flex gap-2 min-w-0">
                          <input
                            type="text"
                            placeholder="Type"
                            value={tagType}
                            onChange={(e) => setTagType(e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={tagValue}
                            onChange={(e) => setTagValue(e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => {
                              if (tagType.trim() && tagValue.trim()) {
                                setSmartTags([...smartTags, { key: tagType.trim(), value: tagValue.trim() }])
                                setTagType("")
                                setTagValue("")
                              }
                            }}
                            className="flex-shrink-0 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center"
                            aria-label="Add tag"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {smartTags && smartTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {smartTags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-100"
                    >
                      {tag.key}: {tag.value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Learn More Modal */}
      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-200 -mx-6 px-6">
            <DialogTitle>Detection Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Detection Sensitivity */}
            <Card className="p-4 bg-white border border-gray-200">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Detection Sensitivity</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-semibold text-gray-900">High (76/100)</p>
                </div>
                <p className="text-xs text-gray-600">Controls how aggressively anomalies are detected based on recent usage patterns.</p>
              </div>
            </Card>

            {/* Detection Methods */}
            <Card className="p-4 bg-white border border-gray-200">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Detection Methods</h3>
                <p className="text-lg font-semibold text-gray-900">7 active</p>
                <p className="text-sm text-gray-600">Multiple models are used together to reduce false positives.</p>
              </div>
            </Card>

            {/* Alert Trigger Conditions */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Conditions</h3>
                <p className="text-sm text-gray-600 mt-1">Alerts fire only when changes exceed these thresholds.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Minimum % Change:</span>
                  <span className="text-sm font-semibold text-gray-900">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Minimum Dollar Change:</span>
                  <span className="text-sm font-semibold text-gray-900">$10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Minimum Cost Variation:</span>
                  <span className="text-sm font-semibold text-gray-900">$5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Low-spend resource groups are ignored</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 -mx-6 px-6 mt-6">
            <Button>
              Manage Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

