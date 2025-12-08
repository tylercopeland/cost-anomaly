"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, ArrowUp, Columns3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

// Static dummy data for recommendations
const staticRecommendationsData = [
  {
    id: "1",
    recommendation: "Resize VM Instance",
    provider: "Microsoft Azure",
    category: "VM Optimisation",
    date: "2024-01-15",
    effort: "Easy",
    priority: "High",
    potentialSavings: 15000,
  },
  {
    id: "2",
    recommendation: "Delete Unused Storage",
    provider: "Amazon Web Services",
    category: "Storage",
    date: "2024-01-14",
    effort: "Medium",
    priority: "Medium",
    potentialSavings: 8500,
  },
  {
    id: "3",
    recommendation: "Purchase Reserved Instances",
    provider: "Google Cloud Platform",
    category: "Reserved Instances",
    date: "2024-01-13",
    effort: "Hard",
    priority: "High",
    potentialSavings: 25000,
  },
  {
    id: "4",
    recommendation: "Optimize Database Configuration",
    provider: "Microsoft Azure",
    category: "Database",
    date: "2024-01-12",
    effort: "Medium",
    priority: "Low",
    potentialSavings: 3200,
  },
  {
    id: "5",
    recommendation: "Remove Zombie Resources",
    provider: "Amazon Web Services",
    category: "Zombies",
    date: "2024-01-11",
    effort: "Easy",
    priority: "Medium",
    potentialSavings: 12000,
  },
  {
    id: "6",
    recommendation: "Enable Hybrid Benefit",
    provider: "Microsoft Azure",
    category: "Hybrid Benefit",
    date: "2024-01-10",
    effort: "Easy",
    priority: "High",
    potentialSavings: 18000,
  },
]

export function StaticRecommendationsTable() {
  const [visibleColumns, setVisibleColumns] = useState({
    recommendation: true,
    provider: true,
    category: true,
    date: true,
    effort: true,
    priority: true,
    potentialSavings: true,
  })

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleSort = (column: string, direction: "asc" | "desc") => {
    // Static functionality - no actual sorting
    console.log(`Sort ${column} ${direction}`)
  }

  const columns = [
    { id: "recommendation", label: "Recommendation" },
    { id: "provider", label: "Provider" },
    { id: "category", label: "Category" },
    { id: "date", label: "Date" },
    { id: "effort", label: "Effort" },
    { id: "priority", label: "Priority" },
    { id: "potentialSavings", label: "Potential Savings" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Table Header */}
      <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-muted-foreground tracking-wide">
        <div className="flex-[2] min-w-[200px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Recommendation
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("recommendation", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("recommendation", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-[1.5] min-w-[150px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Provider
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("provider", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("provider", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-[1.2] min-w-[120px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Category
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("category", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("category", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-[1] min-w-[100px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Date
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("date", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("date", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-[0.8] min-w-[80px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Effort
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("effort", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("effort", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-[0.8] min-w-[80px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Priority
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("priority", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("priority", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-[1.2] min-w-[120px]">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Potential Savings
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("potentialSavings", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("potentialSavings", "desc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                  Sort Descending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Columns3 className="h-3.5 w-3.5 mr-2" />
                    Choose columns
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 p-2">
                    <div className="space-y-2">
                      {columns.map((column) => {
                        const columnId = `column-${column.id}`
                        return (
                          <div key={column.id} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={columnId}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id as keyof typeof visibleColumns)}
                            />
                            <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                              {column.label}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {staticRecommendationsData.map((item) => (
          <div
            key={item.id}
            className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
          >

            <div className="flex-[2] min-w-[200px] mr-5">
              <div className="font-medium text-foreground text-sm mb-0.5 truncate">{item.recommendation}</div>
            </div>

            <div className="flex-[1.5] min-w-[150px] mr-5">
              <span className="text-sm text-foreground">{item.provider}</span>
            </div>

            <div className="flex-[1.2] min-w-[120px] mr-5">
              <span className="text-sm text-foreground">{item.category}</span>
            </div>

            <div className="flex-[1] min-w-[100px] mr-5">
              <span className="text-sm text-muted-foreground">{item.date}</span>
            </div>

            <div className="flex-[0.8] min-w-[80px] mr-5">
              <Badge
                variant="outline"
                className={`text-xs ${getEffortColor(item.effort)}`}
              >
                {item.effort}
              </Badge>
            </div>

            <div className="flex-[0.8] min-w-[80px] mr-5">
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(item.priority)}`}
              >
                {item.priority}
              </Badge>
            </div>

            <div className="flex-[1.2] min-w-[120px]">
              <span className="text-sm font-semibold text-foreground">
                £{item.potentialSavings.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

