"use client"

import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"

export default function CostAnomalyPage() {
  return (
    <div className="flex h-screen bg-background">
      <StaticSidebar />
      <div className="flex-1 flex flex-col">
        <StaticHeader />
        <main className="flex-1 overflow-auto p-6">
          <div>
            <h1 className="text-2xl font-bold">Cost Anomaly</h1>
          </div>
        </main>
      </div>
    </div>
  )
}

