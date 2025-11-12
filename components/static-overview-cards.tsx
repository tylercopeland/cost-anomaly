"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function StaticOverviewCards() {
  const [displayMode, setDisplayMode] = useState<"currency" | "percentage">("currency")
  const [ageThreshold, setAgeThreshold] = useState<number>(30)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Estimated yearly saves */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col h-full">
          <div className="min-h-[32px] flex items-start justify-between">
            <p className="text-xs font-medium text-gray-600">
              Estimated yearly saves
              <br />
              (Low - High)
            </p>
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setDisplayMode("currency")}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  displayMode === "currency"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                £
              </button>
              <button
                onClick={() => setDisplayMode("percentage")}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  displayMode === "percentage"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                %
              </button>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mt-4">
            {displayMode === "currency" ? (
              <>
                <span className="text-2xl font-bold text-gray-900">£5.6m</span>
                <span className="text-2xl font-bold text-gray-900"> - </span>
                <span className="text-2xl font-bold text-gray-900">£10.1m</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">12%</span>
                <span className="text-2xl font-bold text-gray-900"> - </span>
                <span className="text-2xl font-bold text-gray-900">22%</span>
              </>
            )}
          </div>

          <div className="min-h-[24px] flex flex-col justify-start mt-2">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 whitespace-normal w-fit"
            >
              708 recommendations
            </Badge>
          </div>
        </div>
      </Card>

      {/* Card 2: Achieved */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col h-full">
          <div className="min-h-[32px] flex items-start">
            <p className="text-xs font-medium text-gray-600">Achieved</p>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-4">£1,128,079</p>

          <div className="min-h-[24px] flex flex-col justify-start mt-2">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200 w-fit"
            >
              118 implemented
            </Badge>
          </div>
        </div>
      </Card>

      {/* Card 3: Progress vs Target Goal */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col h-full">
          <div className="min-h-[32px] flex items-start justify-between">
            <p className="text-xs font-medium text-gray-600">Progress vs Target Goal</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Pencil className="h-3 w-3 text-gray-500" />
            </Button>
          </div>

          <div className="flex items-baseline gap-2 mt-4">
            <p className="text-2xl font-bold text-gray-900">100.0%</p>
            <p className="text-xs text-gray-500">£1,128,079 / £100,000</p>
          </div>

          <div className="min-h-[24px] flex flex-col justify-start gap-2 mt-2">
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-visible">
              <div
                className="h-1.5 bg-blue-600 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Card 4: Aged Recommendations */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col h-full">
          <div className="min-h-[32px] flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Aged Recommendations</p>
              <p className="text-xs font-medium text-gray-600">(days of inactivity)</p>
            </div>
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2 py-1 text-xs font-medium rounded transition-colors bg-white text-gray-900 shadow-sm flex items-center gap-1">
                    {ageThreshold === 90 ? "90d+" : `${ageThreshold}d`}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAgeThreshold(30)}>30d</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgeThreshold(60)}>60d</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgeThreshold(90)}>90d+</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-2xl font-bold text-gray-900 mt-4">290</p>

          <div className="min-h-[24px] flex flex-col justify-start mt-2">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200 w-fit"
            >
              {ageThreshold} days of inactivity since being added
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}

