"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  ChevronRight,
  ChevronDown,
  Database,
  HardDrive,
  Zap,
  Shield,
  Cpu,
  Archive,
  DollarSign,
  Server,
  BarChart3,
  Settings,
  Lock,
  Pencil,
} from "lucide-react"
import { useManagement } from "@/lib/management-context"
import { useRouter } from "next/navigation"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  allRecommendations,
  calculateTotals,
  calculateUnfilteredTotals,
  getHighPriorityCountByCategory,
} from "@/lib/recommendations-data"
import {
  allSaaSRecommendations,
  calculateSaaSTotals,
  calculateUnfilteredTotals as calculateUnfilteredSaaSTotals,
  getHighPriorityCountByCategory as getHighPriorityCountByCategorySaaS,
} from "@/lib/saas-recommendations-data"

interface OptimizationContentProps {
  selectedStatuses?: Set<string>
}

const OptimizationContent = ({ selectedStatuses }: OptimizationContentProps) => {
  const { managementType } = useManagement()
  const router = useRouter()

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [displayMode, setDisplayMode] = useState<"currency" | "percentage">("currency")
  const [estimatedSavesMetric, setEstimatedSavesMetric] = useState<"low-high-range" | "percentage-of-spend">(
    "low-high-range",
  )
  const [targetGoal, setTargetGoal] = useState<number>(100000) // Default target goal of £100,000
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false)
  const [targetInputValue, setTargetInputValue] = useState<string>(targetGoal.toString())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [projectedProgress, setProjectedProgress] = useState<{
    additionalPercentage: number
    projectedAdditionalSavings: number
    projectedPercentage: number
  } | null>(null)
  const [ageThreshold, setAgeThreshold] = useState<number>(30)

  const formatAbbreviatedNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toLocaleString()
  }

  console.log("[v0] OptimizationContent - managementType:", managementType)
  console.log("[v0] OptimizationContent - isCloudManagement:", managementType === "Multi-Cloud")

  const unfilteredTotals =
    managementType === "Multi-Cloud" ? calculateUnfilteredTotals() : calculateUnfilteredSaaSTotals()
  const totals =
    managementType === "Multi-Cloud" ? calculateTotals(selectedStatuses) : calculateSaaSTotals(selectedStatuses)
  const currentRecommendations = managementType === "Multi-Cloud" ? allRecommendations : allSaaSRecommendations

  const filteredRecommendations = (() => {
    if (!dateRange?.from || !dateRange?.to) {
      return currentRecommendations
    }

    return currentRecommendations.filter((item) => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!
    })
  })()

  const filteredTotals = (() => {
    const actionedItems = currentRecommendations.filter((item) => {
      if (item.status !== "Actioned") return false

      if (!dateRange?.from || !dateRange?.to) {
        return true
      }

      // Use actionedDate for filtering actioned items
      if (item.actionedDate) {
        const itemDate = new Date(item.actionedDate)
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!
      }

      return false
    })

    const totalSavings = filteredRecommendations.reduce((sum, item) => {
      const savingsValue =
        typeof item.savings === "string" ? Number.parseFloat(item.savings.replace(/[£$,]/g, "")) : item.savings
      return sum + (isNaN(savingsValue) ? 0 : savingsValue)
    }, 0)

    const actionedSavings = actionedItems.reduce((sum, item) => {
      const savingsValue =
        typeof item.savings === "string" ? Number.parseFloat(item.savings.replace(/[£$,]/g, "")) : item.savings
      return sum + (isNaN(savingsValue) ? 0 : savingsValue)
    }, 0)

    return {
      totalSavings,
      actionedSavings,
      totalCount: filteredRecommendations.length,
      actionedCount: actionedItems.length,
    }
  })()

  const getOpportunityRange = () => {
    if (filteredRecommendations.length === 0) {
      return { low: 0, high: 0, total: 0 }
    }

    const totalSavings = filteredTotals.totalSavings

    return {
      low: totalSavings * 0.5,
      high: totalSavings * 0.9,
      total: totalSavings,
    }
  }

  const opportunityRange = getOpportunityRange()

  const newRecommendationsCount = (() => {
    if (!dateRange?.from || !dateRange?.to) {
      return currentRecommendations.length
    }

    const newRecommendations = currentRecommendations.filter((item) => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!
    })

    return newRecommendations.length
  })()

  const actionedInPeriodCount = (() => {
    if (!dateRange?.from || !dateRange?.to) {
      return currentRecommendations.filter((item) => item.status === "Actioned").length
    }

    const actionedInPeriod = currentRecommendations.filter((item) => {
      if (item.status !== "Actioned") return false
      if (item.actionedDate) {
        const itemDate = new Date(item.actionedDate)
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!
      }
      return false
    })

    return actionedInPeriod.length
  })()

  const getPeriodText = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return "all time"
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const from = new Date(dateRange.from)
    from.setHours(0, 0, 0, 0)
    const to = new Date(dateRange.to)
    to.setHours(0, 0, 0, 0)

    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    const isToday =
      to.getDate() === today.getDate() && to.getMonth() === today.getMonth() && to.getFullYear() === today.getFullYear()

    if (isToday) {
      if (diffDays === 7) return "Last 7 days"
      if (diffDays === 30) return "Last 30 days"
      if (diffDays === 90) return "Last 90 days"
      if (diffDays >= 365 && diffDays <= 366) return "Last 12 months"
    }

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = String(date.getFullYear()).slice(-2)
      return `${day}/${month}/${year}`
    }

    return `from ${formatDate(from)} to ${formatDate(to)}`
  }

  const getCategoryCounts = (categoryTitle: string) => {
    const categoryItems = currentRecommendations.filter((item) => item.category === categoryTitle)
    const totalCount = categoryItems.length
    const actionedCount = categoryItems.filter((item) => item.status === "Actioned").length

    return {
      actionedCount,
      totalCount,
    }
  }

  const getRevisitCount = (categoryTitle: string) => {
    const categoryItems = currentRecommendations.filter((item) => item.category === categoryTitle)
    const revisitCount = categoryItems.filter((item) => item.status === "Re-visit").length
    return revisitCount
  }

  const getCategoryEffortCounts = (categoryTitle: string) => {
    const categoryItems = currentRecommendations.filter((item) => item.category === categoryTitle)
    const lowCount = categoryItems.filter((item) => item.effort === "Low").length
    const mediumCount = categoryItems.filter((item) => item.effort === "Medium").length
    const highCount = categoryItems.filter((item) => item.effort === "High").length

    return {
      low: lowCount,
      medium: mediumCount,
      high: highCount,
    }
  }

  const getEaseOfImplementation = (categoryTitle: string) => {
    const categoryMapping: Record<string, { label: string; color: string; bgColor: string }> = {
      "Reserved Instances": { label: "Easy", color: "text-green-600", bgColor: "bg-green-50" },
      DEVUAT: { label: "Medium", color: "text-amber-600", bgColor: "bg-amber-50" },
      "Hybrid Benefit": { label: "Easy", color: "text-green-600", bgColor: "bg-green-50" },
      "VM Optimisation": { label: "Hard", color: "text-red-600", bgColor: "bg-red-50" },
      "Savings Plans": { label: "Medium", color: "text-amber-600", bgColor: "bg-amber-50" },
      Zombies: { label: "Easy", color: "text-green-600", bgColor: "bg-green-50" },
      Storage: { label: "Medium", color: "text-amber-600", bgColor: "bg-amber-50" },
      Database: { label: "Medium", color: "text-amber-600", bgColor: "bg-amber-50" },
    }

    return categoryMapping[categoryTitle] || null
  }

  const totalRecommendationsCount = unfilteredTotals.totalCount
  const actionedRecommendationsCount = unfilteredTotals.actionedCount

  const allTimeProgressPercentage = Math.round((actionedRecommendationsCount / totalRecommendationsCount) * 100)
  const displayPercentage =
    !dateRange?.from || !dateRange?.to
      ? Math.min(Math.round((filteredTotals.actionedSavings / targetGoal) * 100), 100)
      : Math.min(Math.round((filteredTotals.actionedSavings / targetGoal) * 100), 100)

  const cloudStatsData = [
    {
      title: "Total Opportunity (Low - High Range)",
      value: `£${filteredTotals.totalSavings.toLocaleString()}`,
      numericValue: filteredTotals.totalSavings,
      subtitle: `${filteredTotals.totalCount} recommendations`,
      color: "text-green-600",
    },
    {
      title: "Total Savings Achieved",
      value: `£${filteredTotals.actionedSavings.toLocaleString()}`,
      numericValue: filteredTotals.actionedSavings,
      subtitle: `From ${filteredTotals.actionedCount} implemented recommendations`,
      color: "text-blue-600",
    },
  ]

  const saasStatsData = [
    {
      title: "Total Opportunity",
      value: `£${filteredTotals.totalSavings.toLocaleString()}`,
      numericValue: filteredTotals.totalSavings,
      subtitle: `${filteredTotals.totalCount} recommendations`,
      color: "text-green-600",
    },
    {
      title: "Total Savings Achieved",
      value: `£${filteredTotals.actionedSavings.toLocaleString()}`,
      numericValue: filteredTotals.actionedSavings,
      subtitle: `From ${filteredTotals.actionedCount} implemented recommendations`,
      color: "text-blue-600",
    },
  ]

  const cloudCategoriesData = [
    {
      icon: Server,
      title: "Reserved Instances",
      savings: `£${(totals.categorySavings["Reserved Instances"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Reserved Instances"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("Reserved Instances", selectedStatuses),
    },
    {
      icon: Zap,
      title: "DEVUAT",
      savings: `£${(totals.categorySavings["DEVUAT"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["DEVUAT"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("DEVUAT", selectedStatuses),
    },
    {
      icon: Shield,
      title: "Hybrid Benefit",
      savings: `£${(totals.categorySavings["Hybrid Benefit"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Hybrid Benefit"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("Hybrid Benefit", selectedStatuses),
    },
    {
      icon: DollarSign,
      title: "Savings Plans",
      savings: `£${(totals.categorySavings["Savings Plans"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Savings Plans"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("Savings Plans", selectedStatuses),
    },
    {
      icon: Cpu,
      title: "VM Optimisation",
      savings: `£${(totals.categorySavings["VM Optimisation"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["VM Optimisation"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("VM Optimisation", selectedStatuses),
    },
    {
      icon: Archive,
      title: "Zombies",
      savings: `£${(totals.categorySavings["Zombies"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Zombies"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("Zombies", selectedStatuses),
    },
    {
      icon: HardDrive,
      title: "Storage",
      savings: `£${(totals.categorySavings["Storage"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Storage"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("Storage", selectedStatuses),
    },
    {
      icon: Database,
      title: "Database",
      savings: `£${(totals.categorySavings["Database"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Database"] || 0,
      highPriorityCount: getHighPriorityCountByCategory("Database", selectedStatuses),
    },
  ]

  const saasCategoriesData = [
    {
      icon: DollarSign,
      title: "Financial",
      savings: `£${(totals.categorySavings["Financial"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Financial"] || 0,
      highPriorityCount: getHighPriorityCountByCategorySaaS("Financial", selectedStatuses),
    },
    {
      icon: Settings,
      title: "Operations",
      savings: `£${(totals.categorySavings["Operations"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Operations"] || 0,
      highPriorityCount: getHighPriorityCountByCategorySaaS("Operations", selectedStatuses),
    },
    {
      icon: Lock,
      title: "Security",
      savings: `£${(totals.categorySavings["Security"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Security"] || 0,
      highPriorityCount: getHighPriorityCountByCategorySaaS("Security", selectedStatuses),
    },
    {
      icon: BarChart3,
      title: "Adoption",
      savings: `£${(totals.categorySavings["Adoption"] || 0).toLocaleString()}`,
      savingsNumeric: totals.categorySavings["Adoption"] || 0,
      highPriorityCount: getHighPriorityCountByCategorySaaS("Adoption", selectedStatuses),
    },
  ]

  const isCloudManagement = managementType === "Multi-Cloud"
  const statsData = isCloudManagement ? cloudStatsData : saasStatsData
  const categoriesData = isCloudManagement
    ? [...cloudCategoriesData].sort((a, b) => {
        // First, sort by high priority count (descending)
        if (b.highPriorityCount !== a.highPriorityCount) {
          return b.highPriorityCount - a.highPriorityCount
        }
        // Then, sort by savings amount (descending)
        return b.savingsNumeric - a.savingsNumeric
      })
    : [...saasCategoriesData].sort((a, b) => {
        // First, sort by high priority count (descending)
        if (b.highPriorityCount !== a.highPriorityCount) {
          return b.highPriorityCount - a.highPriorityCount
        }
        // Then, sort by savings amount (descending)
        return b.savingsNumeric - a.savingsNumeric
      })

  console.log(
    "[v0] OptimizationContent - Using categories:",
    categoriesData.map((c) => c.title),
  )
  console.log("[v0] OptimizationContent - Total recommendations:", currentRecommendations.length)

  const totalPotential = statsData[0].numericValue
  const totalAchieved = statsData[1].numericValue
  const achievementPercentage = Math.round((totalAchieved / totalPotential) * 100)
  const remainingOpportunity = totalPotential - totalAchieved
  const implementedCount = filteredTotals.actionedCount
  const totalCount = filteredTotals.totalCount

  const handleCategoryClick = (categoryTitle: string) => {
    if (isCloudManagement) {
      router.push(`/?category=${encodeURIComponent(categoryTitle)}&groupBy=priority`)
    } else {
      router.push(`/saas/optimization?category=${encodeURIComponent(categoryTitle)}&groupBy=priority`)
    }
  }

  const handleSubCategoryClick = (categoryTitle: string, subCategory: string) => {
    const encodedCategory = encodeURIComponent(categoryTitle)
    const encodedSubCategory = encodeURIComponent(subCategory)
    console.log("[v0] OptimizationContent - Navigating with category:", categoryTitle, "subCategory:", subCategory)
    const url = isCloudManagement
      ? `/?category=${encodedCategory}&subCategory=${encodedSubCategory}&groupBy=priority`
      : `/saas/optimization?category=${encodedCategory}&subCategory=${encodedSubCategory}&groupBy=priority`
    console.log("[v0] OptimizationContent - Navigating to:", url)
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: "smooth" })
    router.push(url)
  }

  const getSubCategorySavings = (categoryTitle: string) => {
    const categoryItems = currentRecommendations.filter((item) => item.category === categoryTitle)
    const subCategorySavings: Record<string, number> = {}

    categoryItems.forEach((item) => {
      const subCategory = item.subCategory || "Other"
      if (!subCategorySavings[subCategory]) {
        subCategorySavings[subCategory] = 0
      }
      const savingsValue =
        typeof item.savings === "string" ? Number.parseFloat(item.savings.replace(/[£$,]/g, "")) : item.savings
      subCategorySavings[subCategory] += isNaN(savingsValue) ? 0 : savingsValue
    })

    return subCategorySavings
  }

  const toggleCategoryExpansion = (categoryTitle: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle)
      } else {
        newSet.add(categoryTitle)
      }
      return newSet
    })
  }

  const getVelocityData = () => {
    if (!dateRange?.from || !dateRange?.to) {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 12)

      const data = []
      const currentDate = new Date(from)
      const intervalDays = 30

      while (currentDate <= to) {
        const intervalEnd = new Date(currentDate)
        intervalEnd.setDate(intervalEnd.getDate() + intervalDays - 1)
        if (intervalEnd > to) {
          intervalEnd.setTime(to.getTime())
        }

        const newInInterval = currentRecommendations.filter((item) => {
          const itemDate = new Date(item.createdDate)
          return itemDate >= currentDate && itemDate <= intervalEnd
        }).length

        const actionedInInterval = currentRecommendations.filter((item) => {
          if (item.status !== "Actioned") return false
          if (item.actionedDate) {
            const itemDate = new Date(item.actionedDate)
            return itemDate >= currentDate && itemDate <= intervalEnd
          }
          return false
        }).length

        const dateLabel = currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        data.push({
          date: dateLabel,
          implemented: actionedInInterval,
          new: newInInterval,
        })

        currentDate.setDate(currentDate.getDate() + intervalDays)
      }

      return data
    }

    const from = new Date(dateRange.from)
    const to = new Date(dateRange.to)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let intervalDays = 1
    let intervalLabel = "day"
    if (diffDays > 90) {
      intervalDays = 30
      intervalLabel = "month"
    } else if (diffDays > 30) {
      intervalDays = 7
      intervalLabel = "week"
    }

    const data = []
    const currentDate = new Date(from)

    while (currentDate <= to) {
      const intervalEnd = new Date(currentDate)
      intervalEnd.setDate(intervalEnd.getDate() + intervalDays - 1)
      if (intervalEnd > to) {
        intervalEnd.setTime(to.getTime())
      }

      const newInInterval = currentRecommendations.filter((item) => {
        const itemDate = new Date(item.createdDate)
        return itemDate >= currentDate && itemDate <= intervalEnd
      }).length

      const actionedInInterval = currentRecommendations.filter((item) => {
        if (item.status !== "Actioned") return false
        if (item.actionedDate) {
          const itemDate = new Date(item.actionedDate)
          return itemDate >= currentDate && itemDate <= intervalEnd
        }
        return false
      }).length

      const dateLabel =
        intervalDays === 1
          ? `${currentDate.getDate()}/${currentDate.getMonth() + 1}`
          : intervalDays === 7
            ? `Week ${Math.ceil((currentDate.getTime() - from.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`
            : currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      data.push({
        date: dateLabel,
        implemented: actionedInInterval,
        new: newInInterval,
      })

      currentDate.setDate(currentDate.getDate() + intervalDays)
    }

    return data
  }

  const velocityData = getVelocityData()

  const getPeriodProgress = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return null
    }

    const periodProgressPercentage = Math.round((actionedInPeriodCount / filteredRecommendations.length) * 100)
    const allTimeProgressPercentage = Math.round((actionedRecommendationsCount / totalRecommendationsCount) * 100)

    return {
      periodProgressPercentage,
      allTimeProgressPercentage,
    }
  }

  const periodProgress = getPeriodProgress()

  const getAgedRecommendations = () => {
    const today = new Date()

    const agedItems = currentRecommendations.filter((item) => {
      if (item.status === "Actioned") return false

      const itemDate = new Date(item.createdDate)
      const daysSinceCreation = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceCreation < ageThreshold) return false

      if (dateRange?.from && dateRange?.to) {
        const isInDateRange = itemDate >= dateRange.from && itemDate <= dateRange.to
        return isInDateRange
      }

      return true
    })

    return {
      count: agedItems.length,
      period: getPeriodText(),
    }
  }

  const agedRecommendations = getAgedRecommendations()

  const handleSaveTargetGoal = () => {
    const value = Number.parseFloat(targetInputValue)
    if (!isNaN(value) && value > 0) {
      setTargetGoal(value)
      setIsTargetDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Card 1: Estimated Saves */}
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex flex-col h-full">
            <div className="min-h-[32px] flex items-start justify-between">
              <p className="text-xs font-medium text-gray-600">
                Estimated yearly saves
                <br />
                (Low - High)
              </p>
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setDisplayMode("currency")}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                    displayMode === "currency"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  £
                </button>
                <button
                  onClick={() => setDisplayMode("percentage")}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                    displayMode === "percentage"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  %
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-4">
              {displayMode === "currency" ? (
                <>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-2xl font-bold text-gray-900 cursor-help">
                          £{formatAbbreviatedNumber(opportunityRange.low)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Low estimate: {((opportunityRange.low / opportunityRange.total) * 100).toFixed(0)}% of total
                          potential
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-2xl font-bold text-gray-900"> - </span>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-2xl font-bold text-gray-900 cursor-help">
                          £{formatAbbreviatedNumber(opportunityRange.high)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          High estimate: {((opportunityRange.high / opportunityRange.total) * 100).toFixed(0)}% of total
                          potential
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-2xl font-bold text-gray-900 cursor-help">
                          {((opportunityRange.low / opportunityRange.total) * 100).toFixed(0)}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Low estimate: £{opportunityRange.low.toLocaleString()} of £
                          {opportunityRange.total.toLocaleString()} total potential
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-2xl font-bold text-gray-900"> - </span>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-2xl font-bold text-gray-900 cursor-help">
                          {((opportunityRange.high / opportunityRange.total) * 100).toFixed(0)}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          High estimate: £{opportunityRange.high.toLocaleString()} of £
                          {opportunityRange.total.toLocaleString()} total potential
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>

            <div className="min-h-[24px] flex flex-col justify-start mt-2">
              {(!dateRange?.from || !dateRange?.to) && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 whitespace-normal w-fit"
                >
                  {totalCount.toLocaleString()} recommendations
                </Badge>
              )}
              {newRecommendationsCount > 0 && dateRange?.from && dateRange?.to && (
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 whitespace-normal"
                  >
                    {newRecommendationsCount.toLocaleString()} new recommendations
                  </Badge>
                  <span className="text-[10px] text-gray-500">{getPeriodText()}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Card 2: Achieved */}
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex flex-col h-full">
            <div className="min-h-[32px] flex items-start">
              <p className="text-xs font-medium text-gray-600">Achieved</p>
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-4">{statsData[1].value}</p>

            <div className="min-h-[24px] flex flex-col justify-start mt-2">
              {(!dateRange?.from || !dateRange?.to) && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200 w-fit"
                >
                  {implementedCount.toLocaleString()} implemented
                </Badge>
              )}
              {actionedInPeriodCount > 0 && dateRange?.from && dateRange?.to && (
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200"
                  >
                    {actionedInPeriodCount.toLocaleString()} implemented
                  </Badge>
                  <span className="text-[10px] text-gray-500">{getPeriodText()}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Card 3: Progress */}
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex flex-col h-full">
            <div className="min-h-[32px] flex items-start justify-between">
              <p className="text-xs font-medium text-gray-600">Progress vs Target Goal</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTargetInputValue(targetGoal.toString())
                  setIsTargetDialogOpen(true)
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <Pencil className="h-3 w-3 text-gray-500" />
              </Button>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-2xl font-bold text-gray-900">{displayPercentage.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">
                £{filteredTotals.actionedSavings.toLocaleString()} / £{targetGoal.toLocaleString()}
              </p>
            </div>

            <div className="min-h-[24px] flex flex-col justify-start gap-2 mt-2">
              <TooltipProvider delayDuration={300}>
                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-visible">
                  {!dateRange?.from || !dateRange?.to ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-1.5 bg-blue-600 rounded-l-full cursor-pointer"
                            style={{ width: `${displayPercentage}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Achieved: £{filteredTotals.actionedSavings.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">
                            {displayPercentage.toFixed(1)}% of £{targetGoal.toLocaleString()} target goal
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {projectedProgress && projectedProgress.additionalPercentage > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute top-0 h-1.5 rounded-r-full cursor-pointer opacity-60"
                              style={{
                                left: `${displayPercentage}%`,
                                width: `${projectedProgress.additionalPercentage}%`,
                                background: `repeating-linear-gradient(
                                  45deg,
                                  rgb(147, 197, 253),
                                  rgb(147, 197, 253) 2px,
                                  rgb(191, 219, 254) 2px,
                                  rgb(191, 219, 254) 4px
                                )`,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Projected by next month: £
                              {(
                                filteredTotals.actionedSavings + projectedProgress.projectedAdditionalSavings
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {projectedProgress.projectedPercentage}% of target goal
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="h-1.5 bg-blue-600 rounded-full cursor-pointer"
                          style={{ width: `${displayPercentage}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Achieved {getPeriodText()}: £{filteredTotals.actionedSavings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {displayPercentage.toFixed(1)}% of £{targetGoal.toLocaleString()} target goal
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </Card>

        {/* Card 4: Aged Recommendations */}
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex flex-col h-full">
            <div className="min-h-[32px] flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Aged Recommendations</p>
                <p className="text-xs font-medium text-gray-600">(days of inactivity)</p>
              </div>
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-2 py-1 text-xs font-medium rounded transition-colors bg-white text-gray-900 shadow-sm flex items-center gap-1">
                      {ageThreshold === 90 ? "90d+" : `${ageThreshold}d`}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setAgeThreshold(30)}>30d</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAgeThreshold(60)}>60d</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAgeThreshold(90)}>90d+</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-4">{agedRecommendations.count}</p>

            <div className="min-h-[24px] flex flex-col justify-start gap-2 mt-2">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border-amber-200 w-fit"
              >
                {`${ageThreshold}${ageThreshold === 90 ? "+" : ""} days of inactivity since being added`}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recommendation Categories</h2>
      </div>

      {isCloudManagement ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {categoriesData.map((category, index) => {
            const IconComponent = category.icon
            const counts = getCategoryCounts(category.title)
            const easeOfImplementation = getEaseOfImplementation(category.title)
            const isLast = index === categoriesData.length - 1
            const highPriorityCount = category.highPriorityCount
            const revisitCount = getRevisitCount(category.title)

            return (
              <div key={index} className={`${!isLast ? "border-b border-gray-200" : ""}`}>
                <div
                  onClick={() => handleCategoryClick(category.title)}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">{counts.totalCount.toLocaleString()} recommendations</p>
                          {highPriorityCount > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              >
                                {highPriorityCount.toLocaleString()} High Priority
                              </Badge>
                            </>
                          )}
                          {revisitCount > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                              >
                                {revisitCount.toLocaleString()} Re-visit
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">{category.savings}</p>
                        <p className="text-xs text-gray-500">Potential Annual Savings</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {categoriesData.map((category, index) => {
            const IconComponent = category.icon
            const counts = getCategoryCounts(category.title)
            const highPriorityCount = category.highPriorityCount
            const revisitCount = getRevisitCount(category.title)
            const isExpanded = expandedCategories.has(category.title)
            const subCategorySavings = getSubCategorySavings(category.title)
            const hasSubCategories = Object.keys(subCategorySavings).length > 0

            return (
              <div key={index} className="border border-gray-200 rounded-lg bg-white">
                <div
                  onClick={() => handleCategoryClick(category.title)}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">{counts.totalCount.toLocaleString()} recommendations</p>
                          {highPriorityCount > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              >
                                {highPriorityCount.toLocaleString()} High Priority
                              </Badge>
                            </>
                          )}
                          {revisitCount > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                              >
                                {revisitCount.toLocaleString()} Re-visit
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {category.title === "Financial" && (
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">{category.savings}</p>
                          <p className="text-xs text-gray-500">Potential Annual Savings</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {hasSubCategories && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCategoryExpansion(category.title, e)
                    }}
                    className={`border-t border-gray-200 bg-white px-6 py-4 cursor-pointer flex items-center gap-1.5 ${
                      !isExpanded ? "rounded-b-lg" : ""
                    }`}
                  >
                    <ChevronRight
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 ease-in-out ${
                        isExpanded ? "rotate-90" : "rotate-0"
                      }`}
                    />
                    <span className="text-sm text-gray-600">View sub-categories</span>
                  </div>
                )}

                {hasSubCategories && (
                  <div
                    className={`bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isExpanded ? "max-h-[1000px] opacity-100 rounded-b-lg" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 py-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sub-categories</p>
                      <div className="space-y-2">
                        {Object.entries(subCategorySavings)
                          .sort(([, a], [, b]) => b - a)
                          .map(([subCategory, savings]) => {
                            // Get recommendations for this sub-category to check priority and status
                            const subCategoryItems = currentRecommendations.filter(
                              (item) =>
                                item.category === category.title && (item.subCategory || "Other") === subCategory,
                            )
                            const hasHighPriority = subCategoryItems.some((item) => item.priority === "High")
                            const hasRevisit = subCategoryItems.some((item) => item.status === "Re-visit")
                            const itemCount = subCategoryItems.length

                            return (
                              <div
                                key={subCategory}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSubCategoryClick(category.title, subCategory)
                                }}
                                className="flex items-center justify-between py-4 px-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                      {subCategory}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({itemCount} {itemCount === 1 ? "item" : "items"})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {hasHighPriority && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200"
                                      >
                                        High Priority
                                      </Badge>
                                    )}
                                    {hasRevisit && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border-cyan-200"
                                      >
                                        Revisit
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors">
                                    £{savings.toLocaleString()}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Target Goal</DialogTitle>
            <DialogDescription>
              Enter your target savings goal in £. Progress will be tracked against this target.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="target-goal">Target Goal (£)</Label>
              <Input
                id="target-goal"
                type="number"
                value={targetInputValue}
                onChange={(e) => setTargetInputValue(e.target.value)}
                placeholder="Enter target amount"
                min="0"
                step="1000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTargetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTargetGoal}>Save Target</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OptimizationContent
