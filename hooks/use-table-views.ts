"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"

export interface TableView {
  id: string
  name: string
  isDefault: boolean
  isPermanent?: boolean // Added isPermanent flag for non-deletable views like My Board
  config: {
    selectedPriorities: string[]
    selectedProvider: string
    selectedType: string
    selectedStatuses: string[]
    selectedOwners: string[]
    selectedCategories: string[]
    selectedTagTypes: string[]
    selectedTagValues: string[]
    groupBy: string
    dateRange?: DateRange
    selectedSubCategory?: string[]
  }
}

interface UseTableViewsOptions {
  storageKey: string
  defaultConfig: TableView["config"]
}

// Helper function to convert date strings back to Date objects
function reviveDates(config: TableView["config"]): TableView["config"] {
  if (config.dateRange) {
    return {
      ...config,
      dateRange: {
        from: config.dateRange.from ? new Date(config.dateRange.from) : undefined,
        to: config.dateRange.to ? new Date(config.dateRange.to) : undefined,
      },
    }
  }
  return config
}

export function useTableViews({ storageKey, defaultConfig }: UseTableViewsOptions) {
  const [views, setViews] = useState<TableView[]>([
    {
      id: "default",
      name: "All Recommendations",
      isDefault: true,
      isPermanent: true,
      config: defaultConfig,
    },
    {
      id: "pending-review",
      name: "Pending Review",
      isDefault: false,
      isPermanent: true,
      config: {
        ...defaultConfig,
        selectedStatuses: ["Marked for review"],
        groupBy: "priority", // Group by priority for pending review items
      },
    },
    {
      id: "snoozed-archived",
      name: "Snoozed & Archived",
      isDefault: false,
      isPermanent: true,
      config: {
        ...defaultConfig,
        selectedStatuses: ["Snoozed", "Archived"],
        groupBy: "status", // Group by status to show Snoozed and Archived as separate sections
      },
    },
    {
      id: "actioned",
      name: "Actioned",
      isDefault: false,
      isPermanent: true,
      config: {
        ...defaultConfig,
        selectedStatuses: ["Actioned"],
        groupBy: "priority", // Group by priority for actioned items
      },
    },
  ])
  const [activeViewId, setActiveViewId] = useState<string>("default")

  // Load views from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)

        const storedViews = parsed.views || []

        const filteredViews = storedViews.filter((view: TableView) => view.id !== "my-board")

        const viewsWithDates = filteredViews.map((view: TableView) => ({
          ...view,
          config: reviveDates(view.config),
        }))

        const permanentTabs = [
          {
            id: "default",
            name: "All Recommendations",
            isDefault: true,
            isPermanent: true,
            config: defaultConfig,
          },
          {
            id: "pending-review",
            name: "Pending Review",
            isDefault: false,
            isPermanent: true,
            config: {
              ...defaultConfig,
              selectedStatuses: ["Marked for review"],
              groupBy: "priority",
            },
          },
          {
            id: "snoozed-archived",
            name: "Snoozed & Archived",
            isDefault: false,
            isPermanent: true,
            config: {
              ...defaultConfig,
              selectedStatuses: ["Snoozed", "Archived"],
              groupBy: "status",
            },
          },
          {
            id: "actioned",
            name: "Actioned",
            isDefault: false,
            isPermanent: true,
            config: {
              ...defaultConfig,
              selectedStatuses: ["Actioned"],
              groupBy: "priority",
            },
          },
        ]

        // Add permanent tabs if they don't exist
        const mergedViews = [...permanentTabs]
        viewsWithDates.forEach((view: TableView) => {
          if (!permanentTabs.some((pt) => pt.id === view.id)) {
            mergedViews.push(view)
          }
        })

        setViews(mergedViews)

        const newActiveViewId = parsed.activeViewId === "my-board" ? "default" : parsed.activeViewId || "default"
        setActiveViewId(newActiveViewId)
      } catch (error) {
        console.error("[v0] Failed to parse stored views:", error)
      }
    }
  }, [storageKey])

  // Save views to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        views,
        activeViewId,
      }),
    )
  }, [views, activeViewId, storageKey])

  const saveView = (name: string, config: TableView["config"]) => {
    const newView: TableView = {
      id: `view-${Date.now()}`,
      name,
      isDefault: false,
      config,
    }
    setViews((prev) => [...prev, newView])
    setActiveViewId(newView.id)
  }

  const updateView = (viewId: string, config: TableView["config"]) => {
    setViews((prev) => prev.map((view) => (view.id === viewId ? { ...view, config } : view)))
  }

  const deleteView = (viewId: string) => {
    const viewToDelete = views.find((view) => view.id === viewId)
    if (viewToDelete?.isPermanent) return

    setViews((prev) => prev.filter((view) => view.id !== viewId))

    // If deleting active view, switch to default
    if (activeViewId === viewId) {
      setActiveViewId("default")
    }
  }

  const renameView = (viewId: string, newName: string) => {
    const viewToRename = views.find((view) => view.id === viewId)
    if (viewToRename?.isPermanent) return

    setViews((prev) => prev.map((view) => (view.id === viewId ? { ...view, name: newName } : view)))
  }

  const getActiveView = () => {
    return views.find((view) => view.id === activeViewId) || views[0]
  }

  // Helper function to check if current config differs from saved config
  const hasUnsavedChanges = (currentConfig: TableView["config"]) => {
    const activeView = getActiveView()
    if (!activeView) return false

    // Deep comparison of configs
    return JSON.stringify(currentConfig) !== JSON.stringify(activeView.config)
  }

  return {
    views,
    activeViewId,
    setActiveViewId,
    saveView,
    updateView,
    deleteView,
    renameView,
    getActiveView,
    hasUnsavedChanges, // Export the new helper function
  }
}
