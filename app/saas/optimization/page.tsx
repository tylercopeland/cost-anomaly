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
        <main className="flex-1 overflow-auto relative">
          {categoryFilter ? (
            <OptimizationDashboard initialCategoryFilter={categoryFilter} dataSource="saas" />
          ) : (
            <>
              <div className="p-4 opacity-40 pointer-events-none">
                <OptimizationContent selectedStatuses={defaultStatuses} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-lg border border-amber-200 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-700 font-bold text-sm">WIP</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Work in Progress</p>
                      <p className="text-xs text-gray-600">This page is currently under development</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
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
