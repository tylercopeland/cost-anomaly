"use client"

import { useState } from "react"
import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"
import { findCostAnomalyItem } from "@/lib/cost-anomaly-data"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CostTrendChart } from "@/components/cost-trend-chart"
import { Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
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
                <p className="text-xs text-muted-foreground mt-1">{item.subIdentifier}</p>
              </div>
              <Badge className={getSeverityColor(item.severity)}>
                {item.severity} Severity
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="min-h-[32px] flex items-start">
                    <p className="text-xs font-medium text-gray-600">Normal Daily Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(item.baselineDaily)}</p>
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="min-h-[32px] flex items-start">
                    <p className="text-xs font-medium text-gray-600">Current Daily Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(item.currentDaily)}</p>
                  <div className="mt-2">
                    <p className={`text-xs font-medium ${item.costChangeDollar >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {item.costChangeDollar > 0 ? "+" : ""}{formatCurrency(Math.abs(item.costChangeDollar))} ({item.costChangePercent > 0 ? "+" : ""}{item.costChangePercent.toFixed(0)}%) from baseline
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="min-h-[32px] flex items-start">
                    <p className="text-xs font-medium text-gray-600">Projected Monthly Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-4">
                    {formatCurrency(item.baselineDaily * 30 + item.projectedMonthlyImpact)}
                  </p>
                  <div className="mt-2">
                    <p className={`text-xs font-medium ${item.projectedMonthlyImpact >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {item.projectedMonthlyImpact > 0 ? "+" : ""}{formatCurrency(Math.abs(item.projectedMonthlyImpact))} above baseline
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cost Trend Chart */}
            <div className="flex flex-col">
              <div className="min-h-[32px] flex items-start mb-4">
                <p className="text-sm font-semibold text-gray-900">14-Day Cost Trend Analysis</p>
              </div>
              <div>
                {item.costTrendData ? (
                  <CostTrendChart
                    data={item.costTrendData}
                    showProjection={true}
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
                <p className="text-sm font-semibold text-gray-900">Recommended Action</p>
              </div>
              <div className="bg-blue-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {item.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-600 mt-1">•</span>
                      <span className="flex-1 text-sm text-gray-700 leading-relaxed">{action.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Smart Tags */}
            {item.smartTags && item.smartTags.length > 0 && (
              <div className="flex flex-col">
                <div className="min-h-[32px] flex items-start mb-2">
                  <p className="text-sm font-semibold text-gray-900">Smart Tags</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.smartTags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1"
                    >
                      {tag.key}: {tag.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Learn More Modal */}
      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cost Anomaly Detection Settings</DialogTitle>
            <DialogDescription>
              Overview of anomaly detection parameters and filtering rules
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-white border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Sensitivity Level</p>
                <p className="text-lg font-semibold text-gray-900">High (76/100)</p>
              </Card>
              <Card className="p-4 bg-white border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Alert Threshold</p>
                <p className="text-lg font-semibold text-gray-900">5% minimum change</p>
              </Card>
              <Card className="p-4 bg-white border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Cost Filtering</p>
                <p className="text-lg font-semibold text-gray-900">$10 min / 15% min change</p>
              </Card>
              <Card className="p-4 bg-white border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Methods Active</p>
                <p className="text-lg font-semibold text-gray-900">7 detection methods</p>
              </Card>
            </div>

            {/* Cost Filtering Rules */}
            <Card className="p-6 bg-white border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Cost Filtering Rules</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Minimum Cost Threshold</span>
                  <span className="text-sm font-semibold text-gray-900">$10.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Minimum Variation</span>
                  <span className="text-sm font-semibold text-gray-900">$5.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Minimum Percentage</span>
                  <span className="text-sm font-semibold text-gray-900">15%</span>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  These filters prevent alerts for very small or insignificant cost changes. Resource groups below these thresholds are excluded from anomaly detection.
                </p>
              </div>
            </Card>

            {/* Admin Portal Access */}
            <Card className="p-6 bg-white border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Need to adjust settings?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Admins can adjust detection sensitivity and thresholds in the Admin Portal
              </p>
              <Button className="w-full sm:w-auto">
                Open Admin Portal
              </Button>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

