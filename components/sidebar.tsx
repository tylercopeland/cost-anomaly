"use client"

import React, { startTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Settings, User, ChevronDown, Bot } from "lucide-react"
import { useManagement } from "@/lib/management-context"
import { usePathname, useRouter } from "next/navigation"

const saasServices = [
  { name: "Adobe", route: "/saas/adobe", providerName: "Adobe", providerId: "adobe" },
  { name: "M365", route: "/saas/m365", providerName: "Microsoft 365", providerId: "m365" },
  { name: "Salesforce", route: "/saas/salesforce", providerName: "Salesforce", providerId: "salesforce" },
  { name: "Slack", route: "/saas/slack", providerName: "Slack", providerId: "slack" },
  { name: "Zoom", route: "/saas/zoom", providerName: "Zoom", providerId: "zoom" },
]

export function AppSidebar() {
  const { managementType, setManagementType } = useManagement()
  const pathname = usePathname()
  const router = useRouter()

  const handleHomeClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    startTransition(() => {
      router.push("/")
    })
  }

  const handleCloudOverviewClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setManagementType("Multi-Cloud")
    startTransition(() => {
      router.push("/optimization")
    })
  }

  const handleCloudProviderClick = (route: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setManagementType("Multi-Cloud")
    startTransition(() => {
      router.push(route)
    })
  }

  const handleSaaSOverviewClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setManagementType("Multi-SaaS")
    startTransition(() => {
      router.push("/saas/optimization")
    })
  }

  const handleServiceClick = (route: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setManagementType("Multi-SaaS")
    startTransition(() => {
      router.push(route)
    })
  }

  const handleConfigurationClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    startTransition(() => {
      router.push("/configuration")
    })
  }

  const isHomeActive = pathname === "/" && !pathname.startsWith("/optimization") && !pathname.startsWith("/saas")
  const isCloudActive = pathname.startsWith("/optimization") || (pathname === "/" && managementType === "Multi-Cloud")
  const isSaaSActive = pathname.startsWith("/saas")
  const isServiceActive = (route: string) => pathname === route
  const isConfigurationActive = pathname.startsWith("/configuration")


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
                  variant={pathname === "/optimization" || (pathname === "/" && managementType === "Multi-Cloud") || pathname.includes("provider=azure") ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 h-8 text-sm",
                    (pathname === "/optimization" || (pathname === "/" && managementType === "Multi-Cloud") || pathname.includes("provider=azure")) && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={(e) => handleCloudOverviewClick(e)}
                >
                  Azure
                </Button>
              </li>
            </ul>
          </li>

          {/* Multi-SaaS Section */}
          <li className="mt-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
              MULTI-SAAS
            </div>
            <ul className="space-y-1">
              <li>
                <Button
                  type="button"
                  variant={pathname === "/saas/optimization" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 h-8 text-sm",
                    pathname === "/saas/optimization" && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={(e) => handleSaaSOverviewClick(e)}
                >
                  <span className="flex-1 text-left">Overview</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                    WIP
                  </span>
                </Button>
              </li>
              {saasServices.map((service) => (
                <li key={service.name}>
                  <Button
                    type="button"
                    variant={isServiceActive(service.route) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 h-8 text-sm",
                      isServiceActive(service.route) && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={(e) => handleServiceClick(service.route, e)}
                  >
                    {service.name}
                  </Button>
                </li>
              ))}
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

export { AppSidebar as Sidebar }
