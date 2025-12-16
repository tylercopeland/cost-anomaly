"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Download, ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface StaticTabsFiltersProps {
  showOnlyFilterButton?: boolean
  activeTab?: string
  onTabChange?: (tabId: string) => void
  activeFilters?: ('subscription' | 'classification' | 'severity')[]
  onAddFilter?: (filterType: 'subscription' | 'classification' | 'severity') => void
  onRemoveFilter?: (filterType: 'subscription' | 'classification' | 'severity') => void
  selectedClassification?: string | null
  selectedSeverity?: string | null
  selectedSubscription?: string | null
  onClassificationChange?: (value: string | null) => void
  onSeverityChange?: (value: string | null) => void
  onSubscriptionChange?: (value: string | null) => void
  availableClassifications?: string[]
  availableSeverities?: string[]
  availableSubscriptions?: string[]
}

export function StaticTabsFilters({ 
  showOnlyFilterButton = false, 
  activeTab: controlledActiveTab, 
  onTabChange, 
  activeFilters = [],
  onAddFilter,
  onRemoveFilter,
  selectedClassification,
  selectedSeverity,
  selectedSubscription,
  onClassificationChange,
  onSeverityChange,
  onSubscriptionChange,
  availableClassifications = [],
  availableSeverities = [],
  availableSubscriptions = []
}: StaticTabsFiltersProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("all")
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab
  
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All Types")
  const [selectedSubCategory, setSelectedSubCategory] = useState("All")
  const [groupBy, setGroupBy] = useState("Type")
  const [addFilterOpen, setAddFilterOpen] = useState(false)
  const [openFilterPopover, setOpenFilterPopover] = useState<'classification' | 'severity' | null>(null)
  const prevActiveFiltersRef = useRef<('classification' | 'severity')[]>([])

  // Detect newly added filters and open their dropdowns
  useEffect(() => {
    const prevFilters = prevActiveFiltersRef.current
    const newFilters = activeFilters.filter(f => !prevFilters.includes(f))
    
    if (newFilters.length > 0) {
      // Open the dropdown for the first newly added filter
      setOpenFilterPopover(newFilters[0])
    }
    
    prevActiveFiltersRef.current = activeFilters
  }, [activeFilters])

  const tabs = [
    { id: "all", name: "All" },
    { id: "sudden-spikes", name: "Spikes" },
    { id: "trending-concerns", name: "Concerns" },
  ]

  const categories = [
    "All Types",
    "Sudden Spike",
    "Trending Concern",
  ]

  const subCategories = [
    "All",
    "Compute",
    "Storage",
    "Network",
    "Database",
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Segment Buttons */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 h-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 h-full rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 border border-gray-200 shadow-sm font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? "w-64" : "w-24"}`}>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={isSearchExpanded ? "Search recommendations" : "Search"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={() => {
              if (!searchQuery) {
                setIsSearchExpanded(false)
              }
            }}
            className="pl-7 pr-3 h-8 border border-border bg-background shadow-xs hover:bg-accent transition-all"
          />
        </div>

        {!showOnlyFilterButton && (
          <>

            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  <span className="font-medium">Category:</span>
                  <span>{selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Category</h4>
                  </div>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        <span>{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sub-category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  <span className="font-medium">Sub-category:</span>
                  <span>{selectedSubCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Sub-category</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSubCategory("All")}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2.5">
                    {subCategories.map((subCategory) => (
                      <div key={subCategory} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sub-category-${subCategory}`}
                          checked={selectedSubCategory === subCategory || (subCategory === "All" && selectedSubCategory === "All")}
                          onCheckedChange={() => setSelectedSubCategory(subCategory)}
                          disabled
                        />
                        <label
                          htmlFor={`sub-category-${subCategory}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {subCategory}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}

        {/* Active Filter Buttons */}
        {activeFilters.map((filterType) => {
          const filterLabel = filterType === 'subscription' 
            ? 'Subscription' 
            : filterType === 'classification' 
            ? 'Status' 
            : 'Severity'
          const selectedValue = filterType === 'subscription' 
            ? selectedSubscription 
            : filterType === 'classification' 
            ? selectedClassification 
            : selectedSeverity
          const options = filterType === 'subscription' 
            ? availableSubscriptions 
            : filterType === 'classification' 
            ? availableClassifications 
            : availableSeverities
          const onChange = filterType === 'subscription' 
            ? onSubscriptionChange 
            : filterType === 'classification' 
            ? onClassificationChange 
            : onSeverityChange
          const isOpen = openFilterPopover === filterType

          return (
            <Popover key={filterType} open={isOpen} onOpenChange={(open) => setOpenFilterPopover(open ? filterType : null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-1.5 px-3 text-sm text-foreground hover:text-foreground bg-transparent relative z-10 pointer-events-auto"
                >
                  <span className="font-medium">{filterLabel}:</span>
                  <span className="text-muted-foreground">{selectedValue || 'Select...'}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 z-50" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{filterLabel}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onChange?.(null)
                        onRemoveFilter?.(filterType)
                      }}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {options.map((option) => {
                      const isSelected = selectedValue === option
                      return (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${filterType}-${option}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              onChange?.(checked ? option : null)
                            }}
                          />
                          <label
                            htmlFor={`${filterType}-${option}`}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )
        })}

        {/* + Filter Button */}
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
              {!activeFilters.includes('subscription') && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onAddFilter?.('subscription')
                    setAddFilterOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                >
                  Subscription
                </button>
              )}
              {!activeFilters.includes('classification') && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onAddFilter?.('classification')
                    setAddFilterOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                >
                  Status
                </button>
              )}
              {!activeFilters.includes('severity') && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onAddFilter?.('severity')
                    setAddFilterOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                >
                  Severity
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {!showOnlyFilterButton && (
          <>
            {/* Group by */}
            <div className="flex items-center gap-1.5">
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="h-8 gap-1.5 px-3 border border-border bg-transparent shadow-xs hover:bg-accent w-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Group by:</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Type">Type</SelectItem>
                  <SelectItem value="Severity">Severity</SelectItem>
                  <SelectItem value="Provider">Provider</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export button */}
            <Button
              variant="outline"
              className="h-8 gap-1.5 px-3 text-sm bg-white hover:bg-gray-50 border border-border shadow-xs ml-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

