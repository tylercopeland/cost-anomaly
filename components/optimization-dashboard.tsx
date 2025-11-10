"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverAnchor, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { RecommendationsList } from "@/components/recommendations-list"
import { TableViewTabs } from "@/components/table-view-tabs"
import { useTableViews } from "@/hooks/use-table-views"
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
  MoreHorizontal,
  CalendarIcon,
  RefreshCw,
  Download,
  CheckCircle2,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { allRecommendations } from "@/lib/recommendations-data"
import { allSaaSRecommendations } from "@/lib/saas-recommendations-data"
import { cn } from "@/lib/utils"

interface OptimizationDashboardProps {
  initialCategoryFilter?: string | null
  dataSource?: "cloud" | "saas"
}

// interface SortRule {
//   id: string
//   field: string
//   direction: "asc" | "desc"
// }

const cloudCategories = [
  { id: "Reserved Instances", icon: Server, count: 5 },
  { id: "DEVUAT", icon: Zap, count: 2 },
  { id: "Hybrid Benefit", icon: Shield, count: 2 },
  { id: "Savings Plans", icon: DollarSign, count: 2 },
  { id: "VM Optimisation", icon: Cpu, count: 2 },
  { id: "Zombies", icon: Archive, count: 2 },
  { id: "Storage", icon: HardDrive, count: 2 },
  { id: "Database", icon: Database, count: 2 },
]

const saasCategories = [
  { id: "Financial", icon: DollarSign, count: 4 },
  { id: "Operations", icon: Server, count: 3 },
  { id: "Security", icon: Shield, count: 1 },
  { id: "Adoption", icon: Zap, count: 1 },
]

const tagValues = [
  "cost-allocation-type:Direct",
  "cost-center:94102",
  "cost-center:94103",
  "cost-center:94104",
  "cost-center:94105",
  "cost-center:94107",
  "cost-center:94108",
  "environment:DEV",
  "environment:Development",
  "environment:Production",
  "environment:Test",
  "environment:UAT",
  "portfolio:Information Technology",
  "shared-cost-type:CloudOps",
  "shared-cost-type:Compute",
  "shared-cost-type:Storage",
  "sub-portfolio:IT: Application Services",
  "sub-portfolio:IT: Database Services",
  "sub-portfolio:IT: Security & Compliance",
]

