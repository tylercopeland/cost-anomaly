"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  Archive,
  Trash2,
  Undo2,
  Send,
  ArrowUp,
  MoreHorizontal,
  Columns3,
  Tag,
  X,
  ArrowLeft,
  ArrowDown,
  EyeOff,
  Clock,
  Flag,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RecommendationSidePanel } from "./recommendation-side-panel"
import { AzureIcon, AWSIcon, GoogleCloudIcon } from "./cloud-provider-icons"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArchiveModal } from "./archive-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { SendToIntegrationModal } from "./send-to-integration-modal"
import { RevisitModal } from "./revisit-modal"
import { useToast } from "@/hooks/use-toast"
import { allRecommendations as allItems, priorityMap } from "@/lib/recommendations-data"
import { allSaaSRecommendations as allSaaSItems } from "@/lib/saas-recommendations-data"
import type { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Import Popover
import React from "react" // Import React
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReviewModal } from "./review-modal" // Import ReviewModal
import { cn } from "@/lib/utils" // Import cn

const getEaseToImplement = (category: string): "Easy" | "Medium" | "Hard" => {
  const easeMap: Record<string, "Easy" | "Medium" | "Hard"> = {
    "Reserved Instances": "Easy",
    DEVUAT: "Medium",
    "Hybrid Benefit": "Easy",
    "VM Optimisation": "Hard",
    "Savings Plans": "Medium",
    Zombies: "Easy",
    Storage: "Medium",
    Database: "Medium",
  }
  return easeMap[category] || "Medium"
}

// Transform the shared data to match the expected format
const transformedItems = allItems.map((item) => ({
  ...item,
  savings: item.savingsFormatted,
  icon: item.provider === "azure" ? AzureIcon : item.provider === "aws" ? AWSIcon : GoogleCloudIcon,
  iconUrl: null,
}))

const calculatePriorityBySavings = (savingsString: string): "high" | "medium" | "low" => {
  const amount = Number.parseInt(savingsString.replace(/[£,]/g, ""))

  // High priority: savings >= £2000
  if (amount >= 2000) return "high"

  // Medium priority: £1000 <= savings < £2000
  if (amount >= 1000) return "medium"

  // Low priority: savings < £1000
  return "low"
}

const priorityColors = {
  high: "bg-red-500/5",
  medium: "bg-orange-500/5",
  low: "bg-blue-500/5",
}

const priorityHeaderColors = {
  high: "bg-gray-50 border-gray-200 border-b-gray-300",
  medium: "bg-gray-50 border-gray-200 border-b-gray-300",
  low: "bg-gray-50 border-gray-200 border-b-gray-300",
}

const priorityLabels = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
}

const groupByOptions = [
  { value: "priority", label: "Priority" },
  { value: "provider", label: "Provider" },
  { value: "status", label: "Status" },
  { value: "category", label: "Category" },
  { value: "tagType", label: "Tag Type" },
  { value: "easeToImplement", label: "Ease to Implement" },
  { value: "none", label: "None" },
]

const providerLabels = {
  azure: "Microsoft Azure",
  aws: "Amazon Web Services",
  gcp: "Google Cloud Platform",
}

const statusLabels = {
  New: "New",
  Viewed: "Viewed",
  "Marked for review": "Marked for review",
  "Re-visit": "Re-visit",
  Archived: "Archived",
  Snoozed: "Snoozed",
  Actioned: "Actioned",
}

const tagTypeLabels = {
  "Cost-allocation-type": "Cost Allocation Type",
  "Cost-center": "Cost Center",
  Environment: "Environment",
  Portfolio: "Portfolio",
  "Shared-cost-type": "Shared Cost Type",
  "Sub-portfolio": "Sub-Portfolio",
}

const easeToImplementLabels = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
}

interface SortRule {
  id: string
  field: string
  direction: "asc" | "desc"
}

interface RecommendationsListProps {
  selectedPriorities: string[] | Set<string>
  recommendations?: any[]
  selectedProvider?: string
  selectedType?: string
  selectedStatuses?: string[] | Set<string>
  searchQuery?: string
  groupBy?: string
  selectedOwners?: string[] | Set<string>
  selectedCategories?: string[] | Set<string>
  selectedTagTypes?: string[] | Set<string>
  selectedTagValues?: string[] | Set<string>
  sortRules?: SortRule[]
  dateRange?: DateRange
  dateColumnLabel?: string // Add prop for customizable date column label
  savingsColumnLabel?: string // Add prop for customizable savings column label
  selectedSubCategory?: string[]
  activeViewId?: string
  dataSource?: "cloud" | "saas"
}

