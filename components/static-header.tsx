"use client"

import type React from "react"
import { usePathname } from "next/navigation"

export function StaticHeader() {
  const pathname = usePathname()
  
  const getBreadcrumb = () => {
    if (pathname === "/cost-anomaly") {
      return "Cost Anomaly"
    }
    if (pathname === "/kitchen-sink") {
      return "Kitchen Sink"
    }
    return "Cost Anomaly"
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-foreground font-medium">{getBreadcrumb()}</span>
        </div>
      </div>
    </header>
  )
}

