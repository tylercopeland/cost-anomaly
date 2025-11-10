"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import OptimizationContent from "@/components/optimization-content"
import { useEffect } from "react"
import { useManagement } from "@/lib/management-context"

export default function OptimizationPage() {
  const defaultStatuses = new Set(["New", "Viewed"])
  const { setManagementType, managementType } = useManagement()

  useEffect(() => {
    console.log("[v0] Cloud Optimization Page - Current managementType:", managementType)
    if (managementType !== "Multi-Cloud") {
      console.log("[v0] Setting managementType to Multi-Cloud")
      setManagementType("Multi-Cloud")
    }
  }, [managementType, setManagementType])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <OptimizationContent selectedStatuses={defaultStatuses} />
        </main>
      </div>
    </div>
  )
}
