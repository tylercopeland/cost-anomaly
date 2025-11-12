"use client"

import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"
import { StaticTable } from "@/components/static-table"
import { StaticOverviewCards } from "@/components/static-overview-cards"
import { StaticCategories } from "@/components/static-categories"
import { StaticTabsFilters } from "@/components/static-tabs-filters"

export default function KitchenSinkPage() {
  return (
    <div className="flex h-screen bg-background">
      <StaticSidebar />
      <div className="flex-1 flex flex-col">
        <StaticHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Kitchen Sink</h1>
              <p className="text-muted-foreground">A showcase of core UI components</p>
            </div>

            {/* Overview Cards */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <StaticOverviewCards />
            </div>

            {/* Recommendation Categories */}
            <div className="mt-8">
              <StaticCategories />
            </div>

            {/* Tabs and Filters */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Table View with Filters</h2>
              <StaticTabsFilters />
            </div>

            {/* Static Table */}
            <div className="mt-4">
              <StaticTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

