"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { RecommendationsList } from "@/components/recommendations-list"
import { Calendar } from "@/components/ui/calendar"
import {
  Search,
  Server,
  Zap,
  Shield,
  DollarSign,
  Cpu,
  Archive,
  HardDrive,
  Database,
  ChevronDown,
  Plus,
  Layers,
  CalendarIcon,
  ChevronLeft,
} from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

const categories = [
  { id: "Reserved Instances", icon: Server, count: 5 },
  { id: "DEVUAT", icon: Zap, count: 2 },
  { id: "Hybrid Benefit", icon: Shield, count: 2 },
  { id: "Savings Plans", icon: DollarSign, count: 2 },
  { id: "VM Optimisation", icon: Cpu, count: 2 },
  { id: "Zombies", icon: Archive, count: 2 },
  { id: "Storage", icon: HardDrive, count: 2 },
  { id: "Database", icon: Database, count: 2 },
]

export function RevisitRecommendationsDashboard() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set(["high", "medium", "low"]))
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all-types")
  const [selectedOwners, setSelectedOwners] = useState<Set<string>>(
    new Set(["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]),
  )
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({})
  const [addFilterOpen, setAddFilterOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isDateCalendarMounted, setIsDateCalendarMounted] = useState(false)

  const selectedStatuses = new Set(["Re-visit"])

  useEffect(() => {
    if (openFilters.date) {
      const timer = setTimeout(() => {
        setIsDateCalendarMounted(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setIsDateCalendarMounted(false)
    }
  }, [openFilters.date])

  const toggleFilter = (filterName: string, isOpen: boolean) => {
    setOpenFilters((prev) => ({ ...prev, [filterName]: isOpen }))
  }

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newSelectedPriorities = new Set(selectedPriorities)
    if (checked) {
      newSelectedPriorities.add(priority)
    } else {
      newSelectedPriorities.delete(priority)
    }
    setSelectedPriorities(newSelectedPriorities)
  }

  const handleOwnerChange = (owner: string, checked: boolean) => {
    const newSelectedOwners = new Set(selectedOwners)
    if (checked) {
      newSelectedOwners.add(owner)
    } else {
      newSelectedOwners.delete(owner)
    }
    setSelectedOwners(newSelectedOwners)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newSelectedCategories = new Set(selectedCategories)
    if (checked) {
      newSelectedCategories.add(category)
    } else {
      newSelectedCategories.delete(category)
    }
    setSelectedCategories(newSelectedCategories)
  }

  const getProviderLabel = () => {
    const providerMap: Record<string, string> = {
      all: "All Providers",
      azure: "Azure",
      aws: "AWS",
      gcp: "GCP",
    }
    return providerMap[selectedProvider] || "All Providers"
  }

  const getTypeLabel = () => {
    const typeMap: Record<string, string> = {
      "all-types": "All Types",
      cosmosdb: "CosmosDB",
      sql: "SQL",
      storage: "Storage",
      synapse: "Synapse",
      "vm-instances": "VM Instances",
    }
    return typeMap[selectedType] || "All Types"
  }

  const getPriorityLabel = () => {
    const count = selectedPriorities.size
    if (count === 3) return "All Priorities"
    if (count === 0) return "No Priorities"
    const labels: string[] = []
    if (selectedPriorities.has("high")) labels.push("High")
    if (selectedPriorities.has("medium")) labels.push("Medium")
    if (selectedPriorities.has("low")) labels.push("Low")
    return labels.join(", ")
  }

  const getOwnerLabel = () => {
    const count = selectedOwners.size
    if (count === 5) return "All Owners"
    if (count === 0) return "No Owners"
    if (count === 1) return Array.from(selectedOwners)[0]
    return `${count} owners`
  }

  const getCategoryLabel = () => {
    const count = selectedCategories.size
    if (count === 0 || count === categories.length) return "All Categories"
    if (count === 1) return Array.from(selectedCategories)[0]
    return `${count} categories`
  }

  const isProviderActive = selectedProvider !== "all"
  const isTypeActive = selectedType !== "all-types"
  const isPriorityActive = selectedPriorities.size !== 3
  const isOwnerActive = selectedOwners.size !== 5
  const isCategoryActive = selectedCategories.size > 0
  const isDateActive = dateRange?.from !== undefined || dateRange?.to !== undefined

  const getDateLabel = () => {
    if (!dateRange?.from && !dateRange?.to) return "All Dates"
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
    }
    if (dateRange.from) return `From ${format(dateRange.from, "MMM d")}`
    if (dateRange.to) return `Until ${format(dateRange.to, "MMM d")}`
    return "All Dates"
  }

  const getAvailableFilters = () => {
    const filters = []
    if (!isDateActive) filters.push({ id: "date", label: "Date" })
    if (!isCategoryActive) filters.push({ id: "category", label: "Category" })
    if (!isPriorityActive) filters.push({ id: "priority", label: "Priority" })
    if (!isOwnerActive) filters.push({ id: "owner", label: "Owner" })
    if (!isProviderActive) filters.push({ id: "provider", label: "Provider" })
    if (!isTypeActive) filters.push({ id: "type", label: "Issue Type" })
    return filters
  }

  const addFilter = (filterId: string) => {
    toggleFilter(filterId, true)
    setAddFilterOpen(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Re-visit Recommendations</h1>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recommendations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 border border-border bg-background shadow-xs hover:bg-accent"
            />
          </div>

          {(openFilters.category || isCategoryActive) && (
            <Popover open={openFilters.category} onOpenChange={(open) => toggleFilter("category", open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                    isCategoryActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                  }`}
                >
                  <span className="font-medium">Category:</span>
                  <span>{getCategoryLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Category</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategories(new Set())}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="flex items-center space-x-2 pb-2 border-b border-border/30">
                      <Checkbox
                        id="category-all"
                        checked={selectedCategories.size === categories.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories(new Set(categories.map((c) => c.id)))
                          } else {
                            setSelectedCategories(new Set())
                          }
                        }}
                      />
                      <div className="p-1.5 bg-blue-50 rounded">
                        <Layers className="w-4 h-4 text-blue-600" />
                      </div>
                      <label htmlFor="category-all" className="text-sm flex-1 cursor-pointer">
                        All Categories
                      </label>
                    </div>
                    {categories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.has(category.id)}
                            onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                          />
                          <div className="p-1.5 bg-blue-50 rounded">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                          <label htmlFor={`category-${category.id}`} className="text-sm flex-1 cursor-pointer">
                            {category.id}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {(openFilters.priority || isPriorityActive) && (
            <Popover open={openFilters.priority} onOpenChange={(open) => toggleFilter("priority", open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                    isPriorityActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                  }`}
                >
                  <span className="font-medium">Priority:</span>
                  <span>{getPriorityLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Priority</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPriorities(new Set(["high", "medium", "low"]))}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="high-priority"
                        checked={selectedPriorities.has("high")}
                        onCheckedChange={(checked) => handlePriorityChange("high", checked as boolean)}
                      />
                      <label htmlFor="high-priority" className="text-sm cursor-pointer">
                        High Priority
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="medium-priority"
                        checked={selectedPriorities.has("medium")}
                        onCheckedChange={(checked) => handlePriorityChange("medium", checked as boolean)}
                      />
                      <label htmlFor="medium-priority" className="text-sm cursor-pointer">
                        Medium Priority
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="low-priority"
                        checked={selectedPriorities.has("low")}
                        onCheckedChange={(checked) => handlePriorityChange("low", checked as boolean)}
                      />
                      <label htmlFor="low-priority" className="text-sm cursor-pointer">
                        Low Priority
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {(openFilters.owner || isOwnerActive) && (
            <Popover open={openFilters.owner} onOpenChange={(open) => toggleFilter("owner", open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                    isOwnerActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                  }`}
                >
                  <span className="font-medium">Owner:</span>
                  <span>{getOwnerLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Owner</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedOwners(
                          new Set(["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]),
                        )
                      }
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="owner-chris"
                        checked={selectedOwners.has("Chris Taylor")}
                        onCheckedChange={(checked) => handleOwnerChange("Chris Taylor", checked as boolean)}
                      />
                      <label htmlFor="owner-chris" className="text-sm flex-1 cursor-pointer">
                        Chris Taylor
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="owner-john"
                        checked={selectedOwners.has("John Smith")}
                        onCheckedChange={(checked) => handleOwnerChange("John Smith", checked as boolean)}
                      />
                      <label htmlFor="owner-john" className="text-sm flex-1 cursor-pointer">
                        John Smith
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="owner-rachel"
                        checked={selectedOwners.has("Rachel Green")}
                        onCheckedChange={(checked) => handleOwnerChange("Rachel Green", checked as boolean)}
                      />
                      <label htmlFor="owner-rachel" className="text-sm flex-1 cursor-pointer">
                        Rachel Green
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="owner-alex"
                        checked={selectedOwners.has("Alex Wilson")}
                        onCheckedChange={(checked) => handleOwnerChange("Alex Wilson", checked as boolean)}
                      />
                      <label htmlFor="owner-alex" className="text-sm flex-1 cursor-pointer">
                        Alex Wilson
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="owner-jessica"
                        checked={selectedOwners.has("Jessica Lee")}
                        onCheckedChange={(checked) => handleOwnerChange("Jessica Lee", checked as boolean)}
                      />
                      <label htmlFor="owner-jessica" className="text-sm flex-1 cursor-pointer">
                        Jessica Lee
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {(openFilters.date || isDateActive) && (
            <Popover open={openFilters.date} onOpenChange={(open) => toggleFilter("date", open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                    isDateActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span className="font-medium">Date:</span>
                  <span>{getDateLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[state=open]:duration-200 data-[state=closed]:duration-150"
                align="start"
              >
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Date Marked for Revisit</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange(undefined)}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  {isDateCalendarMounted && (
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      defaultMonth={dateRange?.from || dateRange?.to || new Date()}
                    />
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {(openFilters.provider || isProviderActive) && (
            <Popover open={openFilters.provider} onOpenChange={(open) => toggleFilter("provider", open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                    isProviderActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                  }`}
                >
                  <span className="font-medium">Provider:</span>
                  <span>{getProviderLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Provider</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProvider("all")}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All (248)</SelectItem>
                      <SelectItem value="azure">Azure (100)</SelectItem>
                      <SelectItem value="aws">AWS (100)</SelectItem>
                      <SelectItem value="gcp">GCP (48)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {(openFilters.type || isTypeActive) && (
            <Popover open={openFilters.type} onOpenChange={(open) => toggleFilter("type", open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                    isTypeActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                  }`}
                >
                  <span className="font-medium">Issue Type:</span>
                  <span>{getTypeLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Issue Type</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedType("all-types")}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types (5)</SelectItem>
                      <SelectItem value="cosmosdb">CosmosDB (1)</SelectItem>
                      <SelectItem value="sql">SQL (1)</SelectItem>
                      <SelectItem value="storage">Storage (1)</SelectItem>
                      <SelectItem value="synapse">Synapse (1)</SelectItem>
                      <SelectItem value="vm-instances">VM Instances (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {getAvailableFilters().length > 0 && (
            <Popover open={addFilterOpen} onOpenChange={setAddFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-1.5 px-3 text-sm text-muted-foreground hover:text-foreground bg-transparent relative z-10 pointer-events-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 z-50" align="start">
                <div className="space-y-1">
                  <div className="px-2 py-1.5">
                    <Input type="text" placeholder="Filter by..." className="h-8 text-sm" />
                  </div>
                  {getAvailableFilters().map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => addFilter(filter.id)}
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <RecommendationsList
        selectedPriorities={selectedPriorities}
        selectedProvider={selectedProvider}
        selectedType={selectedType}
        selectedStatuses={selectedStatuses}
        searchQuery={searchQuery}
        groupBy="none"
        selectedOwners={selectedOwners}
        selectedCategories={selectedCategories}
        selectedTagTypes={new Set()}
        selectedTagValues={new Set()}
        sortRules={[]}
        dateRange={dateRange}
        dateColumnLabel="Date marked for revisit"
        savingsColumnLabel="Savings"
      />
    </div>
  )
}
