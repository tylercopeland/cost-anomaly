"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bot, Search, Settings, User, ChevronDown, Building2 } from "lucide-react"
import { useManagement } from "@/lib/management-context"
import { usePathname, useRouter } from "next/navigation"

const navigationItems = [
  { name: "Copilot", icon: Bot, href: "#" },
  { name: "Discover", icon: Search, href: "#" },
  { name: "Multi-Cloud", icon: Settings, href: "/optimization" },
  { name: "Multi-SaaS", icon: Building2, href: "/saas/optimization" },
]

export function AppSidebar() {
  const { managementType, setManagementType } = useManagement()
  const pathname = usePathname()
  const router = useRouter()

  const handleNavClick = (item: (typeof navigationItems)[0]) => {
    if (item.name === "Multi-Cloud") {
      setManagementType("Multi-Cloud")
      router.push("/optimization")
    } else if (item.name === "Multi-SaaS") {
      setManagementType("Multi-SaaS")
      router.push("/saas/optimization")
    } else if (item.href !== "#") {
      router.push(item.href)
    }
  }

  const isActive = (item: (typeof navigationItems)[0]) => {
    if (item.name === "Multi-Cloud") {
      return !pathname.startsWith("/saas")
    } else if (item.name === "Multi-SaaS") {
      return pathname.startsWith("/saas")
    }
    return false
  }

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
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Button
                variant={isActive(item) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-8 text-sm",
                  isActive(item) && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
                onClick={() => handleNavClick(item)}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Button>
            </li>
          ))}
        </ul>

        {/* Pinned Boards */}
        <div className="mt-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pinned Boards</h3>
        </div>
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
