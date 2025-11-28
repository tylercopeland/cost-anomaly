"use client"

import { useState } from "react"
import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"
import { StaticTable } from "@/components/static-table"
import { StaticTabsFilters } from "@/components/static-tabs-filters"

export default function CostAnomalyPage() {
  const [activeTab, setActiveTab] = useState("sudden-spikes")
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'classification' | 'severity' | null>(null)

  const handleFilterSelect = (type: 'classification' | 'severity') => {
    setFilterType(type)
  }

  return (
    <div className="flex h-screen bg-background">
      <StaticSidebar />
      <div className="flex-1 flex flex-col">
        <StaticHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Cost Anomaly</h1>
            </div>

            {/* Tabs and Filters */}
            <div>
              <StaticTabsFilters 
                showOnlyFilterButton={true} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onFilterSelect={handleFilterSelect}
              />
            </div>

            {/* Static Table */}
            <div className="mt-4">
              <StaticTable 
                activeTab={activeTab}
                selectedClassification={selectedClassification}
                selectedSeverity={selectedSeverity}
                onClassificationChange={setSelectedClassification}
                onSeverityChange={setSelectedSeverity}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

