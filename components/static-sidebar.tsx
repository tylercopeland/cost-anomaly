"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Settings, User, ChevronDown, Bot } from "lucide-react"
import { useRouter } from "next/navigation"

export function StaticSidebar() {
  const router = useRouter()

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-primary-foreground rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sidebar-foreground text-sm">Surveil</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {/* Home */}
          <li>
            <Button
              variant="ghost"
              disabled
              className={cn(
                "w-full justify-start gap-2 h-8 text-sm cursor-not-allowed opacity-50",
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              disabled
              className={cn(
                "w-full justify-start gap-2 h-8 text-sm cursor-not-allowed opacity-50",
              )}
            >
              <Bot className="w-4 h-4" />
              Cloud Assistant
            </Button>
          </li>

          {/* Multi-Cloud Section */}
          <li className="mt-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
              MULTI-CLOUD
            </div>
            <ul className="space-y-1">
              <li>
                <Button
                  type="button"
                  variant="ghost"
                  disabled
                  className={cn(
                    "w-full justify-start gap-2 h-8 text-sm cursor-not-allowed opacity-50",
                  )}
                >
                  Overview
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 h-8 text-sm",
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push("/cost-anomaly")
                  }}
                >
                  Cost Anomaly
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 h-8 text-sm",
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push("/kitchen-sink")
                  }}
                >
                  Kitchen Sink
                </Button>
              </li>
            </ul>
          </li>

          {/* Configuration */}
          <li className="mt-4">
            <Button
              variant="ghost"
              disabled
              className={cn(
                "w-full justify-start gap-2 h-8 text-sm cursor-not-allowed opacity-50",
              )}
            >
              <Settings className="w-4 h-4" />
              Configuration
            </Button>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Smith</p>
            <p className="text-xs text-muted-foreground truncate">john.smith@company.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