export function RecommendationsList({
  selectedPriorities,
  recommendations: externalRecommendations,
  selectedProvider = "all",
  selectedType = "all-types", // Changed default to "all-types"
  selectedStatuses = new Set(["New", "Viewed"]),
  searchQuery = "",
  groupBy: groupByProp = "priority", // Renamed to avoid conflict with prop name
  selectedOwners = new Set(["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]),
  selectedCategories = new Set(),
  selectedTagTypes = new Set(),
  selectedTagValues = new Set(),
  sortRules = [],
  dateRange,
  dateColumnLabel = "Date Added", // Updated default
  savingsColumnLabel = "Potential Savings", // Updated default
  selectedSubCategory = [],
  activeViewId = "default", // Added default value for activeViewId
  dataSource = "cloud",
}: RecommendationsListProps) {
  const sourceItems = dataSource === "saas" ? allSaaSItems : allItems

  // Transform the data to match the expected format
  const transformedItems = sourceItems.map((item) => ({
    ...item,
    savings: item.savingsFormatted,
    icon: item.provider === "azure" ? AzureIcon : item.provider === "aws" ? AWSIcon : GoogleCloudIcon,
    iconUrl: null,
  }))

  // FIX: Removed defaultRecommendations from useMemo dependency array to prevent lint warning
  const defaultRecommendations = useMemo(() => {
    return [
      {
        priority: "high",
        count: transformedItems.filter((item) => item.priority === "high").length,
        items: transformedItems.filter((item) => item.priority === "high"),
      },
      {
        priority: "medium",
        count: transformedItems.filter((item) => item.priority === "medium").length,
        items: transformedItems.filter((item) => item.priority === "medium"),
      },
      {
        priority: "low",
        count: transformedItems.filter((item) => item.priority === "low").length,
        items: transformedItems.filter((item) => item.priority === "low"),
      },
    ]
  }, [transformedItems]) // Dependency array includes transformedItems

  const finalRecommendations = useMemo(() => {
    return externalRecommendations || defaultRecommendations
  }, [externalRecommendations, defaultRecommendations])

  const prioritiesSet = useMemo(
    () => (selectedPriorities instanceof Set ? selectedPriorities : new Set(selectedPriorities)),
    [selectedPriorities],
  )
  const statusesSet = useMemo(
    () => (selectedStatuses instanceof Set ? selectedStatuses : new Set(selectedStatuses)),
    [selectedStatuses],
  )
  const ownersSet = useMemo(
    () => (selectedOwners instanceof Set ? selectedOwners : new Set(selectedOwners)),
    [selectedOwners],
  )
  const categoriesSet = useMemo(
    () => (selectedCategories instanceof Set ? selectedCategories : new Set(selectedCategories)),
    [selectedCategories],
  )
  const tagTypesSet = useMemo(
    () => (selectedTagTypes instanceof Set ? selectedTagTypes : new Set(selectedTagTypes)),
    [selectedTagTypes],
  )
  const tagValuesSet = useMemo(
    () => (selectedTagValues instanceof Set ? selectedTagValues : new Set(selectedTagValues)),
    [selectedTagValues],
  )

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [currentlyViewedItemId, setCurrentlyViewedItemId] = useState<number | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [visibleItemsCount, setVisibleItemsCount] = useState<Map<string, number>>(new Map())
  const [itemsPerPageMap, setItemsPerPageMap] = useState<Map<string, number>>(new Map())
  const [sectionPages, setSectionPages] = useState<Map<string, number>>(new Map()) // add section page state
  const [isolatedSection, setIsolatedSection] = useState<string | null>(null)
  const [isolatedViewPage, setIsolatedViewPage] = useState(1)
  const [flatListPage, setFlatListPage] = useState(1)
  const [flatListItemsPerPage, setFlatListItemsPerPage] = useState(25) // Updated default items per page
  const [isSmartTagDialogOpen, setIsSmartTagDialogOpen] = useState(false)
  const [selectedTagType, setSelectedTagValue] = useState<string>("")
  const [recommendationStatuses, setRecommendationStatuses] = useState<Map<number, string>>(new Map())
  const [recommendationOwners, setRecommendationOwners] = useState<Map<number, string>>(new Map())
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isRevisitModalOpen, setIsRevisitModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [archiveNotes, setArchiveNotes] = useState<Map<number, { note: string; owner: string; timestamp: string }>>(
    new Map(),
  )
  const [reviewNotes, setReviewNotes] = useState<Map<number, { note: string; owner: string; timestamp: string }>>(
    new Map(),
  )
  const [statusTimers, setStatusTimers] = useState<Map<number, Date>>(new Map())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const { toast } = useToast()
  const [animationKey, setAnimationKey] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set()) // Undeclared variable fix
  const prevHasSelection = useRef(false)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [visibleColumns, setVisibleColumns] = useState({
    provider: true,
    category: true,
    date: true,
    effort: true,
    priority: true,
    savings: true,
    status: true,
  })
  // </CHANGE> Removed isColumnDialogOpen state since we're using submenu instead

  // Smart Tag Dialog state
  const [selectedTag, setSelectedTag] = useState("")

  const [smartTags, setSmartTags] = useState<Array<{ type: string; value: string }>>([])
  const [originalTags, setOriginalTags] = useState<Array<{ type: string; value: string }>>([])
  const [removedTags, setRemovedTags] = useState<Array<{ type: string; value: string }>>([])
  const [addedTags, setAddedTags] = useState<Array<{ type: string; value: string }>>([])
  const [newTagType, setNewTagType] = React.useState("")
  const [newTagValue, setNewTagValue] = React.useState("")
  const [showTagValues, setShowTagValues] = React.useState(false)
  const [isAddTagPopoverOpen, setIsAddTagPopoverOpen] = React.useState(false)

  const prevDeps = useRef<any>({})

  const hasInitializedCollapsedSections = useRef(false)

  const getRowHighlightClass = (item: any) => {
    return currentlyViewedItemId === item.id ? "bg-blue-50" : "bg-white"
  }

  const getTimeRemaining = (expirationDate: string | undefined) => {
    if (!expirationDate) return "N/A"

    const now = new Date()
    const expDate = new Date(expirationDate)
    const diffMs = expDate.getTime() - now.getTime()

    if (diffMs <= 0) return "Expired"

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
    }
  }

  // /** rest of code here **/
  useEffect(() => {
    const initialReviewNotes = new Map<number, { note: string; owner: string; timestamp: string }>()

    let itemsToProcess: any[] = []

    if (finalRecommendations) {
      // Check if it's a priority groups structure (array of objects with 'items' property)
      if (Array.isArray(finalRecommendations) && finalRecommendations.length > 0 && finalRecommendations[0]?.items) {
        // Flatten priority groups to get all items
        itemsToProcess = finalRecommendations.flatMap((group) => group.items || [])
      } else if (Array.isArray(finalRecommendations)) {
        // It's already a flat array of items
        itemsToProcess = finalRecommendations
      }
    }

    itemsToProcess.forEach((rec) => {
      if (rec.reviewNote) {
        initialReviewNotes.set(rec.id, rec.reviewNote)
      }
    })

    setReviewNotes((prevNotes) => {
      // Check if the new notes are different from the previous notes
      if (prevNotes.size !== initialReviewNotes.size) {
        return initialReviewNotes
      }

      // Check if any note has changed
      let hasChanges = false
      initialReviewNotes.forEach((note, id) => {
        const prevNote = prevNotes.get(id)
        if (!prevNote || prevNote.note !== note.note || prevNote.owner !== note.owner) {
          hasChanges = true
        }
      })

      return hasChanges ? initialReviewNotes : prevNotes
    })
  }, [finalRecommendations]) // Changed dependency to finalRecommendations

  // Check timers every minute for expired snooze/archive timers
  useEffect(() => {
    const checkTimers = () => {
      const now = new Date()
      const newStatuses = new Map(recommendationStatuses)
      let hasChanges = false

      statusTimers.forEach((expirationDate, itemId) => {
        if (now >= expirationDate) {
          newStatuses.set(itemId, "Re-visit")
          hasChanges = true
        }
      })

      if (hasChanges) {
        setRecommendationStatuses(newStatuses)
        // Remove expired timers
        const newTimers = new Map(statusTimers)
        statusTimers.forEach((expirationDate, itemId) => {
          if (now >= expirationDate) {
            newTimers.delete(itemId)
          }
        })
        setStatusTimers(newTimers)
      }
    }

    // Check timers every minute
    const interval = setInterval(checkTimers, 60000)
    // Also check immediately on mount
    checkTimers()

    return () => clearInterval(interval)
  }, [statusTimers, recommendationStatuses])

  useEffect(() => {
    const deps = {
      selectedPriorities,
      selectedStatuses,
      selectedOwners,
      selectedCategories,
      selectedTagTypes,
      selectedTagValues,
      selectedProvider,
      selectedType,
      dateRange,
      searchQuery,
      groupByProp,
      recommendationStatuses,
      recommendationOwners,
      sortColumn,
      sortDirection,
      selectedSubCategory, // Added selectedSubCategory to dependencies
      activeViewId, // Added activeViewId to dependencies
    }

    Object.keys(deps).forEach((key) => {
      if (prevDeps.current[key] !== deps[key]) {
        // console.log(`[v0] Dependency changed: ${key}`, prevDeps.current[key], "→", deps[key])
      }
    })

    prevDeps.current = deps
  })

  useEffect(() => {
    const hasSelection = selectedItems.size > 0

    if (hasSelection && !prevHasSelection.current) {
      // Transitioning from no items to items selected - trigger animation
      setShowBulkActions(false)
      const timer = setTimeout(() => {
        setShowBulkActions(true)
      }, 10)
      prevHasSelection.current = true
      return () => clearTimeout(timer)
    } else if (hasSelection && prevHasSelection.current) {
      // Already showing, just keep it visible without re-animating
      setShowBulkActions(true)
    } else if (!hasSelection) {
      // No items selected, hide the bar
      setShowBulkActions(false)
      prevHasSelection.current = false
    }
  }, [selectedItems.size])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setSelectedItems(new Set())
  }, [activeViewId])
  // </CHANGE>

  const handleCheckboxChange = (itemId: number, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems)
    if (checked) {
      newSelectedItems.add(itemId)
    } else {
      newSelectedItems.delete(itemId)
    }
    setSelectedItems(newSelectedItems)
    if (newSelectedItems.size > 0 && selectedItems.size === 0) {
      setAnimationKey((prev) => prev + 1)
    }
  }

  const handleArchive = () => {
    // console.log("[v0] Opening archive modal for items:", Array.from(selectedItems))
    setIsArchiveModalOpen(true)
  }

  const handleRestore = () => {
    // console.log("[v0] Restoring items:", Array.from(selectedItems))
    const newStatuses = new Map(recommendationStatuses)
    selectedItems.forEach((itemId) => {
      newStatuses.set(itemId, "Re-visit")
    })
    setRecommendationStatuses(newStatuses)
    setSelectedItems(new Set())
  }

  const handleDelete = () => {
    // console.log("[v0] Opening delete modal for items:", Array.from(selectedItems))
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    // console.log("[v0] Deleting items:", Array.from(selectedItems))
    setSelectedItems(new Set())
    setIsDeleteModalOpen(false)
  }

  const handleArchiveConfirm = (note: string) => {
    const newStatuses = new Map(recommendationStatuses)
    const newArchiveNotes = new Map(archiveNotes)
    const newTimers = new Map(statusTimers)
    const timestamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    selectedItems.forEach((itemId) => {
      newStatuses.set(itemId, "Archived")
      const currentOwner = recommendationOwners.get(itemId) || "Chris Taylor"
      newArchiveNotes.set(itemId, {
        note,
        owner: currentOwner,
        timestamp,
      })
      const expirationDate = new Date()
      expirationDate.setMonth(expirationDate.getMonth() + 9)
      newTimers.set(itemId, expirationDate)
    })

    setRecommendationStatuses(newStatuses)
    setArchiveNotes(newArchiveNotes)
    setStatusTimers(newTimers)
    setSelectedItems(new Set())
  }

  const handleRevisit = () => {
    setIsRevisitModalOpen(true)
  }

  const handleRevisitConfirm = (snoozeDuration: string) => {
    const newStatuses = new Map(recommendationStatuses)
    const newTimers = new Map(statusTimers)

    selectedItems.forEach((itemId) => {
      newStatuses.set(itemId, "Snoozed")

      const expirationDate = new Date()
      switch (snoozeDuration) {
        case "1-day":
          expirationDate.setDate(expirationDate.getDate() + 1)
          break
        case "1-week":
          expirationDate.setDate(expirationDate.getDate() + 7)
          break
        case "1-month":
          expirationDate.setMonth(expirationDate.getMonth() + 1)
          break
        case "3-months":
          expirationDate.setMonth(expirationDate.getMonth() + 3)
          break
        default:
          expirationDate.setDate(expirationDate.getDate() + 7) // Default to 1 week
      }
      newTimers.set(itemId, expirationDate)
    })

    setRecommendationStatuses(newStatuses)
    setStatusTimers(newTimers)
    setSelectedItems(new Set())
    setIsRevisitModalOpen(false)
  }

  const handleMarkForReview = () => {
    setIsReviewModalOpen(true)
  }

  const handleMarkForReviewConfirm = (note: string) => {
    const newStatuses = new Map(recommendationStatuses)
    const newReviewNotes = new Map(reviewNotes)
    const timestamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    selectedItems.forEach((itemId) => {
      newStatuses.set(itemId, "Marked for review")
      const currentOwner = recommendationOwners.get(itemId) || "Chris Taylor"
      newReviewNotes.set(itemId, {
        note,
        owner: currentOwner,
        timestamp,
      })
    })

    setRecommendationStatuses(newStatuses)
    setReviewNotes(newReviewNotes)
    setSelectedItems(new Set())

    toast({
      title: "Marked for Review",
      description: `${selectedItems.size} recommendation${selectedItems.size === 1 ? "" : "s"} marked for review.`,
    })
  }

  const handleUnmark = () => {
    const newStatuses = new Map(recommendationStatuses)

    selectedItems.forEach((itemId) => {
      newStatuses.set(itemId, "Viewed")
    })

    setRecommendationStatuses(newStatuses)
    setSelectedItems(new Set())

    toast({
      title: "Unmarked",
      description: `${selectedItems.size} recommendation${selectedItems.size === 1 ? "" : "s"} unmarked and set to Viewed.`,
    })
  }

  const handleSendToIntegration = () => {
    setIsSendModalOpen(true)
  }

  const handleSendConfirm = (integration: string) => {
    const newStatuses = new Map(recommendationStatuses)
    selectedItems.forEach((itemId) => {
      newStatuses.set(itemId, "Actioned")
    })
    setRecommendationStatuses(newStatuses)
    setSelectedItems(new Set())

    toast({
      title: "Sent to Integration",
      description: `${selectedItems.size} recommendation${selectedItems.size === 1 ? "" : "s"} sent to ${integration === "azure-devops" ? "Azure DevOps" : integration}.`,
    })
  }

  const handleItemClick = (item: any, priority: string) => {
    const archiveNote = item.archiveNote || archiveNotes.get(item.id)
    const reviewNote = reviewNotes.get(item.id)
    setSelectedItem({ ...item, priority, archiveNote, reviewNote })
    setCurrentlyViewedItemId(item.id)
    setIsPanelOpen(true)
  }

  const toggleSection = (sectionKey: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey)
      // Collapse all other sections
      displayedRecommendations.forEach((section) => {
        if (section.key !== sectionKey) {
          newCollapsed.add(section.key)
        }
      })
      setCollapsedSections(newCollapsed)

      // Scroll to the expanded section after DOM updates
      setTimeout(() => {
        const sectionElement = sectionRefs.current.get(sectionKey)
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } else {
      // Collapsing this section
      newCollapsed.add(sectionKey)
      setCollapsedSections(newCollapsed)
    }
  }

  const viewAllInSection = (sectionKey: string) => {
    setIsolatedSection(sectionKey)
    setIsolatedViewPage(1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const exitIsolatedView = () => {
    setIsolatedSection(null)
    setIsolatedViewPage(1)
  }

  const handleOwnerChange = (itemId: number, newOwner: string) => {
    const newOwners = new Map(recommendationOwners)
    newOwners.set(itemId, newOwner)
    setRecommendationOwners(newOwners)
  }

  const processRecommendations = useMemo(() => {
    return finalRecommendations === defaultRecommendations
      ? finalRecommendations
      : transformCustomRecommendations(finalRecommendations)
  }, [finalRecommendations, defaultRecommendations])

  const getGroupedRecommendations = () => {
    const priorityOrder = ["high", "medium", "low"]
    const statusOrder = ["New", "Viewed", "Marked for review", "Re-visit", "Snoozed", "Archived", "Actioned"]
    const providerOrder = ["azure", "aws", "gcp"]
    const tagTypeOrder = [
      "Cost-allocation-type",
      "Cost-center",
      "Environment",
      "Portfolio",
      "Shared-cost-type",
      "Sub-portfolio",
    ]
    const easeToImplementOrder = ["Easy", "Medium", "Hard"]

    const allItems = processRecommendations.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        originalPriority: section.priority,
        status: recommendationStatuses.get(item.id) || item.status,
        owner: recommendationOwners.get(item.id) || item.owner,
        easeToImplement: item.easeToImplement || getEaseToImplement(item.category),
        calculatedPriority: priorityMap.get(item.id) || item.priority || "medium", // Use item.priority if not in map, default to medium
        createdDate: item.createdDate || "N/A",
        snoozedUntil: item.snoozedUntil || null, // Assuming snoozedUntil is available
        archivedUntil: item.archivedUntil || null, // Assuming archivedUntil is available
      })),
    )

    const filteredItems = allItems.filter((item) => {
      // Ensure calculatedPriority is always one of the valid keys
      const currentPriority = prioritiesSet.has(item.calculatedPriority) ? item.calculatedPriority : "medium"
      if (!prioritiesSet.has(currentPriority)) return false

      if (selectedProvider !== "all" && item.provider !== selectedProvider) return false

      if (selectedType !== "all" && selectedType !== "all-types") {
        const itemType = item.title.toLowerCase()
        const typeMatch =
          itemType.includes(selectedType.toLowerCase()) ||
          (item.subscription && item.subscription.toLowerCase().includes(selectedType.toLowerCase()))

        if (!typeMatch) return false
      }

      if (!statusesSet.has(item.status)) return false

      if (!ownersSet.has(item.owner)) return false

      if (categoriesSet.size > 0 && !categoriesSet.has(item.category)) return false

      if (selectedSubCategory && selectedSubCategory.length > 0) {
        const itemSubCategory = item.subCategory || "Other"
        const isMatch = selectedSubCategory.includes(itemSubCategory)
        if (!isMatch) {
          return false
        }
      }

      if (tagTypesSet.size > 0 && !tagTypesSet.has(item.tagType)) return false

      if (tagValuesSet.size > 0) {
        const itemTagValue = `${item.tagType}:${item.tagValue || "Unknown"}`
        if (!tagValuesSet.has(itemTagValue)) return false
      }

      if (dateRange?.from || dateRange?.to) {
        if (item.createdDate && item.createdDate !== "N/A") {
          const itemDate = new Date(item.createdDate)

          if (dateRange.from) {
            const fromDate = new Date(dateRange.from)
            fromDate.setHours(0, 0, 0, 0)
            if (itemDate < fromDate) return false
          }

          if (dateRange.to) {
            const toDate = new Date(dateRange.to)
            toDate.setHours(23, 59, 59, 999)
            if (itemDate > toDate) return false
          }
        }
      }

      if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(query)
        const matchesDescription = item.description.toLowerCase().includes(query)
        const matchesOwner = item.owner.toLowerCase().includes(query)
        const matchesStatus = item.status.toLowerCase().includes(query)

        if (!matchesTitle && !matchesDescription && !matchesOwner && !matchesStatus) return false
      }

      return true
    })

    const grouped = filteredItems.reduce(
      (acc, item) => {
        let groupKey: string
        let groupLabel: string

        switch (groupByProp) {
          case "provider":
            groupKey = item.provider
            groupLabel = providerLabels[item.provider as keyof typeof providerLabels] || item.provider
            break
          case "status":
            groupKey = item.status
            groupLabel = statusLabels[item.status as keyof typeof statusLabels] || item.status
            break
          case "category":
            groupKey = dataSource === "saas" ? item.subCategory || "Uncategorized" : item.category || "Uncategorized"
            groupLabel = dataSource === "saas" ? item.subCategory || "Uncategorized" : item.category || "Uncategorized"
            break
          case "tagType":
            groupKey = item.tagType
            groupLabel = tagTypeLabels[item.tagType as keyof typeof tagTypeLabels] || item.tagType
            break
          case "effort":
          case "easeToImplement":
            groupKey = item.easeToImplement
            groupLabel = easeToImplementLabels[item.easeToImplement as keyof typeof easeToImplementLabels]
            break
          case "priority":
          default:
            groupKey = item.calculatedPriority
            groupLabel = priorityLabels[item.calculatedPriority as keyof typeof priorityLabels]
            break
        }

        if (!acc[groupKey]) {
          acc[groupKey] = {
            key: groupKey,
            label: groupLabel,
            items: [],
            priority: groupByProp === "priority" ? groupKey : "medium",
          }
        }
        acc[groupKey].items.push(item)
        return acc
      },
      {} as Record<string, any>,
    )

    if (groupByProp === "priority") {
      const priorityLevels: Array<"high" | "medium" | "low"> = ["high", "medium", "low"]
      priorityLevels.forEach((priority) => {
        if (!grouped[priority]) {
          grouped[priority] = {
            key: priority,
            label: priorityLabels[priority],
            items: [],
            priority: priority,
          }
        }
      })
    }

    const groupArray = Object.values(grouped).map((group) => ({
      ...group,
      count: group.items.length,
    }))

    groupArray.sort((a, b) => {
      switch (groupByProp) {
        case "status":
          return statusOrder.indexOf(a.key) - statusOrder.indexOf(b.key)
        case "priority":
          return priorityOrder.indexOf(a.key) - priorityOrder.indexOf(b.key)
        case "provider":
          return providerOrder.indexOf(a.key) - providerOrder.indexOf(b.key)
        case "owner":
          return a.key.localeCompare(b.key)
        case "category":
          return a.key.localeCompare(b.key)
        case "tagType":
          return tagTypeOrder.indexOf(a.key) - tagTypeOrder.indexOf(b.key)
        case "effort":
        case "easeToImplement":
          return easeToImplementOrder.indexOf(a.key) - easeToImplementOrder.indexOf(b.key)
        case "createdDate":
          if (a.items.length === 0) return 1
          if (b.items.length === 0) return -1
          const dateA = new Date(a.items[0].createdDate)
          const dateB = new Date(b.items[0].createdDate)
          return dateA.getTime() - dateB.getTime()
        default:
          return 0
      }
    })

    groupArray.forEach((group) => {
      group.items.sort((a, b) => {
        // First, sort by status priority
        const statusOrder = ["New", "Re-visit", "Marked for review", "Viewed", "Archived", "Actioned", "Snoozed"]
        const aStatusIndex = statusOrder.indexOf(a.status)
        const bStatusIndex = statusOrder.indexOf(b.status)

        // If statuses are different, sort by status priority
        if (aStatusIndex !== bStatusIndex) {
          return aStatusIndex - bStatusIndex
        }

        // If statuses are the same, sort by savings descending (highest first)
        const aSavings = Number.parseInt(a.savings.replace(/[£,]/g, ""))
        const bSavings = Number.parseInt(b.savings.replace(/[£,]/g, ""))
        const savingsComparison = bSavings - aSavings

        if (savingsComparison !== 0) {
          return savingsComparison
        }

        // If user has selected a column to sort by, apply that sorting
        if (sortColumn) {
          let comparison = 0

          switch (sortColumn) {
            case "recommendation":
              comparison = a.title.localeCompare(b.title)
              break
            case "provider":
              comparison = a.provider.localeCompare(b.provider)
              break
            case "category":
              comparison =
                dataSource === "saas"
                  ? a.subCategory.localeCompare(b.subCategory)
                  : a.category.localeCompare(b.category)
              break
            case "date": {
              const dateA = new Date(a.createdDate)
              const dateB = new Date(b.createdDate)
              comparison = dateA.getTime() - dateB.getTime()
              break
            }
            case "effort": {
              const effortOrder = ["Easy", "Medium", "Hard"]
              const aEffortIndex = effortOrder.indexOf(a.easeToImplement)
              const bEffortIndex = effortOrder.indexOf(b.easeToImplement)
              comparison = aEffortIndex - bEffortIndex
              break
            }
            case "priority": {
              const priorityOrder = ["high", "medium", "low"]
              const aPriorityIndex = priorityOrder.indexOf(a.calculatedPriority)
              const bPriorityIndex = priorityOrder.indexOf(b.calculatedPriority)
              comparison = aPriorityIndex - bPriorityIndex
              break
            }
            case "savings": {
              const aSavings = Number.parseInt(a.savings.replace(/[£,]/g, ""))
              const bSavings = Number.parseInt(b.savings.replace(/[£,]/g, ""))
              comparison = aSavings - bSavings
              break
            }
            default:
              comparison = 0
          }

          const directedComparison = sortDirection === "asc" ? comparison : -comparison
          if (directedComparison !== 0) {
            return directedComparison
          }
        }

        // Apply existing sort rules as fallback
        const rulesToApply =
          sortRules.length > 0 ? sortRules : [{ id: "default-status", field: "status", direction: "asc" as const }]

        for (const rule of rulesToApply) {
          let comparison = 0

          switch (rule.field) {
            case "savings": {
              const aSavings = Number.parseInt(a.savings.replace(/[£,]/g, ""))
              const bSavings = Number.parseInt(b.savings.replace(/[£,]/g, ""))
              comparison = aSavings - bSavings
              break
            }
            case "priority": {
              const priorityOrder = ["high", "medium", "low"]
              const aPriorityIndex = priorityOrder.indexOf(a.calculatedPriority)
              const bPriorityIndex = priorityOrder.indexOf(b.calculatedPriority)
              comparison = aPriorityIndex - bPriorityIndex
              break
            }
            case "effort": {
              const effortOrder = ["Easy", "Medium", "Hard"]
              const aEffortIndex = effortOrder.indexOf(a.easeToImplement)
              const bEffortIndex = effortOrder.indexOf(b.easeToImplement)
              comparison = aEffortIndex - bEffortIndex
              break
            }
            case "category":
              comparison =
                dataSource === "saas"
                  ? a.subCategory.localeCompare(b.subCategory)
                  : a.category.localeCompare(b.category)
              break
            case "owner":
              comparison = a.owner.localeCompare(b.owner)
              break
            case "status": {
              const statusOrder = ["New", "Re-visit", "Marked for review", "Viewed", "Archived", "Actioned", "Snoozed"]
              const aStatusIndex = statusOrder.indexOf(a.status)
              const bStatusIndex = statusOrder.indexOf(b.status)
              comparison = aStatusIndex - bStatusIndex
              break
            }
            case "createdDate": {
              const dateA = new Date(a.createdDate)
              const dateB = new Date(b.createdDate)
              comparison = dateA.getTime() - dateB.getTime()
              break
            }
            default:
              comparison = 0
          }

          const directedComparison = rule.direction === "asc" ? comparison : -comparison

          if (directedComparison !== 0) {
            return directedComparison
          }
        }

        // Final fallback: sort by savings descending
        return bSavings - aSavings
      })
    })

    return groupArray
  }

  const groupedRecommendations = getGroupedRecommendations()

  const finalDisplayedRecommendations = useMemo(() => {
    return isolatedSection
      ? groupedRecommendations.filter((section) => section.key === isolatedSection)
      : groupedRecommendations
  }, [isolatedSection, groupedRecommendations])

  // Filtered recommendations based on various criteria
  const filteredRecommendations = useMemo(() => {
    console.log("[v0] RecommendationsList - selectedSubCategory:", selectedSubCategory)
    const allItems = processRecommendations.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        originalPriority: section.priority,
        status: recommendationStatuses.get(item.id) || item.status,
        owner: recommendationOwners.get(item.id) || item.owner,
        easeToImplement: item.easeToImplement || getEaseToImplement(item.category),
        calculatedPriority: priorityMap.get(item.id) || item.priority || "medium",
        createdDate: item.createdDate || "N/A",
        snoozedUntil: item.snoozedUntil || null, // Assuming snoozedUntil is available
        archivedUntil: item.archivedUntil || null, // Assuming archivedUntil is available
      })),
    )

    const filteredItems = allItems.filter((item) => {
      const currentPriority = prioritiesSet.has(item.calculatedPriority) ? item.calculatedPriority : "medium"
      if (!prioritiesSet.has(currentPriority)) return false

      if (selectedProvider !== "all" && item.provider !== selectedProvider) return false

      if (selectedType !== "all" && selectedType !== "all-types") {
        const itemType = item.title.toLowerCase()
        const typeMatch =
          itemType.includes(selectedType.toLowerCase()) ||
          (item.subscription && item.subscription.toLowerCase().includes(selectedType.toLowerCase()))

        if (!typeMatch) return false
      }

      if (!statusesSet.has(item.status)) return false

      if (!ownersSet.has(item.owner)) return false

      if (categoriesSet.size > 0 && !categoriesSet.has(item.category)) return false

      if (selectedSubCategory && selectedSubCategory.length > 0) {
        const itemSubCategory = item.subCategory || "Other"
        const isMatch = selectedSubCategory.includes(itemSubCategory)
        if (!isMatch) {
          return false
        }
      }

      if (tagTypesSet.size > 0 && !tagTypesSet.has(item.tagType)) return false

      if (tagValuesSet.size > 0) {
        const itemTagValue = `${item.tagType}:${item.tagValue || "Unknown"}`
        if (!tagValuesSet.has(itemTagValue)) return false
      }

      if (dateRange?.from || dateRange?.to) {
        if (item.createdDate && item.createdDate !== "N/A") {
          const itemDate = new Date(item.createdDate)

          if (dateRange.from) {
            const fromDate = new Date(dateRange.from)
            fromDate.setHours(0, 0, 0, 0)
            if (itemDate < fromDate) return false
          }

          if (dateRange.to) {
            const toDate = new Date(dateRange.to)
            toDate.setHours(23, 59, 59, 999)
            if (itemDate > toDate) return false
          }
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.owner.toLowerCase().includes(query) ||
          (dataSource === "saas"
            ? item.subCategory && item.subCategory.toLowerCase().includes(query)
            : item.category && item.category.toLowerCase().includes(query)) // Search category or subCategory
        )
      }

      return true
    })

    return filteredItems
  }, [
    processRecommendations,
    recommendationStatuses,
    recommendationOwners,
    prioritiesSet,
    selectedProvider,
    selectedType,
    statusesSet,
    ownersSet,
    categoriesSet,
    selectedSubCategory,
    tagTypesSet,
    tagValuesSet,
    dateRange,
    searchQuery,
    groupByProp,
    sortRules,
    sortColumn,
    sortDirection,
    dataSource, // Added dataSource to dependencies
  ])

  // The `displayedRecommendations` variable is now correctly derived from `groupedRecommendations`
  // or the filtered list if `isolatedSection` is set. The original `useEffect` hook that caused
  // the redeclaration has been removed, and the logic is now handled here.
  const displayedRecommendations = isolatedSection
    ? groupedRecommendations.filter((section) => section.key === isolatedSection)
    : groupedRecommendations

  useEffect(() => {
    hasInitializedCollapsedSections.current = false
  }, [selectedCategories, selectedSubCategory, dataSource]) // Added dataSource to useEffect dependencies

  useEffect(() => {
    if (finalDisplayedRecommendations.length > 0 && !hasInitializedCollapsedSections.current) {
      hasInitializedCollapsedSections.current = true

      // Find the first section with items
      const firstNonEmptyIndex = finalDisplayedRecommendations.findIndex((section) => section.count > 0)

      if (firstNonEmptyIndex !== -1) {
        // Collapse all sections except the first non-empty one
        const sectionsToCollapse = new Set(
          finalDisplayedRecommendations
            .map((section, index) => (index !== firstNonEmptyIndex ? section.key : null))
            .filter((key): key is string => key !== null),
        )

        const needsUpdate =
          Array.from(sectionsToCollapse).some((key) => !collapsedSections.has(key)) ||
          Array.from(collapsedSections).some((key) => !sectionsToCollapse.has(key))

        if (needsUpdate) {
          setCollapsedSections(sectionsToCollapse)
        }
      } else {
        // If all sections are empty, collapse all except the first
        const sectionsToCollapse = new Set(finalDisplayedRecommendations.slice(1).map((section) => section.key))

        const needsUpdate =
          Array.from(sectionsToCollapse).some((key) => !collapsedSections.has(key)) ||
          Array.from(collapsedSections).some((key) => !sectionsToCollapse.has(key))

        if (needsUpdate) {
          setCollapsedSections(sectionsToCollapse)
        }
      }
    }
  }, [finalDisplayedRecommendations, collapsedSections])

  const getAllVisibleItemIds = () => {
    if (renderFlatList) {
      return new Set(flatItems.map((item) => item.id))
    } else {
      // Use finalDisplayedRecommendations here
      return new Set(finalDisplayedRecommendations.flatMap((section) => section.items.map((item) => item.id)))
    }
  }

  const getGroupItemIds = (groupKey: string) => {
    const group = finalDisplayedRecommendations.find((g) => g.key === groupKey)
    return group ? new Set(group.items.map((item) => item.id)) : new Set()
  }

  const areAllItemsSelected = () => {
    const allIds = getAllVisibleItemIds()
    return allIds.size > 0 && Array.from(allIds).every((id) => selectedItems.has(id))
  }

  const areSomeItemsSelected = () => {
    const allIds = getAllVisibleItemIds()
    return allIds.size > 0 && Array.from(allIds).some((id) => selectedItems.has(id)) && !areAllItemsSelected()
  }

  const areAllGroupItemsSelected = (groupKey: string) => {
    const groupIds = getGroupItemIds(groupKey)
    return groupIds.size > 0 && Array.from(groupIds).every((id) => selectedItems.has(id))
  }

  const areSomeGroupItemsSelected = (groupKey: string) => {
    const groupIds = getGroupItemIds(groupKey)
    return (
      groupIds.size > 0 &&
      Array.from(groupIds).some((id) => selectedItems.has(id)) &&
      !areAllGroupItemsSelected(groupKey)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(getAllVisibleItemIds())
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectAllInGroup = (groupKey: string, checked: boolean) => {
    const groupIds = getGroupItemIds(groupKey)
    const newSelectedItems = new Set(selectedItems)

    if (checked) {
      groupIds.forEach((id) => newSelectedItems.add(id))
    } else {
      groupIds.forEach((id) => newSelectedItems.delete(id))
    }

    setSelectedItems(newSelectedItems)
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const allOwners = ["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]

  const handleSidePanelStatusChange = (id: number, status: string) => {
    const newStatuses = new Map(recommendationStatuses)
    newStatuses.set(id, status)
    setRecommendationStatuses(newStatuses)
    setIsPanelOpen(false)
    setCurrentlyViewedItemId(null)
  }

  const handleSidePanelArchive = (id: number) => {
    setSelectedItems(new Set([id]))
    setIsPanelOpen(false)
    setCurrentlyViewedItemId(null)
    setIsArchiveModalOpen(true)
  }

  const handleSidePanelSendToIntegration = (id: number) => {
    setSelectedItems(new Set([id]))
    setIsPanelOpen(false)
    setCurrentlyViewedItemId(null)
    setIsSendModalOpen(true)
  }

  const handleSidePanelClose = () => {
    if (selectedItem && currentlyViewedItemId) {
      const currentStatus = recommendationStatuses.get(currentlyViewedItemId) || selectedItem.status
      // Only change status from "New" to "Viewed" when closing
      if (currentStatus === "New") {
        const newStatuses = new Map(recommendationStatuses)
        newStatuses.set(currentlyViewedItemId, "Viewed")
        setRecommendationStatuses(newStatuses)
      }
    }
    setIsPanelOpen(false)
    setCurrentlyViewedItemId(null)
  }

  const areSelectedItemsArchived = () => {
    const allItems = processRecommendations.flatMap((section) => section.items)
    return Array.from(selectedItems).every((itemId) => {
      const item = allItems.find((i) => i.id === itemId)
      const status = recommendationStatuses.get(itemId) || item?.status
      return status === "Archived"
    })
  }

  const areSelectedItemsSnoozed = () => {
    const allItems = processRecommendations.flatMap((section) => section.items)
    return Array.from(selectedItems).every((itemId) => {
      const item = allItems.find((i) => i.id === itemId)
      const status = recommendationStatuses.get(itemId) || item?.status
      return status === "Snoozed"
    })
  }

  const areSelectedItemsMarkedForReview = () => {
    const allItems = processRecommendations.flatMap((section) => section.items)
    return Array.from(selectedItems).every((itemId) => {
      const item = allItems.find((i) => i.id === itemId)
      const status = recommendationStatuses.get(itemId) || item?.status
      return status === "Marked for review"
    })
  }

  const isArchived = areSelectedItemsArchived()
  // Determine if selected items are snoozed
  const isSnoozed = areSelectedItemsSnoozed()
  const isMarkedForReview = areSelectedItemsMarkedForReview()

  const renderFlatList = groupByProp === "none"
  const flatItems = renderFlatList ? finalDisplayedRecommendations.flatMap((section) => section.items) : []

  const ITEMS_PER_PAGE = 25 // Updated default items per page
  const ISOLATED_VIEW_ITEMS_PER_PAGE = 25

  const getItemsPerPage = (sectionKey: string) => {
    return itemsPerPageMap.get(sectionKey) || 25 // Default to 25
  }

  const setItemsPerPage = (sectionKey: string, value: number) => {
    setItemsPerPageMap(new Map(itemsPerPageMap.set(sectionKey, value)))
    // Reset to page 1 when changing items per page
    setSectionPages(new Map(sectionPages.set(sectionKey, 1)))
  }

  const setFlatListItemsPerPageHandler = (value: number) => {
    setFlatListItemsPerPage(value)
    setFlatListPage(1) // Reset to page 1 when changing items per page
  }

  const scrollToSection = (sectionKey?: string) => {
    if (sectionKey) {
      const sectionElement = sectionRefs.current.get(sectionKey)
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const setSectionRef = (key: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(key, element)
    } else {
      sectionRefs.current.delete(key)
    }
  }

  const getSelectedItemsData = () => {
    const allItems = processRecommendations.flatMap((section) => section.items)
    return Array.from(selectedItems)
      .map((itemId) => {
        const item = allItems.find((i) => i.id === itemId)
        if (!item) return null
        return {
          id: item.id,
          title: item.title,
          savings: item.savings,
          savingsAmount: item.savingsAmount || Number.parseInt(item.savings.replace(/[£,]/g, "")) || 0,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }

  const handleRemoveItemFromSelection = (itemId: number) => {
    const newSelectedItems = new Set(selectedItems)
    newSelectedItems.delete(itemId)
    setSelectedItems(newSelectedItems)
  }

  // Function to toggle section expansion, fixing the undeclared variable error
  const toggleSectionExpansion = (sectionKey: string) => {
    setExpandedSections((prevExpanded) => {
      const newExpanded = new Set(prevExpanded)
      if (newExpanded.has(sectionKey)) {
        newExpanded.delete(sectionKey)
      } else {
        newExpanded.add(sectionKey)
      }
      return newExpanded
    })
  }

  const showMoreItems = (sectionKey: string) => {
    // Remove showMoreItems function
    setVisibleItemsCount((prev) => {
      const newMap = new Map(prev) // Corrected from new Map(prev)
      const currentCount = newMap.get(sectionKey) || ITEMS_PER_PAGE
      newMap.set(sectionKey, currentCount + 10)
      return newMap
    })
  }

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column)
    setSortDirection(direction)
  }

  // REMOVED: getSortIcon function

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleSmartTag = () => {
    let existingTags: Array<{ type: string; value: string }> = []

    if (selectedItems.size === 1) {
      // For single item, match the side panel's tag structure
      const itemId = Array.from(selectedItems)[0]
      const item =
        (externalRecommendations !== defaultRecommendations ? externalRecommendations : transformedItems).find(
          (i) => i.id === itemId,
        ) || transformedItems.find((i) => i.id === itemId)

      if (item) {
        // Add the item's own tags if they exist
        if (item.tagType && item.tagValue) {
          existingTags.push({ type: item.tagType, value: item.tagValue })
        }
        // Add the same hardcoded tags as the side panel
        existingTags.push(
          { type: "Cloud", value: "Azure" },
          { type: "Service", value: "Virtual Machines" },
          { type: "Impact", value: "High Savings" },
          { type: "Region", value: "East US" },
        )
      }
    } else {
      existingTags = Array.from(getExistingTags()).flatMap(([tagType, values]) =>
        Array.from(values).map((value) => ({ type: tagType, value })),
      )

      // Add the hardcoded tags that are common to all items
      existingTags.push(
        { type: "Cloud", value: "Azure" },
        { type: "Service", value: "Virtual Machines" },
        { type: "Impact", value: "High Savings" },
        { type: "Region", value: "East US" },
      )
    }

    setSmartTags(existingTags)
    setOriginalTags(existingTags)
    setRemovedTags([])
    setAddedTags([])
    setNewTagType("")
    setNewTagValue("")
    setIsSmartTagDialogOpen(true)
  }

  const getExistingTags = () => {
    const tags = new Map<string, Set<string>>()

    selectedItems.forEach((itemId) => {
      // Find the item from the potentially custom recommendations or default ones
      let item = (externalRecommendations !== defaultRecommendations ? externalRecommendations : transformedItems).find(
        (i) => i.id === itemId,
      )
      // Fallback if item not found in custom list, search default list
      if (!item) {
        item = transformedItems.find((i) => i.id === itemId)
      }

      if (item && item.tagType && item.tagValue) {
        if (!tags.has(item.tagType)) {
          tags.set(item.tagType, new Set())
        }
        tags.get(item.tagType)?.add(item.tagValue)
      }
    })

    return tags
  }

  const handleSaveSmartTags = () => {
    // The actual tag update logic would happen here, likely by calling an API.
    // For now, we'll simulate a successful update with a toast.
    toast({
      title: "Tags Updated",
      description: `Smart tags have been successfully updated for ${selectedItems.size} recommendation${selectedItems.size === 1 ? "" : "s"}.`,
      duration: 5000,
    })

    setIsSmartTagDialogOpen(false)
    setSmartTags([])
    setOriginalTags([])
    setRemovedTags([])
    setAddedTags([])
  }

  const handleCancelSmartTags = () => {
    setIsSmartTagDialogOpen(false)
    setSmartTags([])
    setRemovedTags([])
    setAddedTags([])
    setNewTagType("")
    setNewTagValue("")
  }

  const handleRemoveTag = (index: number) => {
    const tagToRemove = smartTags[index]

    // Track if it was an original tag for save functionality
    const wasOriginal = originalTags.some((t) => t.type === tagToRemove.type && t.value === tagToRemove.value)
    if (wasOriginal) {
      setRemovedTags((prev) => [...prev, tagToRemove])
    }

    // Remove from added tags if it was newly added
    setAddedTags((prev) => prev.filter((t) => !(t.type === tagToRemove.type && t.value === tagToRemove.value)))

    // Always remove from display immediately
    setSmartTags((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = (tagValue?: string) => {
    const valueToUse = tagValue || newTagValue
    if (newTagType && valueToUse) {
      const newTag = { type: newTagType, value: valueToUse }

      const wasRemoved = removedTags.some((t) => t.type === newTag.type && t.value === newTag.value)
      if (wasRemoved) {
        setRemovedTags((prev) => prev.filter((t) => !(t.type === newTag.type && t.value === newTag.value)))
      } else {
        setSmartTags((prev) => [...prev, newTag])
        setAddedTags((prev) => [...prev, newTag])
      }

      setNewTagType("")
      setNewTagValue("")
      setShowTagValues(false)
      setIsAddTagPopoverOpen(false)
    }
  }

  const tagTypeOptions = {
    "Cost-allocation-type": ["Direct", "Indirect", "Shared"],
    "Cost-center": ["Engineering", "Marketing", "Sales", "Operations"],
    Environment: ["Production", "Staging", "Development", "Testing"],
    Portfolio: ["Portfolio A", "Portfolio B", "Portfolio C"],
    "Shared-cost-type": ["Proportional", "Equal", "Usage-based"],
    "Sub-portfolio": ["Sub-portfolio 1", "Sub-portfolio 2", "Sub-portfolio 3"],
  }

  const tagValueOptions = newTagType ? tagTypeOptions[newTagType as keyof typeof tagTypeOptions] || [] : []

  const isRemovingTags = removedTags.length > 0 // Added missing variable

  // Remove goToSectionPage function
  const goToSectionPage = (sectionKey: string, page: number) => {
    setSectionPages((prev) => {
      const newMap = new Map(prev)
      newMap.set(sectionKey, page)
      return newMap
    })
  }

  const handleRowClick = (item: any) => {
    // This function is now called directly from the div onClick
    const archiveNote = item.archiveNote || archiveNotes.get(item.id)
    const reviewNote = reviewNotes.get(item.id)
    setSelectedItem({ ...item, archiveNote, reviewNote })
    setCurrentlyViewedItemId(item.id)
    setIsPanelOpen(true)
  }

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div
          className={cn("border border-border rounded-lg overflow-hidden", activeViewId === "actioned" && "mb-24")}
          ref={tableRef}
        >
          {isolatedSection && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  Viewing all items in:{" "}
                  {finalDisplayedRecommendations.find((section) => section.key === isolatedSection)?.label ||
                    isolatedSection}
                </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                  {finalDisplayedRecommendations.find((section) => section.key === isolatedSection)?.count || 0} items
                </Badge>
              </div>
              <Button
                onClick={exitIsolatedView}
                variant="ghost"
                size="sm"
                className="gap-1 text-blue-700 hover:text-blue-900 hover:bg-transparent hover:underline transition-colors"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
                <span>Back to all groups</span>
              </Button>
            </div>
          )}

          {/* Table Header */}
          <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-muted-foreground tracking-wide">
            {activeViewId !== "actioned" && (
              <div className="w-4 flex-shrink-0 mr-5">
                <Checkbox
                  className="h-4 w-4"
                  checked={areAllItemsSelected()}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = areSomeItemsSelected()
                    }
                  }}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </div>
            )}
            {/* CHANGE: Recommendation column remains flex-1 to take remaining space */}
            <div className="flex-[2] min-w-[180px] max-w-[400px] mr-5 pr-3 border-r border-gray-200">
              <div className="flex items-center justify-between group">
                <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
                  Recommendation
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem
                      onClick={() => {
                        setSortColumn("recommendation")
                        setSortDirection("asc")
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5 mr-2" />
                      Sort Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortColumn("recommendation")
                        setSortDirection("desc")
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                      Sort Descending
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Columns3 className="h-3.5 w-3.5 mr-2" />
                        Choose columns
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48 p-2">
                        <div className="space-y-2">
                          {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => {
                            const columnId = `column-${column}`
                            const columnLabel =
                              column === "savings"
                                ? "Potential Savings"
                                : column.charAt(0).toUpperCase() + column.slice(1)
                            return (
                              <div key={column} className="flex items-center space-x-2 px-2 py-1">
                                <Checkbox
                                  id={columnId}
                                  checked={visibleColumns[column]}
                                  onCheckedChange={() => toggleColumn(column)}
                                />
                                <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                                  {columnLabel}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* CHANGE: Provider column changed to fixed width w-[180px] to hug content */}
            {visibleColumns.provider && (
              <div className="flex-[1.2] min-w-[140px] mr-5 pr-3 border-r border-gray-200">
                <div className="flex items-center justify-between group">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap text-left">
                    Provider
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-200 rounded ml-auto">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("provider")
                          setSortDirection("asc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2" />
                        Sort Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("provider")
                          setSortDirection("desc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                        Sort Descending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Columns3 className="h-3.5 w-3.5 mr-2" />
                          Choose columns
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48 p-2">
                          <div className="space-y-2">
                            {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => {
                              const columnId = `column-${column}`
                              const columnLabel =
                                column === "savings"
                                  ? "Potential Savings"
                                  : column.charAt(0).toUpperCase() + column.slice(1)
                              return (
                                <div key={column} className="flex items-center space-x-2 px-2 py-1">
                                  <Checkbox
                                    id={columnId}
                                    checked={visibleColumns[column]}
                                    onCheckedChange={() => toggleColumn(column)}
                                  />
                                  <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                                    {columnLabel}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
            {visibleColumns.category && (
              <div className="flex-[0.9] min-w-[110px] mr-5 pr-3 border-r border-gray-200">
                <div className="flex items-center justify-between group">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
                    {dataSource === "saas" ? "Sub-category" : "Category"}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("category")
                          setSortDirection("asc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2" />
                        Sort Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("category")
                          setSortDirection("desc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                        Sort Descending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Columns3 className="h-3.5 w-3.5 mr-2" />
                          Choose columns
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48 p-2">
                          <div className="space-y-2">
                            {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => {
                              const columnId = `column-${column}`
                              const columnLabel =
                                column === "savings"
                                  ? "Potential Savings"
                                  : column === "category" && dataSource === "saas"
                                    ? "Sub-category"
                                    : column.charAt(0).toUpperCase() + column.slice(1)
                              return (
                                <div key={column} className="flex items-center space-x-2 px-2 py-1">
                                  <Checkbox
                                    id={columnId}
                                    checked={visibleColumns[column]}
                                    onCheckedChange={() => toggleColumn(column)}
                                  />
                                  <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                                    {columnLabel}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
            {/* CHANGE: Date column changed to fixed width w-[110px] to match header */}
            {visibleColumns.date && (
              <div className="flex-[0.8] min-w-[100px] mr-5 pr-3 border-r border-gray-200">
                <div className="flex items-center justify-between group">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
                    {activeViewId === "snoozed-archived"
                      ? "Time Left"
                      : activeViewId === "actioned"
                        ? "Date Actioned"
                        : dateColumnLabel}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("date")
                          setSortDirection("asc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2" />
                        Sort Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("date")
                          setSortDirection("desc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                        Sort Descending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Columns3 className="h-3.5 w-3.5 mr-2" />
                          Choose columns
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48 p-2">
                          <div className="space-y-2">
                            {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => {
                              const columnId = `column-${column}`
                              const columnLabel =
                                column === "savings"
                                  ? "Potential Savings"
                                  : column.charAt(0).toUpperCase() + column.slice(1)
                              return (
                                <div key={column} className="flex items-center space-x-2 px-2 py-1">
                                  <Checkbox
                                    id={columnId}
                                    checked={visibleColumns[column]}
                                    onCheckedChange={() => toggleColumn(column)}
                                  />
                                  <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                                    {columnLabel}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
            {visibleColumns.effort && (
              <div className="flex-[0.6] min-w-[70px] mr-5 pr-3 border-r border-gray-200">
                <div className="flex items-center justify-between group">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
                    Effort
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("effort")
                          setSortDirection("asc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2" />
                        Sort Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("effort")
                          setSortDirection("desc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                        Sort Descending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Columns3 className="h-3.5 w-3.5 mr-2" />
                          Choose columns
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48 p-2">
                          <div className="space-y-2">
                            {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => {
                              const columnId = `column-${column}`
                              const columnLabel =
                                column === "savings"
                                  ? "Potential Savings"
                                  : column.charAt(0).toUpperCase() + column.slice(1)
                              return (
                                <div key={column} className="flex items-center space-x-2 px-2 py-1">
                                  <Checkbox
                                    id={columnId}
                                    checked={visibleColumns[column]}
                                    onCheckedChange={() => toggleColumn(column)}
                                  />
                                  <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                                    {columnLabel}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {visibleColumns.priority && (
              <div className="flex-[0.6] min-w-[70px] mr-5 pr-3 border-r border-gray-200">
                <div className="flex items-center justify-between group">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
                    Priority
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("priority")
                          setSortDirection("asc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2" />
                        Sort Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortColumn("priority")
                          setSortDirection("desc")
                        }}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-2 rotate-180" />
                        Sort Descending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Columns3 className="h-3.5 w-3.5 mr-2" />
                          Choose columns
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48 p-2">
                          <div className="space-y-2">
                            {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => {
                              const columnId = `column-${column}`
                              const columnLabel =
                                column === "savings"
                                  ? "Potential Savings"
                                  : column.charAt(0).toUpperCase() + column.slice(1)
                              return (
                                <div key={column} className="flex items-center space-x-2 px-2 py-1">
                                  <Checkbox
                                    id={columnId}
                                    checked={visibleColumns[column]}
                                    onCheckedChange={() => toggleColumn(column)}
                                  />
                                  <label htmlFor={columnId} className="text-sm flex-1 cursor-pointer">
                                    {columnLabel}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* CHANGE: Savings column changed to fixed width w-[140px] to hug content */}
            {visibleColumns.savings && (
              <div className="flex-[1] min-w-[140px]">
                <div className="flex items-center justify-between pr-3">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap text-right flex-1">
                    {savingsColumnLabel}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200">
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleSort("savings", "asc")}>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Sort Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort("savings", "desc")}>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Sort Descending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleColumn("savings")}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          {renderFlatList ? (
            <>
              <div className="divide-y divide-border bg-white">
                {flatItems
                  .slice((flatListPage - 1) * flatListItemsPerPage, flatListPage * flatListItemsPerPage)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(item)}
                    >
                      {activeViewId !== "actioned" && (
                        <div className="w-4 flex-shrink-0 mr-5">
                          <Checkbox
                            className="h-4 w-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      <div className="flex-[2] min-w-[180px] max-w-[400px] mr-5">
                        {(item.status === "New" ||
                          item.status === "Re-visit" ||
                          item.status === "Snoozed" ||
                          item.status === "Marked for review" ||
                          item.status === "Archived" ||
                          item.status === "Actioned") && (
                          <div className="mb-1">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 h-4 border ${
                                item.status === "New"
                                  ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                  : item.status === "Re-visit"
                                    ? "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                                    : item.status === "Snoozed"
                                      ? "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                                      : item.status === "Archived"
                                        ? "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                                        : item.status === "Actioned"
                                          ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                          : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h4 className="font-medium text-foreground text-sm mb-0.5 truncate">{item.title}</h4>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description.replace(/SR\d{5}/g, "").trim()}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.description.replace(/SR\d{5}/g, "").trim()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* CHANGE: Provider column changed to fixed width w-[180px] to match header */}
                      {visibleColumns.provider && (
                        <div className="flex-[1.2] min-w-[140px] mr-5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs font-medium text-foreground truncate">
                                {providerLabels[item.provider as keyof typeof providerLabels] || item.provider}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{providerLabels[item.provider as keyof typeof providerLabels] || item.provider}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}

                      {visibleColumns.category && (
                        <div className="flex-[0.9] min-w-[110px] mr-5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs font-medium text-foreground truncate">
                                {dataSource === "saas" ? item.subCategory : item.category}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{dataSource === "saas" ? item.subCategory : item.category}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}

                      {/* CHANGE: Date column changed to fixed width w-[110px] to match header */}
                      {visibleColumns.date && (
                        <div className="flex-[0.8] min-w-[100px] text-left mr-5">
                          {/* Date cell - show snooze duration for snoozed-archived tab */}
                          <div className="text-xs text-muted-foreground">
                            {activeViewId === "snoozed-archived"
                              ? item.status === "Snoozed"
                                ? getTimeRemaining(item.snoozedUntil)
                                : "N/A"
                              : item.createdDate}
                          </div>
                        </div>
                      )}

                      {visibleColumns.effort && (
                        <div className="flex-[0.6] min-w-[70px] text-left mr-5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0.5 ${
                              item.easeToImplement === "Easy"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : item.easeToImplement === "Medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {item.easeToImplement}
                          </Badge>
                        </div>
                      )}

                      {visibleColumns.priority && (
                        <div className="flex-[0.6] min-w-[70px] text-left mr-5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0.5 ${
                              item.calculatedPriority === "high"
                                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                : item.calculatedPriority === "medium"
                                  ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            }`}
                          >
                            {item.calculatedPriority === "high"
                              ? "High"
                              : item.calculatedPriority === "medium"
                                ? "Medium"
                                : "Low"}
                          </Badge>
                        </div>
                      )}

                      {/* CHANGE: Savings column changed to fixed width w-[140px] to match header */}
                      {visibleColumns.savings && (
                        <div className="flex-[1] min-w-[110px] text-right">
                          <div className="font-semibold text-green-600 text-sm truncate">{item.savings}</div>
                          <div className="text-[10px] text-gray-500">Annual Savings</div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {flatItems.length > 0 && (
                <div className="bg-white border-t border-border px-4 py-3 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Showing {(flatListPage - 1) * flatListItemsPerPage + 1}-
                    {Math.min(flatListPage * flatListItemsPerPage, flatItems.length)} of {flatItems.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium bg-white"
                      onClick={() => setFlatListPage(Math.max(1, flatListPage - 1))}
                      disabled={flatListPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(flatItems.length / flatListItemsPerPage)
                        const pages: (number | string)[] = []

                        if (totalPages <= 5) {
                          // Show all pages if 5 or fewer
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else if (flatListPage <= 3) {
                          // Show first 5 pages if current page is near the beginning
                          for (let i = 1; i <= 5; i++) {
                            pages.push(i)
                          }
                          pages.push("...")
                          pages.push(totalPages)
                        } else if (flatListPage >= totalPages - 2) {
                          // Show last 5 pages if current page is near the end
                          pages.push(1)
                          pages.push("...")
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // Show pages around the current page
                          pages.push(1)
                          pages.push("...")
                          for (let i = flatListPage - 1; i <= flatListPage + 1; i++) {
                            pages.push(i)
                          }
                          pages.push("...")
                          pages.push(totalPages)
                        }

                        return pages.map((page, index) => {
                          if (page === "...") {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">
                                ...
                              </span>
                            )
                          }

                          const pageNum = page as number
                          const isActive = pageNum === flatListPage

                          return (
                            <Button
                              key={pageNum}
                              variant="outline"
                              size="sm"
                              className={`h-8 w-8 p-0 text-xs font-medium ${
                                isActive
                                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                                  : "bg-white hover:bg-gray-100"
                              }`}
                              onClick={() => setFlatListPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium bg-white"
                      onClick={() =>
                        setFlatListPage(Math.min(Math.ceil(flatItems.length / flatListItemsPerPage), flatListPage + 1))
                      }
                      disabled={flatListPage === Math.ceil(flatItems.length / flatListItemsPerPage)}
                    >
                      Next
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Results per page:</span>
                    <Select
                      value={String(flatListItemsPerPage)}
                      onValueChange={(value) => setFlatListItemsPerPageHandler(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-16 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {finalDisplayedRecommendations.map((section, index) => {
                const isCollapsed = collapsedSections.has(section.key)
                const itemsPerPage = getItemsPerPage(section.key)
                const currentPage = sectionPages.get(section.key) || 1
                const startIndex = (currentPage - 1) * itemsPerPage
                const endIndex = startIndex + itemsPerPage
                const itemsToShow = section.items.slice(startIndex, endIndex)
                const totalPages = Math.ceil(section.items.length / itemsPerPage)

                return (
                  <div
                    key={section.key}
                    ref={(el) => setSectionRef(section.key, el)}
                    className={`${priorityColors[section.priority as keyof typeof priorityColors]} ${
                      index > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <Collapsible open={!isCollapsed} onOpenChange={() => toggleSection(section.key)}>
                      <CollapsibleTrigger asChild>
                        <div
                          className={`px-4 py-3 border-b ${priorityHeaderColors[section.priority as keyof typeof priorityHeaderColors]} cursor-pointer hover:bg-opacity-80 transition-colors flex items-center justify-between ${
                            isCollapsed ? "sticky bottom-0 z-20" : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-4 flex-shrink-0 mr-5">
                              <Checkbox
                                className="h-4 w-4"
                                checked={areAllGroupItemsSelected(section.key)}
                                ref={(el) => {
                                  if (el) {
                                    el.indeterminate = areSomeGroupItemsSelected(section.key)
                                  }
                                }}
                                onCheckedChange={(checked) => {
                                  handleSelectAllInGroup(section.key, checked as boolean)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <h3 className="font-semibold text-foreground text-sm">
                              {section.label} ({section.count})
                            </h3>
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="divide-y divide-border bg-white">
                          {isolatedSection === section.key ? (
                            // In isolated view, show items based on pagination (25 per page)
                            <>
                              {section.items
                                .slice(
                                  (isolatedViewPage - 1) * ISOLATED_VIEW_ITEMS_PER_PAGE,
                                  isolatedViewPage * ISOLATED_VIEW_ITEMS_PER_PAGE,
                                )
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleRowClick(item)}
                                  >
                                    {activeViewId !== "actioned" && (
                                      <div className="w-4 flex-shrink-0 mr-5">
                                        <Checkbox
                                          className="h-4 w-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                          checked={selectedItems.has(item.id)}
                                          onCheckedChange={(checked) =>
                                            handleCheckboxChange(item.id, checked as boolean)
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    )}

                                    <div className="flex-[2] min-w-[180px] max-w-[400px] mr-5">
                                      {(item.status === "New" ||
                                        item.status === "Re-visit" ||
                                        item.status === "Snoozed" ||
                                        item.status === "Marked for review" ||
                                        item.status === "Archived" ||
                                        item.status === "Actioned") && (
                                        <div className="mb-1">
                                          <Badge
                                            variant="secondary"
                                            className={`text-[10px] px-1.5 py-0 h-4 border ${
                                              item.status === "New"
                                                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                                : item.status === "Re-visit"
                                                  ? "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                                                  : item.status === "Snoozed"
                                                    ? "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                                                    : item.status === "Archived"
                                                      ? "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                                                      : item.status === "Actioned"
                                                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                                        : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                            }`}
                                          >
                                            {item.status}
                                          </Badge>
                                        </div>
                                      )}
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <h4 className="font-medium text-foreground text-sm mb-0.5 truncate">
                                            {item.title}
                                          </h4>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{item.title}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {item.description.replace(/SR\d{5}/g, "").trim()}
                                          </p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{item.description.replace(/SR\d{5}/g, "").trim()}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    {/* CHANGE: Provider column changed to fixed width w-[180px] to match header */}
                                    {visibleColumns.provider && (
                                      <div className="flex-[1.2] min-w-[140px] mr-5">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="text-xs font-medium text-foreground truncate">
                                              {providerLabels[item.provider as keyof typeof providerLabels] ||
                                                item.provider}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {providerLabels[item.provider as keyof typeof providerLabels] ||
                                                item.provider}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    )}

                                    {visibleColumns.category && (
                                      <div className="flex-[0.9] min-w-[110px] mr-5">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="text-xs font-medium text-foreground truncate">
                                              {dataSource === "saas" ? item.subCategory : item.category}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{dataSource === "saas" ? item.subCategory : item.category}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    )}

                                    {/* CHANGE: Date column changed to fixed width w-[110px] to match header */}
                                    {visibleColumns.date && (
                                      <div className="flex-[0.8] min-w-[100px] text-left mr-5">
                                        {/* Date cell - show remaining duration for both snoozed and archived items */}
                                        <div className="text-xs text-muted-foreground">
                                          {activeViewId === "snoozed-archived"
                                            ? item.status === "Snoozed"
                                              ? getTimeRemaining(item.snoozedUntil)
                                              : item.status === "Archived"
                                                ? getTimeRemaining(item.archivedUntil)
                                                : "N/A"
                                            : item.createdDate}
                                        </div>
                                      </div>
                                    )}

                                    {visibleColumns.effort && (
                                      <div className="flex-[0.6] min-w-[70px] text-left mr-5">
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] px-1.5 py-0.5 ${
                                            item.easeToImplement === "Easy"
                                              ? "bg-green-50 text-green-700 border-green-200"
                                              : item.easeToImplement === "Medium"
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : "bg-red-50 text-red-700 border-red-200"
                                          }`}
                                        >
                                          {item.easeToImplement}
                                        </Badge>
                                      </div>
                                    )}

                                    {visibleColumns.priority && (
                                      <div className="flex-[0.6] min-w-[70px] text-left mr-5">
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] px-1.5 py-0.5 ${
                                            item.calculatedPriority === "high"
                                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                              : item.calculatedPriority === "medium"
                                                ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                          }`}
                                        >
                                          {item.calculatedPriority === "high"
                                            ? "High"
                                            : item.calculatedPriority === "medium"
                                              ? "Medium"
                                              : "Low"}
                                        </Badge>
                                      </div>
                                    )}

                                    {/* CHANGE: Savings column changed to fixed width w-[140px] to match header */}
                                    {visibleColumns.savings && (
                                      <div className="flex-[1] min-w-[110px] text-right">
                                        <div className="font-semibold text-green-600 text-sm truncate">
                                          {item.savings}
                                        </div>
                                        <div className="text-[10px] text-gray-500">Annual Savings</div>
                                      </div>
                                    )}
                                  </div>
                                ))}

                              {section.items.length > ISOLATED_VIEW_ITEMS_PER_PAGE && (
                                <div className="p-3 flex items-center justify-center gap-3 bg-gray-50">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-medium bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setIsolatedViewPage((prev) => Math.max(1, prev - 1))
                                      window.scrollTo({ top: 0, behavior: "smooth" })
                                    }}
                                    disabled={isolatedViewPage === 1}
                                  >
                                    Previous
                                  </Button>

                                  <div className="flex items-center gap-1">
                                    {(() => {
                                      const totalPages = Math.ceil(section.items.length / ISOLATED_VIEW_ITEMS_PER_PAGE)
                                      const pages: (number | string)[] = []

                                      if (totalPages <= 5) {
                                        // Show all pages if 5 or fewer
                                        for (let i = 1; i <= totalPages; i++) {
                                          pages.push(i)
                                        }
                                      } else if (isolatedViewPage <= 3) {
                                        // Show first 5 pages if current page is near the beginning
                                        for (let i = 1; i <= 5; i++) {
                                          pages.push(i)
                                        }
                                        pages.push("...")
                                        pages.push(totalPages)
                                      } else if (isolatedViewPage >= totalPages - 2) {
                                        // Show last 5 pages if current page is near the end
                                        pages.push(1)
                                        pages.push("...")
                                        for (let i = totalPages - 4; i <= totalPages; i++) {
                                          pages.push(i)
                                        }
                                      } else {
                                        // Show pages around the current page
                                        pages.push(1)
                                        pages.push("...")
                                        for (let i = isolatedViewPage - 1; i <= isolatedViewPage + 1; i++) {
                                          pages.push(i)
                                        }
                                        pages.push("...")
                                        pages.push(totalPages)
                                      }

                                      return pages.map((page, index) => {
                                        if (page === "...") {
                                          return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">
                                              ...
                                            </span>
                                          )
                                        }

                                        const pageNum = page as number
                                        const isActive = pageNum === isolatedViewPage

                                        return (
                                          <Button
                                            key={pageNum}
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 w-8 p-0 text-xs font-medium ${
                                              isActive
                                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                                                : "bg-white hover:bg-gray-100"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setIsolatedViewPage(pageNum)
                                              window.scrollTo({ top: 0, behavior: "smooth" })
                                            }}
                                          >
                                            {pageNum}
                                          </Button>
                                        )
                                      })
                                    })()}
                                  </div>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-medium bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setIsolatedViewPage((prev) =>
                                        Math.min(
                                          Math.ceil(section.items.length / ISOLATED_VIEW_ITEMS_PER_PAGE),
                                          prev + 1,
                                        ),
                                      )
                                      window.scrollTo({ top: 0, behavior: "smooth" })
                                    }}
                                    disabled={
                                      isolatedViewPage >= Math.ceil(section.items.length / ISOLATED_VIEW_ITEMS_PER_PAGE)
                                    }
                                  >
                                    Next
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            // Normal view, show 10 items with expand functionality
                            <>
                              {itemsToShow.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handleRowClick(item)}
                                >
                                  {activeViewId !== "actioned" && (
                                    <div className="w-4 flex-shrink-0 mr-5">
                                      <Checkbox
                                        className="h-4 w-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                        checked={selectedItems.has(item.id)}
                                        onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  )}

                                  <div className="flex-[2] min-w-[180px] max-w-[400px] mr-5">
                                    {(item.status === "New" ||
                                      item.status === "Re-visit" ||
                                      item.status === "Snoozed" ||
                                      item.status === "Marked for review" ||
                                      item.status === "Archived" ||
                                      item.status === "Actioned") && (
                                      <div className="mb-1">
                                        <Badge
                                          variant="secondary"
                                          className={`text-[10px] px-1.5 py-0 h-4 border ${
                                            item.status === "New"
                                              ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                              : item.status === "Re-visit"
                                                ? "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                                                : item.status === "Snoozed"
                                                  ? "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                                                  : item.status === "Archived"
                                                    ? "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                                                    : item.status === "Actioned"
                                                      ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                                      : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                          }`}
                                        >
                                          {item.status}
                                        </Badge>
                                      </div>
                                    )}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <h4 className="font-medium text-foreground text-sm mb-0.5 truncate">
                                          {item.title}
                                        </h4>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{item.title}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {item.description.replace(/SR\d{5}/g, "").trim()}
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{item.description.replace(/SR\d{5}/g, "").trim()}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  {/* CHANGE: Provider column changed to fixed width w-[180px] to match header */}
                                  {visibleColumns.provider && (
                                    <div className="flex-[1.2] min-w-[140px] mr-5">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-xs font-medium text-foreground truncate">
                                            {providerLabels[item.provider as keyof typeof providerLabels] ||
                                              item.provider}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {providerLabels[item.provider as keyof typeof providerLabels] ||
                                              item.provider}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  )}

                                  {visibleColumns.category && (
                                    <div className="flex-[0.9] min-w-[110px] mr-5">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-xs font-medium text-foreground truncate">
                                            {dataSource === "saas" ? item.subCategory : item.category}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{dataSource === "saas" ? item.subCategory : item.category}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  )}

                                  {/* CHANGE: Date column changed to fixed width w-[110px] to match header */}
                                  {visibleColumns.date && (
                                    <div className="flex-[0.8] min-w-[100px] text-left mr-5">
                                      {/* Date cell - show snooze duration for snoozed-archived tab */}
                                      <div className="text-xs text-muted-foreground">
                                        {activeViewId === "snoozed-archived"
                                          ? item.status === "Snoozed"
                                            ? getTimeRemaining(item.snoozedUntil)
                                            : item.status === "Archived"
                                              ? getTimeRemaining(item.archivedUntil)
                                              : "N/A"
                                          : item.createdDate}
                                      </div>
                                    </div>
                                  )}

                                  {visibleColumns.effort && (
                                    <div className="flex-[0.6] min-w-[70px] text-left mr-5">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0.5 ${
                                          item.easeToImplement === "Easy"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : item.easeToImplement === "Medium"
                                              ? "bg-amber-50 text-amber-700 border-amber-200"
                                              : "bg-red-50 text-red-700 border-red-200"
                                        }`}
                                      >
                                        {item.easeToImplement}
                                      </Badge>
                                    </div>
                                  )}

                                  {visibleColumns.priority && (
                                    <div className="flex-[0.6] min-w-[70px] text-left mr-5">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0.5 ${
                                          item.calculatedPriority === "high"
                                            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                            : item.calculatedPriority === "medium"
                                              ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        }`}
                                      >
                                        {item.calculatedPriority === "high"
                                          ? "High"
                                          : item.calculatedPriority === "medium"
                                            ? "Medium"
                                            : "Low"}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* CHANGE: Savings column changed to fixed width w-[140px] to match header */}
                                  {visibleColumns.savings && (
                                    <div className="flex-[1] min-w-[110px] text-right">
                                      <div className="font-semibold text-green-600 text-sm truncate">
                                        {item.savings}
                                      </div>
                                      <div className="text-[10px] text-gray-500">Annual Savings</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {!isolatedSection && section.items.length > 10 && (
                          <div className="p-3 flex items-center justify-between bg-gray-50 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              Showing {startIndex + 1}-{Math.min(endIndex, section.items.length)} of{" "}
                              {section.items.length}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs font-medium bg-white"
                                onClick={() => goToSectionPage(section.key, Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>

                              <div className="flex items-center gap-1">
                                {(() => {
                                  const totalPages = Math.ceil(section.items.length / itemsPerPage)
                                  const pages: (number | string)[] = []

                                  if (totalPages <= 5) {
                                    // Show all pages if 5 or fewer
                                    for (let i = 1; i <= totalPages; i++) {
                                      pages.push(i)
                                    }
                                  } else if (currentPage <= 3) {
                                    // Show first 5 pages if current page is near the beginning
                                    for (let i = 1; i <= 5; i++) {
                                      pages.push(i)
                                    }
                                    pages.push("...")
                                    pages.push(totalPages)
                                  } else if (currentPage >= totalPages - 2) {
                                    // Show last 5 pages if current page is near the end
                                    pages.push(1)
                                    pages.push("...")
                                    for (let i = totalPages - 4; i <= totalPages; i++) {
                                      pages.push(i)
                                    }
                                  } else {
                                    // Show pages around the current page
                                    pages.push(1)
                                    pages.push("...")
                                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                      pages.push(i)
                                    }
                                    pages.push("...")
                                    pages.push(totalPages)
                                  }

                                  return pages.map((page, index) => {
                                    if (page === "...") {
                                      return (
                                        <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">
                                          ...
                                        </span>
                                      )
                                    }

                                    const pageNum = page as number
                                    const isActive = pageNum === currentPage

                                    return (
                                      <Button
                                        key={pageNum}
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 w-8 p-0 text-xs font-medium ${
                                          isActive
                                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                                            : "bg-white hover:bg-gray-100"
                                        }`}
                                        onClick={() => goToSectionPage(section.key, pageNum)}
                                      >
                                        {pageNum}
                                      </Button>
                                    )
                                  })
                                })()}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs font-medium bg-white"
                                onClick={() => goToSectionPage(section.key, Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Results per page:</span>
                              <Select
                                value={String(itemsPerPage)}
                                onValueChange={(value) => setItemsPerPage(section.key, Number(value))}
                              >
                                <SelectTrigger className="h-8 w-16 text-xs bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                  <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </TooltipProvider>

      {showBackToTop && !renderFlatList && (
        <div className="fixed bottom-24 right-6 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Button
            onClick={() => scrollToSection()}
            size="sm"
            className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg rounded-full h-12 w-12 p-0"
            title="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      )}

      {selectedItems.size > 0 && showBulkActions && !isPanelOpen && (
        <div
          key={animationKey}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="bg-background border border-border rounded-lg shadow-lg px-6 py-4 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              {selectedItems.size} {selectedItems.size === 1 ? "item" : "items"} selected
            </span>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              {isArchived ? (
                <>
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button onClick={handleRestore} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Undo2 className="h-4 w-4" />
                    Restore
                  </Button>
                </>
              ) : isSnoozed ? (
                <>
                  <Button onClick={handleArchive} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                  <Button
                    onClick={handleRestore}
                    size="sm"
                    className="gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                  >
                    <Undo2 className="h-4 w-4" />
                    Restore
                  </Button>
                </>
              ) : isMarkedForReview ? (
                <>
                  <Button onClick={handleArchive} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                  <Button onClick={handleRevisit} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Clock className="h-4 w-4" />
                    Snooze
                  </Button>
                  <Button onClick={handleUnmark} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Unmark {selectedItems.size === 1 ? "item" : "items"}
                  </Button>
                  <Button
                    onClick={handleSendToIntegration}
                    size="sm"
                    className="gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                  >
                    <Send className="h-4 w-4" />
                    {dataSource === "saas" ? "Action recommendation" : "Send to integration"}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleArchive} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                  <Button onClick={handleSmartTag} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Tag className="h-4 w-4" />
                    Smart Tags
                  </Button>
                  <Button onClick={handleMarkForReview} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Flag className="h-4 w-4" />
                    Mark for review
                  </Button>
                  <Button onClick={handleRevisit} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Clock className="h-4 w-4" />
                    Snooze
                  </Button>
                  <Button
                    onClick={handleSendToIntegration}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                  >
                    <Send className="h-4 w-4" />
                    {dataSource === "saas" ? "Action recommendation" : "Send to integration"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <RecommendationSidePanel
        isOpen={isPanelOpen}
        onClose={handleSidePanelClose}
        item={selectedItem}
        onStatusChange={handleSidePanelStatusChange}
        onArchive={handleSidePanelArchive}
        onSendToIntegration={handleSidePanelSendToIntegration}
        dataSource={dataSource} // Pass dataSource prop to side panel so it shows correct button label
      />

      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveConfirm}
        selectedCount={selectedItems.size}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemTitle={`${selectedItems.size} recommendation${selectedItems.size === 1 ? "" : "s"}`}
      />

      <SendToIntegrationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onConfirm={handleSendConfirm}
        selectedCount={selectedItems.size}
        selectedItems={getSelectedItemsData()}
        onRemoveItem={handleRemoveItemFromSelection}
        dataSource={dataSource} // Pass dataSource prop to modal
      />

      <RevisitModal
        isOpen={isRevisitModalOpen}
        onClose={() => setIsRevisitModalOpen(false)}
        onConfirm={handleRevisitConfirm}
        selectedCount={selectedItems.size}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleMarkForReviewConfirm}
        selectedCount={selectedItems.size}
      />

      {/* Smart Tag Dialog */}
      <Dialog open={isSmartTagDialogOpen} onOpenChange={setIsSmartTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Manage tags for {selectedItems.size} selected recommendation{selectedItems.size === 1 ? "" : "s"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
              {smartTags.map((tag, index) => {
                // REMOVED: isMarkedForRemoval check as it's no longer needed
                const isNewlyAdded = addedTags.some((t) => t.type === tag.type && t.value === tag.value)

                return (
                  <Badge
                    key={`assigned-${tag.type}-${tag.value}-${index}`}
                    variant="secondary"
                    className={`text-xs font-normal px-2 py-0.5 h-6 group ${
                      isNewlyAdded
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>
                      {tagTypeLabels[tag.type as keyof typeof tagTypeLabels]}: {tag.value}
                    </span>
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className={`ml-1 rounded-full p-0.5 transition-colors ${
                        isNewlyAdded ? "hover:bg-green-200" : "hover:bg-slate-200"
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>

            <div className="mt-1.5">
              <Popover open={isAddTagPopoverOpen} onOpenChange={setIsAddTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 text-xs font-medium no-underline hover:no-underline px-0"
                  >
                    + Add Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="relative overflow-x-hidden">
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        showTagValues ? "-translate-x-full opacity-0 absolute" : "translate-x-0 opacity-100"
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-700 mb-2">Tag type</div>
                      <div className="space-y-1 max-h-[176px] overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
                        {Object.entries(tagTypeLabels).map(([key, label]) => (
                          <Button
                            key={key}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewTagType(key)
                              setShowTagValues(true)
                            }}
                            className="w-full justify-start h-8 text-xs font-normal hover:bg-slate-100"
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        showTagValues ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowTagValues(false)
                            setNewTagValue("")
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <div className="text-xs font-medium text-gray-700">Tag value</div>
                      </div>
                      <div className="space-y-1 max-h-[176px] overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
                        {tagValueOptions.map((value) => (
                          <Button
                            key={value}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleAddTag(value)
                            }}
                            className="w-full justify-start h-8 text-xs font-normal hover:bg-slate-100"
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleCancelSmartTags} className="h-9 text-xs bg-transparent">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSmartTags}
              className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function transformCustomRecommendations(recommendations: any[]) {
  const grouped = recommendations.reduce(
    (acc, item) => {
      if (!acc[item.priority]) {
        acc[item.priority] = []
      }
      acc[item.priority].push({
        ...item,
        icon: item.iconUrl ? null : getProviderIcon(item.provider),
        iconUrl: item.iconUrl || null,
        period: "annual saving",
        easeToImplement: item.easeToImplement || getEaseToImplement(item.category),
        createdDate: item.createdDate || "N/A", // Add createdDate for new column
        snoozedUntil: item.snoozedUntil || null, // Assuming snoozedUntil is available
        archivedUntil: item.archivedUntil || null, // Assuming archivedUntil is available
      })
      return acc
    },
    {} as Record<string, any[]>,
  )

  return Object.entries(grouped).map(([priority, items]) => ({
    priority,
    count: items.length,
    items,
  }))
}

function getProviderIcon(provider: string) {
  switch (provider) {
    case "azure":
      return AzureIcon
    case "aws":
      return AWSIcon
    case "gcp":
      return GoogleCloudIcon
    default:
      return AzureIcon
  }
}
