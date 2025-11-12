"use client"

import type React from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function Header() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const category = searchParams.get("category")

  const handleOverviewClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault()
    console.log("[v0] Header - Overview clicked")
    console.log("[v0] Header - Current pathname:", pathname)
    console.log("[v0] Header - Current category:", category)
    console.log("[v0] Header - Navigating to:", route)

    // router.push() doesn't clear query params when pathname is the same
    if (pathname === route) {
      // Same pathname - need to manually clear query params
      window.history.pushState({}, "", route)
      router.refresh()
    } else {
      // Different pathname - router.push works fine
      router.push(route)
    }
  }

  const renderBreadcrumbs = () => {
    if (pathname === "/" && category) {
      return (
        <>
          <a
            href="/optimization"
            onClick={(e) => handleOverviewClick(e, "/optimization")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Overview
          </a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Recommendations</span>
        </>
      )
    }

    if (pathname === "/optimization") {
      const provider = searchParams.get("provider")
      if (provider === "azure") {
        if (category) {
          return (
            <>
              <a
                href="/optimization"
                onClick={(e) => handleOverviewClick(e, "/optimization")}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Multi-Cloud
              </a>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <a
                href="/optimization?provider=azure"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/optimization?provider=azure")
                }}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Azure
              </a>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Recommendations</span>
            </>
          )
        }
        return (
          <>
            <a
              href="/optimization"
              onClick={(e) => handleOverviewClick(e, "/optimization")}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Multi-Cloud
            </a>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Azure</span>
          </>
        )
      }
      if (category) {
        return (
          <>
            <a
              href="/optimization"
              onClick={(e) => handleOverviewClick(e, "/optimization")}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Overview
            </a>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Recommendations</span>
          </>
        )
      }
      return <span className="text-foreground font-medium">Overview</span>
    } else if (pathname === "/saas/optimization") {
      if (category) {
        return (
          <>
            <a
              href="/saas/optimization"
              onClick={(e) => handleOverviewClick(e, "/saas/optimization")}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Overview
            </a>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Recommendations</span>
          </>
        )
      }
      return <span className="text-foreground font-medium">Overview</span>
    } else if (pathname.startsWith("/saas/") && pathname !== "/saas/optimization" && pathname !== "/saas/license-optimization" && !pathname.startsWith("/saas/license-optimization/")) {
      // Provider pages (e.g., /saas/m365, /saas/salesforce)
      const providerPath = pathname.split("/").pop() || ""
      const providerMap: Record<string, string> = {
        m365: "M365",
        salesforce: "Salesforce",
        adobe: "Adobe",
        slack: "Slack",
        zoom: "Zoom",
      }
      const providerName = providerMap[providerPath] || providerPath

      if (category) {
        return (
          <>
            <a
              href="/saas/optimization"
              onClick={(e) => handleOverviewClick(e, "/saas/optimization")}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Multi-SaaS
            </a>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <a
              href={pathname}
              onClick={(e) => {
                e.preventDefault()
                router.push(pathname)
              }}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {providerName}
            </a>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Recommendations</span>
          </>
        )
      }
      return (
        <>
          <a
            href="/saas/optimization"
            onClick={(e) => handleOverviewClick(e, "/saas/optimization")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Multi-SaaS
          </a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{providerName}</span>
        </>
      )
    } else if (pathname === "/saas/license-optimization") {
      return (
        <>
          <Link href="/saas/optimization" className="text-muted-foreground hover:text-foreground transition-colors">
            Overview
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">License Optimization</span>
        </>
      )
    } else if (pathname === "/license-optimization") {
      return (
        <>
          <Link href="/optimization" className="text-muted-foreground hover:text-foreground transition-colors">
            Overview
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">License Optimization</span>
        </>
      )
    } else if (pathname.startsWith("/license-optimization/")) {
      const subPage = pathname.split("/").pop()
      const subPageTitle = subPage ? subPage.charAt(0).toUpperCase() + subPage.slice(1) : ""
      return (
        <>
          <Link href="/optimization" className="text-muted-foreground hover:text-foreground transition-colors">
            Overview
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link href="/license-optimization" className="text-muted-foreground hover:text-foreground transition-colors">
            License Optimization
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{subPageTitle}</span>
        </>
      )
    } else if (pathname.startsWith("/saas/license-optimization/")) {
      const subPage = pathname.split("/").pop()
      const subPageTitle = subPage ? subPage.charAt(0).toUpperCase() + subPage.slice(1) : ""
      return (
        <>
          <Link href="/saas/optimization" className="text-muted-foreground hover:text-foreground transition-colors">
            Overview
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link
            href="/saas/license-optimization"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            License Optimization
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{subPageTitle}</span>
        </>
      )
    }

    return <span className="text-foreground font-medium">Overview</span>
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-sm">{renderBreadcrumbs()}</div>
      </div>
    </header>
  )
}