export function OptimizationDashboard({ initialCategoryFilter, dataSource = "cloud" }: OptimizationDashboardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlGroupBy = searchParams.get("groupBy")
  const initialGroupBy = urlGroupBy || "priority"

  const categories = dataSource === "saas" ? saasCategories : cloudCategories
  const recommendationsData = dataSource === "saas" ? allSaaSRecommendations : allRecommendations

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isDateCalendarMounted, setIsDateCalendarMounted] = useState(false)

  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set(["high", "medium", "low"]))
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all-types")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all-time")
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(["New", "Viewed", "Marked for review", "Re-visit"]),
  ) // Updated default selectedStatuses
  const [selectedTagTypes, setSelectedTagTypes] = useState<Set<string>>(new Set())
  const [selectedTagValues, setSelectedTagValues] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [groupBy, setGroupBy] = useState<string>(initialGroupBy)
  const [selectedCategories, setSelectedCategories] = useState<string>(initialCategoryFilter || categories[0].id)
  const [selectedCategoriesPendingReview, setSelectedCategoriesPendingReview] = useState<Set<string>>(
    new Set(categories.map((c) => c.id)),
  )
  const [selectedSubCategory, setSelectedSubCategory] = useState<string[]>([])

  const [viewFilter, setViewFilter] = useState<string>("all")
  const [viewMenuOpen, setViewMenuOpen] = useState(false)

  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const {
    views,
    activeViewId,
    setActiveViewId,
    saveView,
    updateView,
    deleteView,
    renameView,
    getActiveView,
    hasUnsavedChanges,
  } = useTableViews({
    storageKey: "optimization-dashboard-views",
    defaultConfig: {
      selectedPriorities: ["high", "medium", "low"],
      selectedProvider: "all",
      selectedType: "all-types",
      selectedStatuses: ["New", "Viewed", "Marked for review", "Re-visit"], // Updated default in defaultConfig
      selectedCategories: [],
      selectedTagTypes: [],
      selectedTagValues: [],
      groupBy: initialGroupBy,
      dateRange: undefined,
    },
  })

  // const [sortRules, setSortRules] = useState<SortRule[]>([])
  // const [sortOpen, setSortOpen] = useState(false)
  // const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({})
  const [addFilterOpen, setAddFilterOpen] = useState(false)

  const cloudCategorySubCategories: Record<string, string[]> = {
    "Reserved Instances": ["Cosmos DB", "Reserved VM", "SQL", "Synapse", "VM Instances"],
    DEVUAT: ["Development", "UAT", "Testing", "Staging"],
    "Hybrid Benefit": ["Windows Server", "SQL Server", "Linux"],
    "Savings Plans": ["Compute", "EC2", "Lambda", "Fargate"],
    "VM Optimisation": ["Underutilized", "Oversized", "Idle", "Right-sizing"],
    Zombies: ["Unattached Disks", "Idle Resources", "Orphaned Snapshots", "Unused IPs"],
    Storage: ["Blob Storage", "Disk Storage", "Archive Storage", "Backup Storage"],
    Database: ["SQL Database", "CosmosDB", "PostgreSQL", "MySQL"],
  }

  const saasCategorySubCategories: Record<string, string[]> = {
    Financial: ["Zombie", "Recategorize", "Downgrade", "Over-subscribed"],
    Operations: ["AD Hygiene", "Device Lifecycle", "License Hygiene"],
    Security: ["Identity"],
    Adoption: ["Copilot"],
  }

  const categorySubCategories = dataSource === "saas" ? saasCategorySubCategories : cloudCategorySubCategories

  const cloudProviders = [
    { id: "azure", label: "Azure", count: 100 },
    { id: "aws", label: "AWS", count: 100 },
    { id: "gcp", label: "GCP", count: 48 },
  ]

  const saasProviders = [
    { id: "microsoft-365", label: "Microsoft 365" },
    { id: "salesforce", label: "Salesforce" },
    { id: "adobe", label: "Adobe" },
    { id: "slack", label: "Slack" },
    { id: "zoom", label: "Zoom" },
  ]

  const providers = dataSource === "saas" ? saasProviders : cloudProviders

  const getProviderCounts = () => {
    const counts: Record<string, number> = {}
    let total = 0

    recommendationsData.forEach((rec) => {
      // Apply all filters except provider filter
      let include = true

      // Category filter
      if (selectedCategories !== "all" && rec.category !== selectedCategories) include = false

      // Status filter
      if (!selectedStatuses.has(rec.status)) include = false

      // Subcategory filter
      if (selectedSubCategory.length > 0 && !selectedSubCategory.includes(rec.subCategory)) include = false

      // Search filter
      if (searchQuery && !rec.resourceName.toLowerCase().includes(searchQuery.toLowerCase())) include = false

      if (include) {
        const provider = rec.provider || "unknown"
        counts[provider] = (counts[provider] || 0) + 1
        total++
      }
    })

    return { counts, total }
  }

  const { counts: providerCounts, total: totalRecommendations } = getProviderCounts()

  const availableProviders = providers.filter((provider) => providerCounts[provider.id] > 0)

  const getSubCategoryCounts = () => {
    const counts: Record<string, number> = {}

    const filtered = recommendationsData.filter((rec) => {
      // Category filter
      if (rec.category !== selectedCategories) return false

      // Priority filter
      if (selectedPriorities.size > 0 && !selectedPriorities.has(rec.priority)) return false

      // Status filter
      if (selectedStatuses.size > 0 && !selectedStatuses.has(rec.status)) return false

      // Provider filter
      if (selectedProvider !== "all" && rec.provider !== selectedProvider) return false

      // Search query
      if (searchQuery && !rec.title.toLowerCase().includes(searchQuery.toLowerCase())) return false

      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const recDate = new Date(rec.createdDate)
        if (dateRange.from && recDate < dateRange.from) return false
        if (dateRange.to && recDate > dateRange.to) return false
      }

      // Sub-category filter (applied here if selectedSubCategory is not empty)
      if (selectedSubCategory.length > 0 && !selectedSubCategory.includes(rec.subCategory)) {
        return false
      }

      return true
    })

    // Count by subcategory
    filtered.forEach((rec) => {
      if (rec.subCategory) {
        counts[rec.subCategory] = (counts[rec.subCategory] || 0) + 1
      }
    })

    return counts
  }

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {}

    recommendationsData.forEach((rec) => {
      // Apply all filters except category
      // Priority filter
      if (selectedPriorities.size > 0 && !selectedPriorities.has(rec.priority)) return

      // Status filter
      if (selectedStatuses.size > 0 && !selectedStatuses.has(rec.status)) return

      // Provider filter
      if (selectedProvider !== "all" && rec.provider !== selectedProvider) return

      // Search query
      if (searchQuery && !rec.title.toLowerCase().includes(searchQuery.toLowerCase())) return

      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const recDate = new Date(rec.createdDate)
        if (dateRange.from && recDate < dateRange.from) return
        if (dateRange.to && recDate > dateRange.to) return
      }

      // Sub-category filter (applied here if selectedSubCategory is not empty)
      if (selectedSubCategory.length > 0 && !selectedSubCategory.includes(rec.subCategory)) {
        return
      }

      // Count by category
      counts[rec.category] = (counts[rec.category] || 0) + 1
    })

    return counts
  }

  const subCategoryCounts = getSubCategoryCounts()
  const totalSubCategoryCount = Object.values(subCategoryCounts).reduce((sum, count) => sum + count, 0)
  const categoryCounts = getCategoryCounts()

  useEffect(() => {
    if (initialCategoryFilter) {
      setSelectedCategories(initialCategoryFilter)
    }
  }, [initialCategoryFilter])

  useEffect(() => {
    if (initialCategoryFilter) {
      setActiveViewId("default")
    }
  }, [initialCategoryFilter, setActiveViewId])

  useEffect(() => {
    const activeView = getActiveView()
    setSelectedPriorities(new Set(activeView.config.selectedPriorities))

    setSelectedProvider(activeView.config.selectedProvider)
    setSelectedType(activeView.config.selectedType)
    setSelectedStatuses(new Set(activeView.config.selectedStatuses)) // Updated selectedStatuses from active view
    // Only set categories from view if there's no initialCategoryFilter
    if (!initialCategoryFilter) {
      setSelectedCategories(activeView.config.selectedCategories?.[0] || categories[0].id)
    }
    setSelectedTagTypes(new Set(activeView.config.selectedTagTypes))
    setSelectedTagValues(new Set(activeView.config.selectedTagValues))
    setGroupBy(activeView.config.groupBy)
    setDateRange(activeView.config.dateRange)
    if (activeView.config.selectedSubCategory) {
      setSelectedSubCategory(
        Array.isArray(activeView.config.selectedSubCategory) ? activeView.config.selectedSubCategory : [],
      )
    } else {
      setSelectedSubCategory([])
    }
  }, [activeViewId, initialCategoryFilter])

  useEffect(() => {
    if (openFilters.date) {
      // Small delay to ensure popover is fully rendered before showing calendar
      const timer = setTimeout(() => {
        setIsDateCalendarMounted(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setIsDateCalendarMounted(false)
    }
  }, [openFilters.date])

  const toggleFilter = (filterName: string, isOpen: boolean) => {
    setOpenFilters((prev) => {
      const newState = { ...prev, [filterName]: isOpen }
      return newState
    })
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

  const handleStatusChange = (status: string, checked: boolean) => {
    const newSelectedStatuses = new Set(selectedStatuses)
    if (checked) {
      newSelectedStatuses.add(status)
    } else {
      newSelectedStatuses.delete(status)
    }
    setSelectedStatuses(newSelectedStatuses)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(category)
    setSelectedSubCategory([])
  }

  const handleCategoryChangePendingReview = (category: string, checked: boolean) => {
    const newSelectedCategories = new Set(selectedCategoriesPendingReview)
    if (checked) {
      newSelectedCategories.add(category)
    } else {
      newSelectedCategories.delete(category)
    }
    setSelectedCategoriesPendingReview(newSelectedCategories)
  }

  const handleSelectAllCategoriesPendingReview = (checked: boolean) => {
    if (checked) {
      setSelectedCategoriesPendingReview(new Set(categories.map((c) => c.id)))
    } else {
      setSelectedCategoriesPendingReview(new Set())
    }
  }

  const handleTagTypeChange = (tagType: string, checked: boolean) => {
    const newSelectedTagTypes = new Set(selectedTagTypes)
    if (checked) {
      newSelectedTagTypes.add(tagType)
    } else {
      newSelectedTagTypes.delete(tagType)
    }
    setSelectedTagTypes(newSelectedTagTypes)
  }

  const handleTagValueChange = (tagValue: string, checked: boolean) => {
    const newSelectedTagValues = new Set(selectedTagValues)
    if (checked) {
      newSelectedTagValues.add(tagValue)
    } else {
      newSelectedTagValues.delete(tagValue)
    }
    setSelectedTagValues(newSelectedTagValues)
  }

  const handleViewFilterChange = (view: string) => {
    if (view === "archived") {
      router.push("/license-optimization/archived")
    } else if (view === "actioned") {
      router.push("/license-optimization/actioned")
    } else if (view === "revisit") {
      router.push("/license-optimization/revisit")
    }
  }

  const getProviderLabel = () => {
    if (selectedProvider === "all") return "All Providers"

    if (dataSource === "saas") {
      const saasProviderMap: Record<string, string> = {
        "microsoft-365": "Microsoft 365",
        salesforce: "Salesforce",
        adobe: "Adobe",
        slack: "Slack",
        zoom: "Zoom",
      }
      return saasProviderMap[selectedProvider] || "All Providers"
    } else {
      const cloudProviderMap: Record<string, string> = {
        azure: "Azure",
        aws: "AWS",
        gcp: "GCP",
      }
      return cloudProviderMap[selectedProvider] || "All Providers"
    }
  }

  const getTypeLabel = () => {
    if (selectedSubCategory.length === 0) {
      return "All"
    }
    if (selectedSubCategory.length === 1) {
      return selectedSubCategory[0]
    }
    return `${selectedSubCategory.length} selected`
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

  const getStatusLabel = () => {
    const count = selectedStatuses.size
    if (
      count === 4 &&
      selectedStatuses.has("New") &&
      selectedStatuses.has("Viewed") &&
      selectedStatuses.has("Marked for review") &&
      selectedStatuses.has("Re-visit")
    )
      return "All Statuses"
    if (count === 0) return "No Statuses"
    return Array.from(selectedStatuses).join(", ")
  }

  const getCategoryLabel = () => {
    if (activeViewId === "pending-review") {
      const count = selectedCategoriesPendingReview.size
      if (count === categories.length) return "All Categories"
      if (count === 0) return "No Categories"
      if (count === 1) return Array.from(selectedCategoriesPendingReview)[0]
      return `${count} categories`
    }
    return selectedCategories
  }

  const getTagTypeLabel = () => {
    const count = selectedTagTypes.size
    if (count === 0) return "All Tag Types"
    if (count === 1) return Array.from(selectedTagTypes)[0]
    return `${count} tag types`
  }

  const getTagValueLabel = () => {
    const count = selectedTagValues.size
    if (count === 0) return "All Tag Values"
    if (count === 1) return Array.from(selectedTagValues)[0]
    return `${count} tag values`
  }

  const getDateLabel = () => {
    if (!dateRange?.from && !dateRange?.to) return "All Dates"
    if (dateRange.from && dateRange.to) {
      return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
    }
    if (dateRange.from) return `From ${dateRange.from.toLocaleDateString()}`
    if (dateRange.to) return `Until ${dateRange.to.toLocaleDateString()}`
    return "All Dates"
  }

  const getSubCategoryLabel = () => {
    if (selectedSubCategory.length === 0) {
      return "All"
    }
    if (selectedSubCategory.length === 1) {
      return selectedSubCategory[0]
    }
    return `${selectedSubCategory.length} selected`
  }

  // const isSortActive = sortRules.length > 0

  // const getSortLabel = () => {
  //   if (sortRules.length === 0) return ""
  //   if (sortRules.length === 1) {
  //     const rule = sortRules[0]
  //     const sortLabels: Record<string, string> = {
  //       savings: "Savings",
  //       priority: "Priority",
  //       effort: "Effort",
  //       category: "Category",
  //       owner: "Owner",
  //       status: "Status",
  //     }
  //     const directionIcon = rule.direction === "desc" ? "↓" : "↑"
  //     return `${sortLabels[rule.field]} ${directionIcon}`
  //   }
  //   return `${sortRules.length} rules`
  // }

  const isDateActive = dateRange?.from !== undefined || dateRange?.to !== undefined
  const isProviderActive = selectedProvider !== "all"
  const isTypeActive = selectedType !== "all-types"
  const isPriorityActive = selectedPriorities.size !== 3
  const isStatusActive = !(
    selectedStatuses.size === 4 &&
    selectedStatuses.has("New") &&
    selectedStatuses.has("Viewed") &&
    selectedStatuses.has("Marked for review") &&
    selectedStatuses.has("Re-visit")
  )
  const isCategoryActive = true // Assuming category is always active because it's the primary filter
  const isCategoryActivePendingReview = selectedCategoriesPendingReview.size !== categories.length

  const isTagTypeActive = selectedTagTypes.size > 0
  const isTagValueActive = selectedTagValues.size > 0
  const isSubCategoryActive = selectedSubCategory.length > 0

  // const isSortActive = sortBy !== "savings" || sortDirection !== "desc" // Original line removed

  const getAvailableFilters = () => {
    const filters = []
    // 1. Sub-category (type only) - hide if sub-category filter is already showing
    if (!isTypeActive && !(categorySubCategories[selectedCategories]?.length > 0)) {
      filters.push({ id: "type", label: "Sub-category" })
    }

    // 2. Priority
    if (!isPriorityActive) filters.push({ id: "priority", label: "Priority" })

    // 3. Status
    if (!isStatusActive) filters.push({ id: "status", label: "Status" })

    // 4. Date
    if (!isDateActive) filters.push({ id: "date", label: "Date" })

    // 5. Provider
    if (!isProviderActive) filters.push({ id: "provider", label: "Provider" })

    // 6. Tag Types
    if (!isTagTypeActive) filters.push({ id: "tagType", label: "Tag Types" })

    // 7. Tag Values
    if (!isTagValueActive) filters.push({ id: "tagValue", label: "Tag Values" })

    return filters
  }

  const addFilter = (filterId: string) => {
    switch (filterId) {
      case "date":
        toggleFilter("date", true)
        break
      case "provider":
        toggleFilter("provider", true)
        break
      case "type":
        toggleFilter("type", true)
        break
      case "priority":
        toggleFilter("priority", true)
        break
      case "status":
        toggleFilter("status", true)
        break
      case "category":
        toggleFilter("category", true)
        break
      case "tagType":
        toggleFilter("tagType", true)
        break
      case "tagValue":
        toggleFilter("tagValue", true)
        break
      case "effort":
        toggleFilter("effort", true)
        break
      case "subCategory":
        // No popover for subcategory, it's rendered directly
        break
    }
    setAddFilterOpen(false)
  }

  // Removed all Sort-related functions: addSortRule, updateSortRule, removeSortRule, handleDragStart, handleDragOver, handleDragEnd

  const handleSaveView = (name: string) => {
    // Get the default view configuration
    const defaultView = views.find((v) => v.isDefault)
    const templateConfig = defaultView?.config || {
      selectedPriorities: ["high", "medium", "low"],
      selectedProvider: "all",
      selectedType: "all-types",
      selectedStatuses: ["New", "Viewed", "Marked for review", "Re-visit"],
      selectedCategories: [],
      selectedTagTypes: [],
      selectedTagValues: [],
      groupBy: initialGroupBy,
      dateRange: undefined,
    }

    // Save new view using default view configuration as template
    saveView(name, templateConfig)

    setSelectedPriorities(new Set(templateConfig.selectedPriorities))
    setSelectedProvider(templateConfig.selectedProvider)
    setSelectedType(templateConfig.selectedType)
    setSelectedStatuses(new Set(templateConfig.selectedStatuses))
    setSelectedCategories(templateConfig.selectedCategories?.[0] || categories[0].id)
    setSelectedTagTypes(new Set(templateConfig.selectedTagTypes))
    setSelectedTagValues(new Set(templateConfig.selectedTagValues))
    setGroupBy(templateConfig.groupBy)
    setDateRange(templateConfig.dateRange)
    setSelectedSubCategory(Array.isArray(templateConfig.selectedSubCategory) ? templateConfig.selectedSubCategory : [])
  }

  const handleUpdateView = () => {
    updateView(activeViewId, {
      selectedPriorities: Array.from(selectedPriorities),
      selectedProvider,
      selectedType,
      selectedStatuses: Array.from(selectedStatuses),
      selectedCategories: [selectedCategories],
      selectedTagTypes: Array.from(selectedTagTypes),
      selectedTagValues: Array.from(selectedTagValues),
      groupBy,
      dateRange,
      selectedSubCategory, // Update selected sub-categories array
    })
  }

  const currentHasUnsavedChanges = hasUnsavedChanges({
    selectedPriorities: Array.from(selectedPriorities),
    selectedProvider,
    selectedType,
    selectedStatuses: Array.from(selectedStatuses),
    selectedCategories: [selectedCategories],
    selectedTagTypes: Array.from(selectedTagTypes),
    selectedTagValues: Array.from(selectedTagValues),
    groupBy,
    dateRange,
    selectedSubCategory, // Check selected sub-categories array for unsaved changes
  })

  const handleSubCategoryChange = (subCategory: string, checked: boolean) => {
    if (checked) {
      setSelectedSubCategory([...selectedSubCategory, subCategory])
    } else {
      setSelectedSubCategory(selectedSubCategory.filter((sc) => sc !== subCategory))
    }
  }

  const handleAllSubCategoriesChange = (checked: boolean) => {
    if (checked) {
      setSelectedSubCategory([])
    } else {
      // If unchecking "All", select all individual sub-categories
      const allSubCategories = categorySubCategories[selectedCategories] || []
      setSelectedSubCategory(allSubCategories)
    }
  }

  const handleViewChange = useCallback(
    (viewId: string) => {
      setActiveViewId(viewId)
    },
    [setActiveViewId],
  )

  const actionedRecommendations = recommendationsData.filter((item) => item.status === "Actioned")
  const totalSavings = actionedRecommendations.reduce((sum, item) => {
    const savingsAmount = Number.parseInt(item.savingsFormatted.replace(/[£,]/g, "")) || 0
    return sum + savingsAmount
  }, 0)
  const averageSavings =
    actionedRecommendations.length > 0 ? Math.round(totalSavings / actionedRecommendations.length) : 0

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Recommendations</h1>
      </div>

      <TableViewTabs
        views={views}
        activeViewId={activeViewId}
        onViewChange={handleViewChange}
        onSaveView={handleSaveView}
        onUpdateView={handleUpdateView} // Pass update handler
        onDeleteView={deleteView}
        onRenameView={renameView}
        hasUnsavedChanges={currentHasUnsavedChanges} // Pass unsaved changes flag
      />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className={cn("relative transition-all duration-300 ease-in-out", isSearchExpanded ? "w-64" : "w-24")}>
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

          {activeViewId !== "snoozed-archived" && activeViewId !== "pending-review" && activeViewId !== "actioned" && (
            <>
              {/* 1. Category Filter - Always first */}
              {(openFilters.category || isCategoryActive) && (
                <Popover
                  open={openFilters.category}
                  onOpenChange={(open) => {
                    console.log("[v0] Category button clicked", { openFilters, currentState: openFilters.category })
                    toggleFilter("category", open)
                  }}
                >
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Category button clicked", { openFilters, currentState: openFilters.category })
                        e.stopPropagation()
                        toggleFilter("category", !openFilters.category)
                      }}
                      className="h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <span className="font-medium">Category:</span>
                      <span>{getCategoryLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent className="w-64 p-3 z-50" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Category</h4>
                      </div>
                      <div className="space-y-2">
                        {categories.map((category) => {
                          const isSelected = selectedCategories === category.id
                          const count = categoryCounts[category.id] || 0
                          return (
                            <button
                              key={category.id}
                              onClick={() => {
                                handleCategoryChange(category.id)
                                toggleFilter("category", false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-accent text-foreground"
                              }`}
                            >
                              <span>{category.id}</span>
                              <span className="text-xs text-muted-foreground">({count})</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 2. Sub-category Filter - Always second (right after Category) */}
              {categorySubCategories[selectedCategories]?.length > 0 && (
                <Popover open={openFilters.subCategory} onOpenChange={(open) => toggleFilter("subCategory", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Sub-category button clicked", {
                          openFilters,
                          currentState: openFilters.subCategory,
                        })
                        e.stopPropagation()
                        toggleFilter("subCategory", !openFilters.subCategory)
                      }}
                      className="h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <span className="font-medium">Sub-category:</span>
                      <span>{getSubCategoryLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent className="w-64 p-3 z-50" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Sub-category</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubCategory([])}
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sub-category-chip-all"
                            checked={selectedSubCategory.length === 0}
                            onCheckedChange={(checked) => handleAllSubCategoriesChange(checked as boolean)}
                          />
                          <label htmlFor="sub-category-chip-all" className="text-sm flex-1 cursor-pointer">
                            All
                          </label>
                          <span className="text-xs text-muted-foreground">({totalSubCategoryCount})</span>
                        </div>
                        <div className="border-t border-border" />
                        {categorySubCategories[selectedCategories].map((subCategory) => (
                          <div key={subCategory} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sub-category-chip-${subCategory}`}
                              checked={selectedSubCategory.includes(subCategory)}
                              onCheckedChange={(checked) => handleSubCategoryChange(subCategory, checked as boolean)}
                            />
                            <label
                              htmlFor={`sub-category-chip-${subCategory}`}
                              className="text-sm flex-1 cursor-pointer"
                            >
                              {subCategory}
                            </label>
                            <span className="text-xs text-muted-foreground">
                              ({subCategoryCounts[subCategory] || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 3. Priority Filter */}
              {(openFilters.priority || isPriorityActive) && (
                <Popover open={openFilters.priority} onOpenChange={(open) => toggleFilter("priority", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Priority button clicked", { openFilters, currentState: openFilters.priority })
                        e.stopPropagation()
                        toggleFilter("priority", !openFilters.priority)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isPriorityActive
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">Priority:</span>
                      <span>{getPriorityLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
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

              {/* 4. Status Filter */}
              {(openFilters.status || isStatusActive) && (
                <Popover open={openFilters.status} onOpenChange={(open) => toggleFilter("status", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Status button clicked", { openFilters, currentState: openFilters.status })
                        e.stopPropagation()
                        toggleFilter("status", !openFilters.status)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isStatusActive
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">Status:</span>
                      <span>{getStatusLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent className="w-64 p-3 z-50" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Status</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedStatuses(new Set(["New", "Viewed", "Marked for review", "Re-visit"]))
                          }
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="status-new"
                            checked={selectedStatuses.has("New")}
                            onCheckedChange={(checked) => handleStatusChange("New", checked as boolean)}
                          />
                          <label htmlFor="status-new" className="text-sm flex-1 cursor-pointer">
                            New
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="status-viewed"
                            checked={selectedStatuses.has("Viewed")}
                            onCheckedChange={(checked) => handleStatusChange("Viewed", checked as boolean)}
                          />
                          <label htmlFor="status-viewed" className="text-sm flex-1 cursor-pointer">
                            Viewed
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="status-marked-review"
                            checked={selectedStatuses.has("Marked for review")}
                            onCheckedChange={(checked) => handleStatusChange("Marked for review", checked as boolean)}
                          />
                          <label htmlFor="status-marked-review" className="text-sm flex-1 cursor-pointer">
                            Marked for review
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="status-revisit"
                            checked={selectedStatuses.has("Re-visit")}
                            onCheckedChange={(checked) => handleStatusChange("Re-visit", checked as boolean)}
                          />
                          <label htmlFor="status-revisit" className="text-sm flex-1 cursor-pointer">
                            Re-visit
                          </label>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 5. Date Filter */}
              {(openFilters.date || isDateActive) && (
                <Popover open={openFilters.date} onOpenChange={(open) => toggleFilter("date", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Date button clicked", { openFilters, currentState: openFilters.date })
                        e.stopPropagation()
                        toggleFilter("date", !openFilters.date)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isDateActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span className="font-medium">Date:</span>
                      <span>{getDateLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent
                    className="w-auto p-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[state=open]:duration-200 data-[state=closed]:duration-150"
                    align="start"
                  >
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Date Added</h4>
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

              {/* 6. Provider Filter */}
              {(openFilters.provider || isProviderActive) && (
                <Popover open={openFilters.provider} onOpenChange={(open) => toggleFilter("provider", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Provider button clicked", { openFilters, currentState: openFilters.provider })
                        e.stopPropagation()
                        toggleFilter("provider", !openFilters.provider)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isProviderActive
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">Provider:</span>
                      <span>{getProviderLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
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
                          <SelectItem value="all">All ({totalRecommendations})</SelectItem>
                          {dataSource === "saas" ? (
                            <>
                              {availableProviders.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.label} ({providerCounts[provider.id] || 0})
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <>
                              {availableProviders.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.label} ({providerCounts[provider.id] || 0})
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 7. Issue Type Filter */}
              {(openFilters.type || isTypeActive) && (
                <Popover open={openFilters.type} onOpenChange={(open) => toggleFilter("type", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Type button clicked", { openFilters, currentState: openFilters.type })
                        e.stopPropagation()
                        toggleFilter("type", !openFilters.type)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isTypeActive ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">Sub-category:</span>
                      <span>{getTypeLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent className="w-64 p-3 z-50" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Sub-category</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubCategory([])}
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sub-category-all"
                            checked={selectedSubCategory.length === 0}
                            onCheckedChange={(checked) => handleAllSubCategoriesChange(checked as boolean)}
                          />
                          <label htmlFor="sub-category-all" className="text-sm flex-1 cursor-pointer">
                            All
                          </label>
                          <span className="text-xs text-muted-foreground">({totalSubCategoryCount})</span>
                        </div>
                        <div className="border-t border-border" />
                        {categorySubCategories[selectedCategories]?.map((subCategory) => (
                          <div key={subCategory} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sub-category-${subCategory}`}
                              checked={selectedSubCategory.includes(subCategory)}
                              onCheckedChange={(checked) => handleSubCategoryChange(subCategory, checked as boolean)}
                            />
                            <label htmlFor={`sub-category-${subCategory}`} className="text-sm flex-1 cursor-pointer">
                              {subCategory}
                            </label>
                            <span className="text-xs text-muted-foreground">
                              ({subCategoryCounts[subCategory] || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 8. Tag Types Filter */}
              {(openFilters.tagType || isTagTypeActive) && (
                <Popover open={openFilters.tagType} onOpenChange={(open) => toggleFilter("tagType", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Tag Type button clicked", { openFilters, currentState: openFilters.tagType })
                        e.stopPropagation()
                        toggleFilter("tagType", !openFilters.tagType)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isTagTypeActive
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">Tag Types:</span>
                      <span>{getTagTypeLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent className="w-64 p-3 z-50" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Tag Types</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTagTypes(new Set())}
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tag-cost-allocation"
                            checked={selectedTagTypes.has("Cost-allocation-type")}
                            onCheckedChange={(checked) =>
                              handleTagTypeChange("Cost-allocation-type", checked as boolean)
                            }
                          />
                          <label htmlFor="tag-cost-allocation" className="text-sm flex-1 cursor-pointer">
                            Cost-allocation-type
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tag-cost-center"
                            checked={selectedTagTypes.has("Cost-center")}
                            onCheckedChange={(checked) => handleTagTypeChange("Cost-center", checked as boolean)}
                          />
                          <label htmlFor="tag-cost-center" className="text-sm flex-1 cursor-pointer">
                            Cost-center
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tag-environment"
                            checked={selectedTagTypes.has("Environment")}
                            onCheckedChange={(checked) => handleTagTypeChange("Environment", checked as boolean)}
                          />
                          <label htmlFor="tag-environment" className="text-sm flex-1 cursor-pointer">
                            Environment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tag-portfolio"
                            checked={selectedTagTypes.has("Portfolio")}
                            onCheckedChange={(checked) => handleTagTypeChange("Portfolio", checked as boolean)}
                          />
                          <label htmlFor="tag-portfolio" className="text-sm flex-1 cursor-pointer">
                            Portfolio
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tag-shared-cost"
                            checked={selectedTagTypes.has("Shared-cost-type")}
                            onCheckedChange={(checked) => handleTagTypeChange("Shared-cost-type", checked as boolean)}
                          />
                          <label htmlFor="tag-shared-cost" className="text-sm flex-1 cursor-pointer">
                            Shared-cost-type
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tag-sub-portfolio"
                            checked={selectedTagTypes.has("Sub-portfolio")}
                            onCheckedChange={(checked) => handleTagTypeChange("Sub-portfolio", checked as boolean)}
                          />
                          <label htmlFor="tag-sub-portfolio" className="text-sm flex-1 cursor-pointer">
                            Sub-portfolio
                          </label>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 9. Tag Values Filter */}
              {(openFilters.tagValue || isTagValueActive) && (
                <Popover open={openFilters.tagValue} onOpenChange={(open) => toggleFilter("tagValue", open)}>
                  <PopoverAnchor asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Tag Value button clicked", {
                          openFilters,
                          currentState: openFilters.tagValue,
                        })
                        e.stopPropagation()
                        toggleFilter("tagValue", !openFilters.tagValue)
                      }}
                      className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                        isTagValueActive
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "bg-transparent hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">Tag Values:</span>
                      <span>{getTagValueLabel()}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent className="w-80 p-3 z-50" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Tag Values</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTagValues(new Set())}
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {tagValues.map((tagValue) => (
                          <div key={tagValue} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-value-${tagValue}`}
                              checked={selectedTagValues.has(tagValue)}
                              onCheckedChange={(checked) => handleTagValueChange(tagValue, checked as boolean)}
                            />
                            <label htmlFor={`tag-value-${tagValue}`} className="text-sm flex-1 cursor-pointer">
                              {tagValue}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* 10. Add Filter Button - Always last */}
              {getAvailableFilters().length > 0 && (
                <Popover
                  open={addFilterOpen}
                  onOpenChange={(open) => {
                    console.log("[v0] Add filter popover onOpenChange", { open })
                    setAddFilterOpen(open)
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Add Filter button clicked", { addFilterOpen })
                      }}
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

              <div className="flex items-center gap-1.5">
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger
                    size="sm"
                    className="h-8 gap-1.5 px-3 border border-border bg-transparent shadow-xs hover:bg-accent"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Group by:</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="effort">Effort</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>

                {activeViewId !== "snoozed-archived" &&
                  activeViewId !== "pending-review" &&
                  activeViewId !== "actioned" && (
                    <Popover open={viewMenuOpen} onOpenChange={setViewMenuOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-border bg-background shadow-xs hover:bg-accent"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2 z-50" align="start">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleViewFilterChange("revisit")}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center gap-2 whitespace-nowrap ${
                              viewFilter === "revisit" ? "bg-accent font-medium" : "hover:bg-accent"
                            }`}
                          >
                            <RefreshCw className="w-4 h-4 flex-shrink-0" />
                            Re-visit Recommendations
                          </button>
                          <button
                            onClick={() => handleViewFilterChange("archived")}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center gap-2 whitespace-nowrap ${
                              viewFilter === "archived" ? "bg-accent font-medium" : "hover:bg-accent"
                            }`}
                          >
                            <Archive className="w-4 h-4 flex-shrink-0" />
                            Archived Recommendations
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </div>

              {/* Export button */}
              <Button
                variant="outline"
                className="h-8 gap-1.5 px-3 text-sm bg-white hover:bg-gray-50 border border-border shadow-xs ml-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </>
          )}

          {(activeViewId === "snoozed-archived" ||
            activeViewId === "pending-review" ||
            activeViewId === "actioned") && (
            <>
              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") && (
                <Popover
                  open={addFilterOpen}
                  onOpenChange={(open) => {
                    console.log("[v0] Add filter popover onOpenChange", { open })
                    setAddFilterOpen(open)
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        console.log("[v0] Add Filter button clicked", { addFilterOpen })
                      }}
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
                      <button
                        onClick={() => {
                          toggleFilter("category", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Category
                      </button>
                      <button
                        onClick={() => {
                          toggleFilter("priority", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Priority
                      </button>
                      <button
                        onClick={() => {
                          toggleFilter("provider", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Provider
                      </button>
                      <button
                        onClick={() => {
                          toggleFilter("date", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Date
                      </button>
                      <button
                        onClick={() => {
                          toggleFilter("tagType", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Tag Types
                      </button>
                      <button
                        onClick={() => {
                          toggleFilter("tagValue", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Tag Values
                      </button>
                      <button
                        onClick={() => {
                          toggleFilter("effort", true)
                          setAddFilterOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                      >
                        Effort
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                (openFilters.category || isCategoryActivePendingReview) && (
                  <Popover open={openFilters.category} onOpenChange={(open) => toggleFilter("category", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Category button clicked", {
                            openFilters,
                            currentState: openFilters.category,
                          })
                          e.stopPropagation()
                          toggleFilter("category", !openFilters.category)
                        }}
                        className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                          isCategoryActivePendingReview
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "bg-transparent hover:bg-accent"
                        }`}
                      >
                        <span className="font-medium">Category:</span>
                        <span>{getCategoryLabel()}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
                    <PopoverContent className="w-64 p-3 z-50" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Category</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCategoriesPendingReview(new Set(categories.map((c) => c.id)))}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="category-pending-select-all"
                              checked={selectedCategoriesPendingReview.size === categories.length}
                              onCheckedChange={(checked) => handleSelectAllCategoriesPendingReview(checked as boolean)}
                            />
                            <label
                              htmlFor="category-pending-select-all"
                              className="text-sm flex-1 cursor-pointer font-medium"
                            >
                              Select All
                            </label>
                          </div>
                          <div className="border-t border-border" />
                          {categories.map((category) => {
                            const isSelected = selectedCategoriesPendingReview.has(category.id)
                            const count = categoryCounts[category.id] || 0
                            return (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-pending-${category.id}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleCategoryChangePendingReview(category.id, checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor={`category-pending-${category.id}`}
                                  className="text-sm flex-1 cursor-pointer flex items-center justify-between"
                                >
                                  <span>{category.id}</span>
                                  <span className="text-xs text-muted-foreground">({count})</span>
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                (openFilters.priority || isPriorityActive) && (
                  <Popover open={openFilters.priority} onOpenChange={(open) => toggleFilter("priority", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Priority button clicked", {
                            openFilters,
                            currentState: openFilters.priority,
                          })
                          e.stopPropagation()
                          toggleFilter("priority", !openFilters.priority)
                        }}
                        className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                          isPriorityActive
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "bg-transparent hover:bg-accent"
                        }`}
                      >
                        <span className="font-medium">Priority:</span>
                        <span>{getPriorityLabel()}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
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
                              id="high-priority-pending"
                              checked={selectedPriorities.has("high")}
                              onCheckedChange={(checked) => handlePriorityChange("high", checked as boolean)}
                            />
                            <label htmlFor="high-priority-pending" className="text-sm cursor-pointer">
                              High Priority
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="medium-priority-pending"
                              checked={selectedPriorities.has("medium")}
                              onCheckedChange={(checked) => handlePriorityChange("medium", checked as boolean)}
                            />
                            <label htmlFor="medium-priority-pending" className="text-sm cursor-pointer">
                              Medium Priority
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="low-priority-pending"
                              checked={selectedPriorities.has("low")}
                              onCheckedChange={(checked) => handlePriorityChange("low", checked as boolean)}
                            />
                            <label htmlFor="low-priority-pending" className="text-sm cursor-pointer">
                              Low Priority
                            </label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                (openFilters.provider || isProviderActive) && (
                  <Popover open={openFilters.provider} onOpenChange={(open) => toggleFilter("provider", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Provider button clicked", {
                            openFilters,
                            currentState: openFilters.provider,
                          })
                          e.stopPropagation()
                          toggleFilter("provider", !openFilters.provider)
                        }}
                        className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                          isProviderActive
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "bg-transparent hover:bg-accent"
                        }`}
                      >
                        <span className="font-medium">Provider:</span>
                        <span>{getProviderLabel()}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
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
                            <SelectItem value="all">All ({totalRecommendations})</SelectItem>
                            {dataSource === "saas" ? (
                              <>
                                {availableProviders.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.label} ({providerCounts[provider.id] || 0})
                                  </SelectItem>
                                ))}
                              </>
                            ) : (
                              <>
                                {availableProviders.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.label} ({providerCounts[provider.id] || 0})
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                (openFilters.date || isDateActive) && (
                  <Popover open={openFilters.date} onOpenChange={(open) => toggleFilter("date", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Date button clicked", {
                            openFilters,
                            currentState: openFilters.date,
                          })
                          e.stopPropagation()
                          toggleFilter("date", !openFilters.date)
                        }}
                        className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                          isDateActive
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "bg-transparent hover:bg-accent"
                        }`}
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span className="font-medium">Date:</span>
                        <span>{getDateLabel()}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-auto p-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[state=open]:duration-200 data-[state=closed]:duration-150"
                      align="start"
                    >
                      <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Date Added</h4>
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

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                (openFilters.tagType || isTagTypeActive) && (
                  <Popover open={openFilters.tagType} onOpenChange={(open) => toggleFilter("tagType", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Tag Type button clicked", {
                            openFilters,
                            currentState: openFilters.tagType,
                          })
                          e.stopPropagation()
                          toggleFilter("tagType", !openFilters.tagType)
                        }}
                        className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                          isTagTypeActive
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "bg-transparent hover:bg-accent"
                        }`}
                      >
                        <span className="font-medium">Tag Types:</span>
                        <span>{getTagTypeLabel()}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
                    <PopoverContent className="w-64 p-3 z-50" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Tag Types</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTagTypes(new Set())}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-cost-allocation-pending"
                              checked={selectedTagTypes.has("Cost-allocation-type")}
                              onCheckedChange={(checked) =>
                                handleTagTypeChange("Cost-allocation-type", checked as boolean)
                              }
                            />
                            <label htmlFor="tag-cost-allocation-pending" className="text-sm flex-1 cursor-pointer">
                              Cost-allocation-type
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-cost-center-pending"
                              checked={selectedTagTypes.has("Cost-center")}
                              onCheckedChange={(checked) => handleTagTypeChange("Cost-center", checked as boolean)}
                            />
                            <label htmlFor="tag-cost-center-pending" className="text-sm flex-1 cursor-pointer">
                              Cost-center
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-environment-pending"
                              checked={selectedTagTypes.has("Environment")}
                              onCheckedChange={(checked) => handleTagTypeChange("Environment", checked as boolean)}
                            />
                            <label htmlFor="tag-environment-pending" className="text-sm flex-1 cursor-pointer">
                              Environment
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-portfolio-pending"
                              checked={selectedTagTypes.has("Portfolio")}
                              onCheckedChange={(checked) => handleTagTypeChange("Portfolio", checked as boolean)}
                            />
                            <label htmlFor="tag-portfolio-pending" className="text-sm flex-1 cursor-pointer">
                              Portfolio
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-shared-cost-pending"
                              checked={selectedTagTypes.has("Shared-cost-type")}
                              onCheckedChange={(checked) => handleTagTypeChange("Shared-cost-type", checked as boolean)}
                            />
                            <label htmlFor="tag-shared-cost-pending" className="text-sm flex-1 cursor-pointer">
                              Shared-cost-type
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tag-sub-portfolio-pending"
                              checked={selectedTagTypes.has("Sub-portfolio")}
                              onCheckedChange={(checked) => handleTagTypeChange("Sub-portfolio", checked as boolean)}
                            />
                            <label htmlFor="tag-sub-portfolio-pending" className="text-sm flex-1 cursor-pointer">
                              Sub-portfolio
                            </label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                (openFilters.tagValue || isTagValueActive) && (
                  <Popover open={openFilters.tagValue} onOpenChange={(open) => toggleFilter("tagValue", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Tag Value button clicked", {
                            openFilters,
                            currentState: openFilters.tagValue,
                          })
                          e.stopPropagation()
                          toggleFilter("tagValue", !openFilters.tagValue)
                        }}
                        className={`h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto ${
                          isTagValueActive
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "bg-transparent hover:bg-accent"
                        }`}
                      >
                        <span className="font-medium">Tag Values:</span>
                        <span>{getTagValueLabel()}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
                    <PopoverContent className="w-80 p-3 z-50" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Tag Values</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTagValues(new Set())}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {tagValues.map((tagValue) => (
                            <div key={tagValue} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tag-value-pending-${tagValue}`}
                                checked={selectedTagValues.has(tagValue)}
                                onCheckedChange={(checked) => handleTagValueChange(tagValue, checked as boolean)}
                              />
                              <label
                                htmlFor={`tag-value-pending-${tagValue}`}
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {tagValue}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              {(activeViewId === "pending-review" ||
                activeViewId === "actioned" ||
                activeViewId === "snoozed-archived") &&
                openFilters.effort && (
                  <Popover open={openFilters.effort} onOpenChange={(open) => toggleFilter("effort", open)}>
                    <PopoverAnchor asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          console.log("[v0] Pending Review Effort button clicked", {
                            openFilters,
                            currentState: openFilters.effort,
                          })
                          e.stopPropagation()
                          toggleFilter("effort", !openFilters.effort)
                        }}
                        className="h-8 gap-1.5 px-3 text-sm relative z-10 pointer-events-auto bg-transparent hover:bg-accent"
                      >
                        <span className="font-medium">Effort:</span>
                        <span>All</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </PopoverAnchor>
                    <PopoverContent className="w-64 p-3 z-50" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Effort</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFilter("effort", false)}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="effort-low-pending" />
                            <label htmlFor="effort-low-pending" className="text-sm cursor-pointer">
                              Low Effort
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="effort-medium-pending" />
                            <label htmlFor="effort-medium-pending" className="text-sm cursor-pointer">
                              Medium Effort
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="effort-high-pending" />
                            <label htmlFor="effort-high-pending" className="text-sm cursor-pointer">
                              High Effort
                            </label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              <Button
                variant="outline"
                className="h-8 gap-1.5 px-3 text-sm bg-white hover:bg-gray-50 border border-border shadow-xs ml-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      <RecommendationsList
        selectedPriorities={selectedPriorities}
        selectedProvider={selectedProvider}
        selectedType={selectedType}
        selectedStatuses={activeViewId === "actioned" ? new Set(["Actioned"]) : selectedStatuses}
        searchQuery={searchQuery}
        groupBy={activeViewId === "pending-review" || activeViewId === "actioned" ? "none" : groupBy}
        selectedCategories={
          activeViewId === "snoozed-archived"
            ? new Set(categories.map((c) => c.id))
            : activeViewId === "pending-review"
              ? selectedCategoriesPendingReview
              : activeViewId === "actioned"
                ? new Set(categories.map((c) => c.id))
                : new Set([selectedCategories])
        }
        selectedTagTypes={selectedTagTypes}
        selectedTagValues={selectedTagValues}
        sortRules={[]}
        dateRange={dateRange}
        selectedSubCategory={selectedSubCategory}
        activeViewId={activeViewId}
        dataSource={dataSource} // Pass dataSource prop to RecommendationsList
      />

      {activeViewId === "actioned" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Savings:</span>
              <span className="text-xl font-bold text-green-600">£{totalSavings.toLocaleString()}</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Actioned:</span>
              <span className="text-lg font-semibold text-foreground">{actionedRecommendations.length}</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Avg per action:</span>
              <span className="text-lg font-semibold text-foreground">£{averageSavings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
