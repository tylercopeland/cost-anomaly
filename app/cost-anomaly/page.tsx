"use client"

import { useState, useMemo } from "react"
import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"
import { StaticTable } from "@/components/static-table"
import { StaticTabsFilters } from "@/components/static-tabs-filters"
import { suddenSpikesData, trendingConcernsData } from "@/lib/cost-anomaly-data"

export default function CostAnomalyPage() {
  const [activeTab, setActiveTab] = useState("sudden-spikes")
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<('classification' | 'severity')[]>([])

  const baseData = activeTab === "trending-concerns" ? trendingConcernsData : suddenSpikesData

  // Get unique classifications and severities
  const availableClassifications = useMemo(() => {
    const classifications = new Set(baseData.map(item => item.classification))
    return Array.from(classifications).sort()
  }, [baseData])

  const availableSeverities = useMemo(() => {
    const severities = new Set(baseData.map(item => item.severity))
    return Array.from(severities).sort((a, b) => {
      const order = { 'High': 3, 'Medium': 2, 'Low': 1 }
      return (order[b as keyof typeof order] || 0) - (order[a as keyof typeof order] || 0)
    })
  }, [baseData])

  const handleAddFilter = (type: 'classification' | 'severity') => {
    if (!activeFilters.includes(type)) {
      setActiveFilters([...activeFilters, type])
    }
  }

  const handleRemoveFilter = (type: 'classification' | 'severity') => {
    setActiveFilters(activeFilters.filter(f => f !== type))
    if (type === 'classification') {
      setSelectedClassification(null)
    } else {
      setSelectedSeverity(null)
    }
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
                activeFilters={activeFilters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                selectedClassification={selectedClassification}
                selectedSeverity={selectedSeverity}
                onClassificationChange={setSelectedClassification}
                onSeverityChange={setSelectedSeverity}
                availableClassifications={availableClassifications}
                availableSeverities={availableSeverities}
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
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

