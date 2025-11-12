"use client"

import { useState } from "react"
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

export function StaticTabsFilters() {
  const [activeTab, setActiveTab] = useState("default")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("VM Optimisation")
  const [selectedSubCategory, setSelectedSubCategory] = useState("All")
  const [groupBy, setGroupBy] = useState("Priority")
  const [addFilterOpen, setAddFilterOpen] = useState(false)

  const tabs = [
    { id: "default", name: "Default View" },
    { id: "pending-review", name: "Pending Review" },
    { id: "snoozed-archived", name: "Snoozed & Archived" },
    { id: "actioned", name: "Actioned" },
  ]

  const categories = [
    "VM Optimisation",
    "Reserved Instances",
    "Hybrid Benefit",
    "Savings Plans",
    "DEVUAT",
  ]

  const subCategories = [
    "All",
    "Underutilized",
    "Oversized",
    "Idle",
    "Right-sizing",
  ]

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border bg-background">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 border-b-2 transition-all duration-200 ease-in-out cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="text-sm">{tab.name}</span>
            </div>
          ))}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 ease-in-out cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Search */}
        <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? "w-64" : "w-24"}`}>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={isSearchExpanded ? "Search recommendations" : "Q Search"}
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
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
              >
                Priority
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
              >
                Provider
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
              >
                Status
              </button>
            </div>
          </PopoverContent>
        </Popover>

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
              <SelectItem value="Priority">Priority</SelectItem>
              <SelectItem value="Category">Category</SelectItem>
              <SelectItem value="Effort">Effort</SelectItem>
              <SelectItem value="Status">Status</SelectItem>
              <SelectItem value="Provider">Provider</SelectItem>
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
      </div>
    </div>
  )
}

