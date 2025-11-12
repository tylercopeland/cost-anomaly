"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { OptimizationDashboard } from "@/components/optimization-dashboard"
import OptimizationContent from "@/components/optimization-content"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useManagement } from "@/lib/management-context"

function SalesforceContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("category")
  const defaultStatuses = new Set(["New", "Viewed", "Re-visit"])
  const { managementType, setManagementType } = useManagement()

  useEffect(() => {
    if (managementType !== "Multi-SaaS") {
      setManagementType("Multi-SaaS")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementType])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {categoryFilter ? (
            <OptimizationDashboard initialCategoryFilter={categoryFilter} initialProvider="salesforce" dataSource="saas" />
          ) : (
            <div className="p-4">
              <OptimizationContent selectedStatuses={defaultStatuses} initialProvider="salesforce" />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function SalesforcePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalesforceContent />
    </Suspense>
  )
}

