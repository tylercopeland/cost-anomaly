"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal } from "lucide-react"

// Static dummy data
const staticData = [
  {
    id: "1",
    title: "Resize underutilized VM instances",
    description: "Consider resizing VM instances that are consistently underutilized",
    provider: "Azure",
    category: "VM Optimisation",
    date: "2024-01-15",
    effort: "Medium",
    priority: "High",
    savings: "£12,450",
    status: "New",
  },
  {
    id: "2",
    title: "Purchase Reserved Instances",
    description: "Save costs by purchasing reserved instances for predictable workloads",
    provider: "AWS",
    category: "Reserved Instances",
    date: "2024-01-20",
    effort: "Easy",
    priority: "Medium",
    savings: "£8,900",
    status: "Re-visit",
  },
  {
    id: "3",
    title: "Enable Hybrid Benefit",
    description: "Apply Azure Hybrid Benefit to reduce licensing costs",
    provider: "Azure",
    category: "Hybrid Benefit",
    date: "2024-01-25",
    effort: "Easy",
    priority: "High",
    savings: "£15,200",
    status: "New",
  },
  {
    id: "4",
    title: "Optimize storage costs",
    description: "Move infrequently accessed data to cheaper storage tiers",
    provider: "Google Cloud",
    category: "Storage",
    date: "2024-02-01",
    effort: "Medium",
    priority: "Low",
    savings: "£5,300",
    status: "Viewed",
  },
  {
    id: "5",
    title: "Implement Savings Plans",
    description: "Replace on-demand instances with savings plans for better pricing",
    provider: "AWS",
    category: "Savings Plans",
    date: "2024-02-05",
    effort: "Medium",
    priority: "Medium",
    savings: "£22,100",
    status: "New",
  },
]

export function StaticTable() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Table Header */}
      <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-muted-foreground tracking-wide">
        <div className="w-4 flex-shrink-0 mr-5">
          <Checkbox
            className="h-4 w-4"
            disabled
          />
        </div>
        <div className="flex-[2] min-w-[180px] max-w-[400px] mr-5 pr-3 border-r border-gray-200">
          <div className="flex items-center justify-between group">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              Recommendation
            </div>
            <button className="p-1 hover:bg-gray-200 rounded opacity-50 cursor-not-allowed" disabled>
              <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-[1.2] min-w-[140px] mr-5 pr-3 border-r border-gray-200">
          <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap text-left">
            Provider
          </div>
        </div>
        <div className="flex-[0.9] min-w-[110px] mr-5 pr-3 border-r border-gray-200">
          <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
            Category
          </div>
        </div>
        <div className="flex-[0.8] min-w-[100px] mr-5 pr-3 border-r border-gray-200">
          <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
            Date
          </div>
        </div>
        <div className="flex-[0.6] min-w-[70px] mr-5 pr-3 border-r border-gray-200">
          <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
            Effort
          </div>
        </div>
        <div className="flex-[0.6] min-w-[70px] mr-5 pr-3 border-r border-gray-200">
          <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
            Priority
          </div>
        </div>
        <div className="flex-[1] min-w-[120px]">
          <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
            Potential Savings
          </div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {staticData.map((item) => (
          <div
            key={item.id}
            className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-4 flex-shrink-0 mr-5">
              <Checkbox
                className="h-4 w-4"
                disabled
              />
            </div>

            <div className="flex-[2] min-w-[180px] max-w-[400px] mr-5">
              <div className="mb-1">
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 h-4 border ${
                    item.status === "New"
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : item.status === "Re-visit"
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : item.status === "Viewed"
                          ? "bg-gray-100 text-gray-600 border-gray-300"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}
                >
                  {item.status}
                </Badge>
              </div>
              <h4 className="font-medium text-foreground text-sm mb-0.5 truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>

            <div className="flex-[1.2] min-w-[140px] mr-5">
              <span className="text-xs font-medium text-foreground truncate">{item.provider}</span>
            </div>

            <div className="flex-[0.9] min-w-[110px] mr-5">
              <span className="text-xs font-medium text-foreground truncate">{item.category}</span>
            </div>

            <div className="flex-[0.8] min-w-[100px] text-left mr-5">
              <div className="text-xs text-muted-foreground">{item.date}</div>
            </div>

            <div className="flex-[0.6] min-w-[70px] text-left mr-5">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0.5 ${
                  item.effort === "Easy"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : item.effort === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {item.effort}
              </Badge>
            </div>

            <div className="flex-[0.6] min-w-[70px] text-left mr-5">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0.5 ${
                  item.priority === "High"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : item.priority === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {item.priority}
              </Badge>
            </div>

            <div className="flex-[1] min-w-[120px]">
              <span className="text-xs font-semibold text-green-600">{item.savings}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

