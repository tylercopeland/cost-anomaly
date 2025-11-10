"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { OptimizationDashboard } from "@/components/optimization-dashboard"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SaaSHomeContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("category")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <OptimizationDashboard initialCategoryFilter={categoryFilter} />
        </main>
      </div>
    </div>
  )
}

export default function SaaSHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SaaSHomeContent />
    </Suspense>
  )
}
