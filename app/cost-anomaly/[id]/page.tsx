"use client"

import { StaticSidebar } from "@/components/static-sidebar"
import { StaticHeader } from "@/components/static-header"
import { findCostAnomalyItem } from "@/lib/cost-anomaly-data"

export default function CostAnomalyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const item = findCostAnomalyItem(id)

  return (
    <div className="flex h-screen bg-background">
      <StaticSidebar />
      <div className="flex-1 flex flex-col">
        <StaticHeader resourceGroupName={item?.resourceGroup} />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{item?.resourceGroup || "Cost Anomaly Details"}</h1>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

