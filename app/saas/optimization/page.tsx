"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { OptimizationDashboard } from "@/components/optimization-dashboard"
import OptimizationContent from "@/components/optimization-content"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useManagement } from "@/lib/management-context"

function SaaSOptimizationContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("category")
  const defaultStatuses = new Set(["New", "Viewed", "Re-visit"]) // Include Re-visit status in default statuses
  const { managementType, setManagementType } = useManagement()

  useEffect(() => {
    console.log("[v0] SaaS Optimization Page - Current managementType:", managementType)
    if (managementType !== "Multi-SaaS") {
      console.log("[v0] Setting managementType to Multi-SaaS")
      setManagementType("Multi-SaaS")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementType])

  console.log("[v0] SaaS Optimization Page - categoryFilter:", categoryFilter)
  console.log("[v0] SaaS Optimization Page - managementType:", managementType)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {categoryFilter ? (
            <OptimizationDashboard initialCategoryFilter={categoryFilter} dataSource="saas" />
          ) : (
            <div className="p-4">
              <OptimizationContent selectedStatuses={defaultStatuses} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function SaaSOptimizationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SaaSOptimizationContent />
    </Suspense>
  )
}
