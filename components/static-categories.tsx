"use client"

import { Badge } from "@/components/ui/badge"
import { Server, Zap, Shield, DollarSign, Cpu, ChevronRight } from "lucide-react"

const categories = [
  {
    icon: Cpu,
    title: "VM Optimisation",
    recommendations: 133,
    highPriority: 42,
    revisit: 6,
    savings: "£3,501,635",
  },
  {
    icon: Server,
    title: "Reserved Instances",
    recommendations: 122,
    highPriority: 42,
    revisit: 5,
    savings: "£3,183,426",
  },
  {
    icon: Shield,
    title: "Hybrid Benefit",
    recommendations: 149,
    highPriority: 38,
    revisit: 10,
    savings: "£1,110,280",
  },
  {
    icon: DollarSign,
    title: "Savings Plans",
    recommendations: 118,
    highPriority: 32,
    revisit: 4,
    savings: "£2,882,495",
  },
  {
    icon: Zap,
    title: "DEVUAT",
    recommendations: 60,
    highPriority: 14,
    revisit: 2,
    savings: "£215,668",
  },
]

export function StaticCategories() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Recommendation Categories</h2>
      <div className="space-y-2">
        {categories.map((category, index) => {
          const IconComponent = category.icon
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg bg-white p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{category.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">{category.recommendations} recommendations</p>
                      {category.highPriority > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          >
                            {category.highPriority} High Priority
                          </Badge>
                        </>
                      )}
                      {category.revisit > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                          >
                            {category.revisit} Re-visit
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{category.savings}</p>
                    <p className="text-xs text-gray-500">Potential Annual Savings</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

