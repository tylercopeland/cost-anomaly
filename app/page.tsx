"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { OptimizationDashboard } from "@/components/optimization-dashboard"
import OptimizationContent from "@/components/optimization-content"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function HomeContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get("category")

  const showOverview = !categoryFilter

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {showOverview ? (
            <div className="p-4">
              <OptimizationContent />
            </div>
          ) : (
            <OptimizationDashboard initialCategoryFilter={categoryFilter} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
