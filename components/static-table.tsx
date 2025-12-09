"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowUp, TrendingDown, TrendingUp } from "lucide-react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { suddenSpikesData, trendingConcernsData } from "@/lib/cost-anomaly-data"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface StaticTableProps {
  activeTab?: string
  selectedClassification?: string | null
  selectedSeverity?: string | null
  selectedSubscription?: string | null
  onClassificationChange?: (value: string | null) => void
  onSeverityChange?: (value: string | null) => void
  onSubscriptionChange?: (value: string | null) => void
}

type SortColumn = "severity" | "costImpact" | "dailyCost" | null
type SortDirection = "asc" | "desc"

export function StaticTable({ 
  activeTab = "sudden-spikes",
  selectedClassification,
  selectedSeverity,
  selectedSubscription,
  onClassificationChange,
  onSeverityChange,
  onSubscriptionChange
}: StaticTableProps) {
  const router = useRouter()
  const baseData = activeTab === "all" 
    ? [...suddenSpikesData, ...trendingConcernsData]
    : activeTab === "trending-concerns" 
    ? trendingConcernsData 
    : suddenSpikesData
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    resourceGroup: true,
    subscription: true,
    classification: true,
    severity: true,
    costImpact: true,
    dailyCost: true,
    costTrend: true,
  })
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleSort = (column: string, direction: "asc" | "desc") => {
    if (column === "severity" || column === "costImpact" || column === "dailyCost") {
      setSortColumn(column as SortColumn)
      setSortDirection(direction)
    }
  }

  // Helper function to determine if an item is a spike or concern
  const getItemType = (itemId: string): string => {
    if (suddenSpikesData.some(item => item.id === itemId)) {
      return "Spike"
    }
    if (trendingConcernsData.some(item => item.id === itemId)) {
      return "Concern"
    }
    return "Unknown"
  }

  // Helper function to calculate cost impact
  const getCostImpact = (item: typeof baseData[0]): number => {
    const itemType = getItemType(item.id)
    if (itemType === "Spike") {
      // For spikes: Cost Impact = delta (currentDaily - baselineDaily)
      return item.currentDaily - item.baselineDaily
    } else {
      // For concerns: Cost Impact = projected monthly increase
      return item.projectedMonthlyImpact
    }
  }

  // Severity order: High = 3, Medium = 2, Low = 1
  const getSeverityValue = (severity: string): number => {
    switch (severity.toLowerCase()) {
      case "high":
        return 3
      case "medium":
        return 2
      case "low":
        return 1
      default:
        return 0
    }
  }

  // Get unique classifications and severities for filter options
  const uniqueClassifications = useMemo(() => {
    const classifications = new Set(baseData.map(item => item.classification))
    return Array.from(classifications).sort()
  }, [baseData])

  const uniqueSeverities = useMemo(() => {
    const severities = new Set(baseData.map(item => item.severity))
    return Array.from(severities).sort((a, b) => {
      const order = { 'High': 3, 'Medium': 2, 'Low': 1 }
      return (order[b as keyof typeof order] || 0) - (order[a as keyof typeof order] || 0)
    })
  }, [baseData])

  // Sort and filter the data based on current sort state and filters
  const staticData = useMemo(() => {
    let filtered = [...baseData]
    
    // Apply classification filter
    if (selectedClassification) {
      filtered = filtered.filter(item => item.classification === selectedClassification)
    }
    
    // Apply severity filter
    if (selectedSeverity) {
      filtered = filtered.filter(item => item.severity === selectedSeverity)
    }
    
    // Apply subscription filter
    if (selectedSubscription) {
      filtered = filtered.filter(item => item.subIdentifier === selectedSubscription)
    }
    
    const sorted = filtered.sort((a, b) => {
      // If no explicit sort is selected, use default: severity desc, then cost change desc
      if (!sortColumn) {
        // First sort by severity (descending: High > Medium > Low)
        const aSeverity = getSeverityValue(a.severity)
        const bSeverity = getSeverityValue(b.severity)
        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity // Descending
        }
        // If severity is the same, sort by daily cost (descending: highest first)
        return b.costChangeDollar - a.costChangeDollar
      }

      // Explicit sort selected
      let comparison = 0

      if (sortColumn === "severity") {
        const aValue = getSeverityValue(a.severity)
        const bValue = getSeverityValue(b.severity)
        comparison = aValue - bValue
      } else if (sortColumn === "dailyCost") {
        comparison = a.costChangeDollar - b.costChangeDollar
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return sorted
  }, [baseData, sortColumn, sortDirection, selectedClassification, selectedSeverity, selectedSubscription])

  const columns = [
    { id: "resourceGroup", label: "Resource Group" },
    { id: "type", label: "Type" },
    { id: "subscription", label: "Subscription" },
    { id: "classification", label: "Detected Change Type" },
    { id: "severity", label: "Severity" },
    { id: "costImpact", label: "Cost Impact" },
    { id: "dailyCost", label: "Daily Cost" },
    { id: "costTrend", label: "Cost Trend" },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Table Header */}
      <div className="flex items-center px-4 py-[10px] bg-gray-50 border-b border-gray-200 text-xs font-semibold text-muted-foreground tracking-wide">
        {visibleColumns.resourceGroup && (
          <div className="flex-[1.2] min-w-[150px] mr-5 pr-3 border-r border-gray-200">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Resource Group
            </div>
          </div>
        )}
        {visibleColumns.type && (
          <div className="flex-[0.8] min-w-[90px] mr-5 pr-3 border-r border-gray-200">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Type
            </div>
          </div>
        )}
        {visibleColumns.subscription && (
          <div className="flex-[1.2] min-w-[150px] mr-5 pr-3 border-r border-gray-200">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Subscription
            </div>
          </div>
        )}
        {visibleColumns.classification && (
          <div className="flex-[1.5] min-w-[180px] mr-5 pr-3 border-r border-gray-200">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Detected Change Type
            </div>
          </div>
        )}
        {visibleColumns.severity && (
          <div className="flex-[0.8] min-w-[90px] mr-5 pr-3 border-r border-gray-200">
            <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Severity
              {sortColumn === "severity" && (
                <ArrowUp className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </div>
          </div>
        )}
        {visibleColumns.costImpact && (
          <div className="flex-[1] min-w-[120px] mr-5 pr-3 border-r border-gray-200 text-right">
            <button
              onClick={() => handleSort("costImpact", sortColumn === "costImpact" && sortDirection === "asc" ? "desc" : "asc")}
              className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap hover:text-foreground transition-colors ml-auto"
            >
              Cost Impact
              {sortColumn === "costImpact" && (
                <ArrowUp className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </button>
          </div>
        )}
        {visibleColumns.dailyCost && (
          <div className="flex-[1] min-w-[120px] mr-5 pr-3 border-r border-gray-200 text-right">
            <div className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Daily Cost
              {sortColumn === "dailyCost" && (
                <ArrowUp className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </div>
          </div>
        )}
        {visibleColumns.costTrend && (
          <div className="flex-[0.7] min-w-[90px]">
            <div className="flex items-center justify-end group">
              <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
                Cost Trend
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {staticData.map((item) => (
          <div
            key={item.id}
            className="flex items-center px-4 py-[15px] hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push(`/cost-anomaly/${item.id}`)}
          >
            {visibleColumns.resourceGroup && (
              <div className="flex-[1.2] min-w-[150px] mr-5">
                <div className="text-foreground text-xs font-medium truncate">{item.resourceGroup}</div>
              </div>
            )}
            {visibleColumns.type && (
              <div className="flex-[0.8] min-w-[90px] mr-5">
                <span className="text-xs text-foreground">{getItemType(item.id)}</span>
              </div>
            )}
            {visibleColumns.subscription && (
              <div className="flex-[1.2] min-w-[150px] mr-5">
                <span className="text-xs text-foreground truncate">{item.subIdentifier}</span>
              </div>
            )}
            {visibleColumns.classification && (
              <div className="flex-[1.5] min-w-[180px] mr-5">
                <span className="text-xs text-foreground">{item.classification}</span>
              </div>
            )}
            {visibleColumns.severity && (
              <div className="flex-[0.8] min-w-[90px] text-left mr-5">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0.5 ${
                    item.severity === "High"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : item.severity === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {item.severity}
                </Badge>
              </div>
            )}
            {visibleColumns.costImpact && (
              <div className="flex-[1] min-w-[120px] mr-5 text-right">
                <span className="text-xs text-foreground">
                  {(() => {
                    const impact = getCostImpact(item)
                    const sign = impact >= 0 ? "+" : "-"
                    const isConcern = getItemType(item.id) === "Concern"
                    return (
                      <>
                        {sign}{formatCurrency(Math.abs(impact))}
                        {isConcern && (
                          <span className="text-xs text-muted-foreground ml-1">(proj)</span>
                        )}
                      </>
                    )
                  })()}
                </span>
              </div>
            )}
            {visibleColumns.dailyCost && (
              <div className="flex-[1] min-w-[120px] mr-5 text-right">
                <span className="text-xs text-foreground">
                  {(() => {
                    const itemType = getItemType(item.id)
                    // For spikes: Daily Cost = currentDaily (what you're paying per day right now)
                    // For concerns: Daily Cost = currentDaily (same logic)
                    return formatCurrency(item.currentDaily)
                  })()}
                </span>
              </div>
            )}
            {visibleColumns.costTrend && (
              <div className="flex-[0.7] min-w-[90px]">
                <div className="flex items-center justify-end gap-1">
                  {item.costChangePercent >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`text-xs font-medium ${
                    item.costChangePercent >= 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {Math.abs(item.costChangePercent)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

