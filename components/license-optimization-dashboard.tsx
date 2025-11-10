"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { RecommendationsList } from "@/components/recommendations-list"
import { useState } from "react"
import { Filter, X } from "lucide-react"
import { useManagement } from "@/lib/management-context"

export function LicenseOptimizationDashboard() {
  const { managementType } = useManagement()

  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["high", "medium", "low"])
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [filterOpen, setFilterOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<string>("priority")

  const handlePriorityChange = (priority: string, checked: boolean) => {
    if (checked) {
      setSelectedPriorities([...selectedPriorities, priority])
    } else {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== priority))
    }
  }

  const getProviderLabel = () => {
    const providerMap: Record<string, string> = {
      all: "All Providers",
      microsoft: "Microsoft",
      adobe: "Adobe",
      salesforce: "Salesforce",
    }
    return providerMap[selectedProvider] || "All Providers"
  }

  const getTypeLabel = () => {
    const typeMap: Record<string, string> = {
      all: "All Types",
      license: "License Optimization",
      subscription: "Subscription",
      usage: "Usage Analytics",
    }
    return typeMap[selectedType] || "All Types"
  }

  const getPriorityLabels = () => {
    const labels: string[] = []
    if (selectedPriorities.includes("high")) labels.push("High Priority")
    if (selectedPriorities.includes("medium")) labels.push("Medium Priority")
    if (selectedPriorities.includes("low")) labels.push("Low Priority")
    return labels
  }

  const hasActiveFilters = () => {
    return selectedProvider !== "all" || selectedType !== "all" || selectedPriorities.length !== 3
  }

  const clearAllFilters = () => {
    setSelectedProvider("all")
    setSelectedType("all")
    setSelectedPriorities(["high", "medium", "low"])
  }

  // SaaS License-specific recommendations data
  const licenseRecommendations = [
    {
      id: 1,
      title: "Microsoft Office 365 E5 License Downgrade",
      description: "15 users not utilizing advanced E5 features can be downgraded to E3 • Potential savings identified",
      provider: "microsoft",
      iconUrl: "/images/microsoft-m365-icon.png",
      priority: "high",
      savings: "$3,600",
      status: "New",
      subscription: "Office 365 E5",
      owner: "Chris Taylor",
      category: "License Optimisation",
    },
    {
      id: 2,
      title: "Adobe Creative Cloud Unused Licenses",
      description: "8 Creative Cloud licenses inactive for 90+ days • Remove unused subscriptions",
      provider: "adobe",
      iconUrl: "/images/adobe-icon.png",
      priority: "high",
      savings: "$2,880",
      status: "New",
      subscription: "Creative Cloud Pro",
      owner: "Rachel Green",
      category: "License Optimisation",
    },
    {
      id: 4,
      title: "Salesforce User License Rightsizing",
      description: "12 inactive Sales Cloud users • Convert to Platform licenses",
      provider: "salesforce",
      iconUrl: "/images/salesforce-icon.png",
      priority: "medium",
      savings: "$2,160",
      status: "New",
      subscription: "Sales Cloud Enterprise",
      owner: "Alex Wilson",
      category: "License Optimisation",
    },
    {
      id: 5,
      title: "Microsoft Teams Phone Unused Licenses",
      description: "6 Teams Phone licenses assigned but not activated • Remove unused phone system licenses",
      provider: "microsoft",
      iconUrl: "/images/microsoft-m365-icon.png",
      priority: "high",
      savings: "$1,440",
      status: "New",
      subscription: "Microsoft Teams Phone",
      owner: "Chris Taylor",
      category: "Subscription Management",
    },
    {
      id: 6,
      title: "Adobe Acrobat Pro DC Consolidation",
      description: "20 Acrobat Pro licenses with low usage • Consolidate to shared team licenses",
      provider: "adobe",
      iconUrl: "/images/adobe-icon.png",
      priority: "medium",
      savings: "$1,800",
      status: "Viewed",
      subscription: "Acrobat Pro DC",
      owner: "Jessica Lee",
      category: "License Optimisation",
    },
    {
      id: 8,
      title: "Salesforce Marketing Cloud Seat Reduction",
      description: "5 Marketing Cloud seats unused for 6+ months • Remove inactive user licenses",
      provider: "salesforce",
      iconUrl: "/images/salesforce-icon.png",
      priority: "high",
      savings: "$3,000",
      status: "New",
      subscription: "Marketing Cloud",
      owner: "Alex Wilson",
      category: "Subscription Management",
    },
    {
      id: 9,
      title: "Microsoft Power BI Pro License Review",
      description: "18 Power BI Pro licenses with minimal usage • Downgrade to free tier",
      provider: "microsoft",
      iconUrl: "/images/microsoft-m365-icon.png",
      priority: "medium",
      savings: "$2,160",
      status: "Viewed",
      subscription: "Power BI Pro",
      owner: "John Smith",
      category: "License Optimisation",
    },
    {
      id: 10,
      title: "Adobe Stock Subscription Optimization",
      description: "Unused Adobe Stock credits accumulating • Adjust subscription tier",
      provider: "adobe",
      iconUrl: "/images/adobe-icon.png",
      priority: "low",
      savings: "$960",
      status: "New",
      subscription: "Adobe Stock",
      owner: "Jessica Lee",
      category: "Subscription Management",
    },
    {
      id: 12,
      title: "Salesforce Service Cloud License Optimization",
      description: "8 Service Cloud agents with low case volume • Optimize license allocation",
      provider: "salesforce",
      iconUrl: "/images/salesforce-icon.png",
      priority: "medium",
      savings: "$1,440",
      status: "Viewed",
      subscription: "Service Cloud",
      owner: "Rachel Green",
      category: "License Optimisation",
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span className="font-medium text-foreground">{managementType}</span>
        <span>›</span>
        <span>Optimization</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Button */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-xs">
                  {[
                    selectedProvider !== "all" ? 1 : 0,
                    selectedType !== "all" ? 1 : 0,
                    selectedPriorities.length !== 3 ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filters</h4>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Provider Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="microsoft">Microsoft</SelectItem>
                    <SelectItem value="adobe">Adobe</SelectItem>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types (12)</SelectItem>
                    <SelectItem value="license">License Optimization (4)</SelectItem>
                    <SelectItem value="subscription">Subscription (2)</SelectItem>
                    <SelectItem value="usage">Usage Analytics (6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="high"
                      checked={selectedPriorities.includes("high")}
                      onCheckedChange={(checked) => handlePriorityChange("high", checked as boolean)}
                    />
                    <label htmlFor="high" className="text-sm">
                      High Priority (4)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medium"
                      checked={selectedPriorities.includes("medium")}
                      onCheckedChange={(checked) => handlePriorityChange("medium", checked as boolean)}
                    />
                    <label htmlFor="medium" className="text-sm">
                      Medium Priority (4)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="low"
                      checked={selectedPriorities.includes("low")}
                      onCheckedChange={(checked) => handlePriorityChange("low", checked as boolean)}
                    />
                    <label htmlFor="low" className="text-sm">
                      Low Priority (4)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Group By Selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Group by:</span>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="provider">Provider</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedProvider !== "all" && (
          <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 h-7">
            {getProviderLabel()}
            <button onClick={() => setSelectedProvider("all")} className="ml-1 hover:bg-muted rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {selectedType !== "all" && (
          <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 h-7">
            {getTypeLabel()}
            <button onClick={() => setSelectedType("all")} className="ml-1 hover:bg-muted rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {selectedPriorities.length !== 3 &&
          getPriorityLabels().map((label) => (
            <Badge key={label} variant="secondary" className="gap-1 pl-2 pr-1 py-1 h-7">
              {label}
              <button
                onClick={() => {
                  const priority = label.toLowerCase().split(" ")[0]
                  handlePriorityChange(priority, false)
                }}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
      </div>

      {/* Recommendations List */}
      <RecommendationsList
        recommendations={licenseRecommendations}
        selectedPriorities={selectedPriorities}
        selectedProvider={selectedProvider}
        selectedType={selectedType}
        groupBy={groupBy}
      />
    </div>
  )
}
