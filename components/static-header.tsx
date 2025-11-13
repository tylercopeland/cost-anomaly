"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

interface StaticHeaderProps {
  resourceGroupName?: string
}

export function StaticHeader({ resourceGroupName }: StaticHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const getBreadcrumb = () => {
    if (pathname === "/cost-anomaly") {
      return (
        <span className="text-foreground font-medium">Cost Anomaly</span>
      )
    }
    if (pathname?.startsWith("/cost-anomaly/")) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/cost-anomaly")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Cost Anomaly
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{resourceGroupName || "Details"}</span>
        </div>
      )
    }
    if (pathname === "/kitchen-sink") {
      return (
        <span className="text-foreground font-medium">Kitchen Sink</span>
      )
    }
    return (
      <span className="text-foreground font-medium">Cost Anomaly</span>
    )
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          {getBreadcrumb()}
        </div>
      </div>
    </header>
  )
}

