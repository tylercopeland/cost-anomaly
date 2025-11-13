"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, ArrowUp, Columns3, ChevronRight } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { suddenSpikesData, trendingConcernsData } from "@/lib/cost-anomaly-data"

interface StaticTableProps {
  activeTab?: string
}

export function StaticTable({ activeTab = "sudden-spikes" }: StaticTableProps) {
  const router = useRouter()
  const staticData = activeTab === "trending-concerns" ? trendingConcernsData : suddenSpikesData
  const [visibleColumns, setVisibleColumns] = useState({
    resourceGroup: true,
    classification: true,
    severity: true,
    costChange: true,
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
    { id: "resourceGroup", label: "Resource Group" },
    { id: "classification", label: "Classification" },
    { id: "severity", label: "Severity" },
    { id: "costChange", label: "Cost Change" },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Table Header */}
      <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-muted-foreground tracking-wide">
        <div className="w-4 flex-shrink-0 mr-5">
          <Checkbox
            className="h-4 w-4"
            disabled
          />
        </div>
        <div className="flex-[1.2] min-w-[150px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Resource Group
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("resourceGroup", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("resourceGroup", "desc")}>
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
        <div className="flex-[1.5] min-w-[180px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Classification
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("classification", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("classification", "desc")}>
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
        <div className="flex-[0.8] min-w-[90px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Severity
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("severity", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("severity", "desc")}>
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
        <div className="flex-[1] min-w-[120px]">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Cost Change
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => handleSort("costChange", "asc")}>
                  <ArrowUp className="h-3.5 w-3.5 mr-2" />
                  Sort Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("costChange", "desc")}>
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
        {staticData.map((item) => (
          <div
            key={item.id}
            className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push(`/cost-anomaly/${item.id}`)}
          >
            <div className="w-4 flex-shrink-0 mr-5" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                className="h-4 w-4"
                disabled
              />
            </div>

            <div className="flex-[1.2] min-w-[150px] mr-5">
              <div className="font-medium text-foreground text-sm mb-0.5 truncate">{item.resourceGroup}</div>
              <p className="text-xs text-muted-foreground truncate">{item.subIdentifier}</p>
            </div>

            <div className="flex-[1.5] min-w-[180px] mr-5">
              <span className="text-xs text-foreground">{item.classification}</span>
            </div>

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

            <div className="flex-[1] min-w-[120px]">
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${
                  item.costChangeDollar >= 0 ? "text-red-600" : "text-green-600"
                }`}>
                  {item.costChangeDollar >= 0 ? "+" : ""}${item.costChangeDollar.toLocaleString()}
                </span>
                <span className={`text-xs text-gray-600 ${
                  item.costChangePercent >= 0 ? "" : ""
                }`}>
                  {item.costChangePercent >= 0 ? "Increased by " : "Decreased by "}{Math.abs(item.costChangePercent)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

