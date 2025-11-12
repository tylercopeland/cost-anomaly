"use client"

import {
  X,
  CheckCircle2,
  Clock,
  Send,
  Archive,
  Undo2,
  Trash2,
  Settings,
  ArrowLeft,
  Flag,
  Search,
  MoreHorizontal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { SendToIntegrationModal } from "@/components/send-to-integration-modal"
import { useToast } from "@/hooks/use-toast"

interface RecommendationItem {
  id: number
  title: string
  description: string
  savings: string
  period: string
  status: string
  priority: string
  owner: string
  subCategory?: string
  category?: string
  account?: string // Added account field for SaaS recommendations
  archiveNote?: {
    note: string
    owner: string
    timestamp: string
  }
  reviewNote?: {
    note: string
    owner: string
    timestamp: string
  }
  tagType?: string
  tagValue?: string
  createdDate?: string
  snoozedUntil?: string // Added snoozedUntil field
  archivedUntil?: string // Added archivedUntil field
}

interface RecommendationSidePanelProps {
  isOpen: boolean
  onClose: () => void
  item: RecommendationItem | null
  onStatusChange?: (id: number, status: string) => void
  onArchive?: (id: number) => void
  onSendToIntegration?: (id: number) => void
  onConfirmDelete?: (id: number) => void
  dataSource?: "cloud" | "saas" // Added dataSource prop
}

export function RecommendationSidePanel({
  isOpen,
  onClose,
  item,
  onStatusChange,
  onArchive,
  onSendToIntegration,
  onConfirmDelete,
  dataSource = "cloud", // Default to cloud for backward compatibility
  account: accountProp = null, // Optional account prop to show account details directly
}: RecommendationSidePanelProps) {
  const [selectedOwner, setSelectedOwner] = useState(item ? item.owner : "Jessica Lee")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const { toast } = useToast()
  const [showAllAccounts, setShowAllAccounts] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(accountProp || null)
  const [accountTab, setAccountTab] = useState("details")
  const [accountSearchQuery, setAccountSearchQuery] = useState("")

  const [smartTags, setSmartTags] = useState<Array<{ type: string; value: string }>>([])
  const [originalTags, setOriginalTags] = useState<Array<{ type: string; value: string }>>([])
  const [removedTags, setRemovedTags] = useState<Array<{ type: string; value: string }>>([])
  const [addedTags, setAddedTags] = useState<Array<{ type: string; value: string }>>([])
  const [newTagType, setNewTagType] = useState("")
  const [newTagValue, setNewTagValue] = useState("")
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)
  const [showTagValues, setShowTagValues] = useState(false)
  const [isAddTagPopoverOpen, setIsAddTagPopoverOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  // Update selectedAccount when accountProp changes
  useEffect(() => {
    if (accountProp) {
      setSelectedAccount(accountProp)
      setAccountTab("details")
    }
  }, [accountProp])

  useEffect(() => {
    if (item) {
      const tags = []
      if (item.tagType && item.tagValue) {
        tags.push({ type: item.tagType, value: item.tagValue })
      }
      tags.push(
        { type: "Cloud", value: "Azure" },
        { type: "Service", value: "Virtual Machines" },
        { type: "Impact", value: "High Savings" },
        { type: "Region", value: "East US" },
      )
      setSmartTags(tags)
      setOriginalTags(tags)
      setRemovedTags([])
      setAddedTags([])
    }
  }, [item])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 400)
  }

  const handleRevisit = () => {
    if (item && onStatusChange) {
      onStatusChange(item.id, "Re-visit")
      toast({
        title: "Marked for Re-visit",
        description: "The recommendation has been marked for re-visit.",
        duration: 5000,
      })
    }
  }

  const handleArchive = () => {
    if (item && onArchive) {
      onArchive(item.id)
      toast({
        title: "Recommendation Archived",
        description: "The recommendation has been successfully archived.",
        duration: 5000,
      })
    }
  }

  const handleRestore = () => {
    if (item && onStatusChange) {
      onStatusChange(item.id, "New")
      toast({
        title: "Recommendation Restored",
        description: "The recommendation has been successfully restored.",
        duration: 5000,
      })
    }
  }

  const handleUnmark = () => {
    if (item && onStatusChange) {
      onStatusChange(item.id, "Viewed")
      toast({
        title: "Unmarked",
        description: "The recommendation has been unmarked and set to Viewed.",
        duration: 5000,
      })
      handleClose()
    }
  }

  const handleMarkForReview = () => {
    if (item && onStatusChange) {
      onStatusChange(item.id, "Marked for review")
      toast({
        title: "Marked for Review",
        description: "The recommendation has been marked for review.",
        duration: 5000,
      })
      handleClose()
    }
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleSendToIntegration = () => {
    setIsSendModalOpen(true)
  }

  const handleSendConfirm = (integration: string) => {
    if (item && onStatusChange) {
      onStatusChange(item.id, "Actioned")
      toast({
        title: "Sent to Integration",
        description: `Recommendation sent to ${integration === "azure-devops" ? "Azure DevOps" : integration}.`,
        duration: 5000,
      })
      handleClose()
    }
  }

  const getActionDescription = () => {
    if (!item) return ""

    const category = item.category || detailsData.category
    const subCategory = item.subCategory

    // Generate action description based on category and subcategory
    switch (category) {
      case "Financial":
        if (subCategory === "Recategorize") {
          return `Review and reclassify users having E-type license to F3 license.`
        }
        return `Review and optimize license allocation based on actual usage patterns and user requirements.`

      case "Reserved Instances":
        if (subCategory === "Reserved VM") {
          return `Purchase Reserved VM Instances for ${detailsData.resourceName} to lock in discounted rates for 1 or 3 years. This commitment-based pricing can reduce costs by up to 72% compared to pay-as-you-go rates. Review current usage patterns and forecast future needs before committing.`
        }
        if (subCategory === "Cosmos DB") {
          return `Purchase Reserved Capacity for Cosmos DB to reduce costs by up to 65% with 1 or 3-year commitments. Analyze your throughput requirements and choose the appropriate reservation tier. Consider regional deployment patterns when sizing your reservation.`
        }
        if (subCategory === "SQL") {
          return `Purchase SQL Database Reserved Capacity to save up to 80% on compute costs with 1 or 3-year commitments. Review your database tier requirements and ensure consistent usage patterns before committing to reserved capacity.`
        }
        return `Purchase Reserved Instances for ${detailsData.resourceName} to achieve significant cost savings through commitment-based pricing. Analyze usage patterns over the past 30-90 days to determine the optimal reservation size and term length.`

      case "VM Optimisation":
        if (subCategory === "Idle") {
          return `Review Idle VM ${detailsData.resourceName} with CPU averaging ${(Math.random() * 2).toFixed(2)}% and Memory Available averaging ${(95 + Math.random() * 4).toFixed(2)}% over the last 30 days. Consider shutting down the VM or implementing a start/stop schedule to eliminate unnecessary costs.`
        }
        if (subCategory === "Underutilized") {
          return `VM ${detailsData.resourceName} is underutilized with CPU averaging ${(5 + Math.random() * 15).toFixed(2)}% and Memory usage at ${(30 + Math.random() * 20).toFixed(2)}%. Consider downsizing to a smaller VM SKU or implementing auto-scaling to match actual workload requirements.`
        }
        if (subCategory === "Oversized") {
          return `VM ${detailsData.resourceName} is oversized for current workload demands. Right-size to a more appropriate SKU based on actual CPU, memory, and disk I/O metrics. This can reduce costs by 30-50% while maintaining performance.`
        }
        if (subCategory === "Right-sizing") {
          return `Optimize VM ${detailsData.resourceName} by right-sizing to match actual resource consumption. Analyze performance metrics over the past 30 days and select a VM SKU that provides adequate headroom while eliminating waste.`
        }
        return `Optimize VM ${detailsData.resourceName} based on actual usage patterns. Review CPU, memory, and disk metrics to identify opportunities for right-sizing or implementing auto-scaling policies.`

      case "Savings Plans":
        if (subCategory === "Compute") {
          return `Purchase Compute Savings Plans to save up to 66% on compute costs across VM instances, App Services, and Azure Functions. Commit to a consistent hourly spend for 1 or 3 years and benefit from automatic application across eligible services.`
        }
        if (subCategory === "EC2") {
          return `Purchase EC2 Instance Savings Plans to reduce costs by up to 72% compared to On-Demand pricing. Commit to a specific instance family in a region and benefit from flexibility in instance size, OS, and tenancy.`
        }
        return `Purchase Savings Plans to achieve significant cost reductions through flexible commitment-based pricing. Analyze your compute spending patterns and choose the appropriate plan type and commitment level.`

      case "Hybrid Benefit":
        if (subCategory === "Windows Server") {
          return `Apply Azure Hybrid Benefit for Windows Server to save up to 40% on VM costs. Use your existing Windows Server licenses with Software Assurance to reduce Azure compute expenses. Verify license eligibility and compliance requirements.`
        }
        if (subCategory === "SQL Server") {
          return `Apply Azure Hybrid Benefit for SQL Server to save up to 55% on database costs. Leverage your existing SQL Server licenses with Software Assurance to reduce Azure SQL Database and SQL Managed Instance expenses.`
        }
        return `Apply Azure Hybrid Benefit to leverage your existing on-premises licenses in Azure. This can reduce costs by 40-55% on eligible services. Ensure you have active Software Assurance coverage before applying.`

      case "Zombies":
        if (subCategory === "Unattached Disks") {
          return `Delete unattached disk ${detailsData.resourceName} that is no longer associated with any VM. This orphaned resource is incurring unnecessary storage costs. Create a snapshot for backup if needed before deletion.`
        }
        if (subCategory === "Idle Resources") {
          return `Remove idle resource ${detailsData.resourceName} that has shown no activity for the past 30 days. Verify with the resource owner that it's no longer needed, then delete to eliminate ongoing costs.`
        }
        if (subCategory === "Orphaned Snapshots") {
          return `Delete orphaned snapshot ${detailsData.resourceName} that is no longer associated with any active disk or VM. Review snapshot age and retention requirements before deletion to ensure compliance with backup policies.`
        }
        if (subCategory === "Unused IPs") {
          return `Release unused public IP address ${detailsData.resourceName} that is not associated with any active resource. Public IPs incur charges even when not in use. Verify it's not reserved for future use before releasing.`
        }
        return `Remove zombie resource ${detailsData.resourceName} that is no longer in use but continues to incur costs. Verify with stakeholders before deletion and ensure proper backup procedures are followed.`

      case "Storage":
        if (subCategory === "Blob Storage") {
          return `Optimize Blob Storage ${detailsData.resourceName} by implementing lifecycle management policies. Move infrequently accessed data to Cool or Archive tiers to reduce storage costs by up to 50%. Review access patterns over the past 90 days.`
        }
        if (subCategory === "Archive Storage") {
          return `Move old data in ${detailsData.resourceName} to Archive Storage tier to reduce costs by up to 95%. Archive tier is ideal for data that is rarely accessed and can tolerate several hours of retrieval latency.`
        }
        return `Optimize storage costs for ${detailsData.resourceName} by implementing tiering policies and removing redundant data. Review access patterns and retention requirements to select the most cost-effective storage tier.`

      case "Database":
        if (subCategory === "SQL Database") {
          return `Optimize SQL Database ${detailsData.resourceName} by right-sizing the service tier based on actual DTU or vCore usage. Consider implementing auto-pause for development databases and review backup retention policies.`
        }
        if (subCategory === "CosmosDB") {
          return `Optimize Cosmos DB ${detailsData.resourceName} by reviewing provisioned throughput and implementing autoscale. Consider using serverless for unpredictable workloads and optimize indexing policies to reduce RU consumption.`
        }
        return `Optimize database ${detailsData.resourceName} by right-sizing compute resources and implementing cost-effective backup strategies. Review query performance and indexing to ensure efficient resource utilization.`

      case "DEVUAT":
        if (subCategory === "Development") {
          return `Implement auto-shutdown schedule for development environment ${detailsData.resourceName}. Development resources typically don't need to run 24/7. Configure automatic start/stop schedules to reduce costs by 65-75% during non-business hours.`
        }
        if (subCategory === "UAT") {
          return `Optimize UAT environment ${detailsData.resourceName} by implementing scheduled shutdown during non-testing periods. Consider using lower-tier SKUs for UAT workloads that don't require production-level performance.`
        }
        return `Optimize non-production environment ${detailsData.resourceName} by implementing auto-shutdown schedules and right-sizing resources. Non-production workloads rarely need to run continuously or at production scale.`

      default:
        return `Review and optimize ${detailsData.resourceName} based on current usage patterns and business requirements. Analyze cost trends, performance metrics, and utilization data to identify the most effective optimization strategy.`
    }
  }

  const detailsData = {
    name: item ? item.title : "",
    type: "VM Optimizer",
    subscription: item ? item.description.split(" • ")[0] : "",
    category: "Reserved Instances",
    savingsP1m: "$605.08",
    savingsPercentP1m: "3.182760",
    savingsP1y: "$7,260.96",
    savingsP3y: "$21,782.88",
    resourceName: "vm-prod-cluster-01",
    preview: "Jan 1, 1970",
    lastCalculatedDate: "Sep 12, 2025",
    owner: "John Smith",
    externalId: "-",
    integrationPlugin: "-",
    automationStatus: "-",
    lastExecutedDate: "-",
    actions: "-",
  }

  const allOwners = ["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]

  const getTimeRemaining = (dateString: string) => {
    const targetDate = new Date(dateString)
    const now = new Date()
    const diffMs = targetDate.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "Expired"
    } else if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "1 day remaining"
    } else if (diffDays < 30) {
      return `${diffDays} days remaining`
    } else if (diffDays < 60) {
      const months = Math.floor(diffDays / 30)
      const days = diffDays % 30
      if (days === 0) {
        return `${months} month remaining`
      }
      return `${months} month, ${days} days remaining`
    } else {
      const months = Math.floor(diffDays / 30)
      const days = diffDays % 30
      if (days === 0) {
        return `${months} months remaining`
      }
      return `${months} months, ${days} days remaining`
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-50 text-blue-600 border-blue-200"
      case "viewed":
        return "bg-gray-50 text-gray-700 border-gray-200"
      case "re-visit":
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
      case "snoozed":
        return "bg-purple-50 text-purple-600 border-purple-200"
      case "marked for review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "actioned":
        return "bg-green-50 text-green-600 border-green-200"
      case "archived":
        return "bg-gray-100 text-gray-600 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const hasLogs =
    item &&
    (item.status.toLowerCase() === "actioned" ||
      item.status.toLowerCase() === "implemented" ||
      (item.status.toLowerCase() === "archived" && item.archiveNote) ||
      item.reviewNote) // Show logs if review note exists

  const activityLogEntries = []

  if (item?.reviewNote && item.status.toLowerCase() !== "snoozed") {
    activityLogEntries.push({
      id: `review-${item.id}`,
      type: "review",
      title: "Review Note",
      description: item.reviewNote.note,
      timestamp: item.reviewNote.timestamp,
      owner: item.reviewNote.owner,
      status: "completed",
    })
  }

  if (item?.archiveNote) {
    activityLogEntries.push({
      id: `archive-${item.id}`,
      type: "archived",
      title: "Archive Note",
      description: item.archiveNote.note,
      timestamp: item.archiveNote.timestamp,
      owner: item.archiveNote.owner,
      status: "completed",
      timeRemaining: item.archivedUntil ? getTimeRemaining(item.archivedUntil) : undefined,
    })
  }

  // Sort by timestamp (most recent first)
  activityLogEntries.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    return dateB - dateA
  })

  const hasActivityLog = activityLogEntries.length > 0

  const logEntries = []

  // Add review note to log
  if (item?.reviewNote) {
    logEntries.push({
      id: `log-review-${item.id}`,
      type: "review",
      title: item.status.toLowerCase() === "snoozed" ? "Snoozed" : "Marked for Review",
      description: item.status.toLowerCase() === "snoozed" ? "" : item.reviewNote.note,
      timestamp: item.reviewNote.timestamp,
      owner: item.reviewNote.owner,
      status: "completed",
      timeRemaining:
        item.status.toLowerCase() === "snoozed" && item.snoozedUntil ? getTimeRemaining(item.snoozedUntil) : undefined,
    })
  }

  // Add archive note to log
  if (item?.archiveNote) {
    logEntries.push({
      id: `log-archive-${item.id}`,
      type: "archived",
      title: "Recommendation Archived",
      description: item.archiveNote.note,
      timestamp: item.archiveNote.timestamp,
      owner: item.archiveNote.owner,
      status: "completed",
      timeRemaining: item.archivedUntil ? getTimeRemaining(item.archivedUntil) : undefined,
    })
  }

  // Add integration actions if status is actioned
  if (item && item.status.toLowerCase() === "actioned") {
    logEntries.push(
      {
        id: `log-sent-${item.id}`,
        type: "sent",
        title: "Sent to Azure DevOps",
        description: "Recommendation exported from application to Azure DevOps",
        timestamp: "Oct 1, 2025 at 2:34 PM",
        status: "completed",
      },
      {
        id: `log-created-${item.id}`,
        type: "status",
        title: "Work Item Created",
        description: "Azure DevOps work item #4521 created in project 'Cloud Optimization'",
        timestamp: "Oct 1, 2025 at 2:35 PM",
        status: "completed",
      },
      {
        id: `log-progress-${item.id}`,
        type: "status",
        title: "In Progress",
        description: "Status updated to 'In Progress' in Azure DevOps by Alex Wilson",
        timestamp: "Oct 3, 2025 at 9:15 AM",
        status: "completed",
      },
      {
        id: `log-completed-${item.id}`,
        type: "completed",
        title: "Implementation Completed",
        description: "Work item marked as completed in Azure DevOps. Changes deployed to production.",
        timestamp: "Oct 8, 2025 at 4:22 PM",
        status: "completed",
      },
    )
  }

  // Sort log entries by timestamp (most recent first)
  logEntries.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    return dateB - dateA
  })

  const handleRemoveTag = (index: number) => {
    const tagToRemove = smartTags[index]

    const wasOriginal = originalTags.some((t) => t.type === tagToRemove.type && t.value === tagToRemove.value)
    const wasAdded = addedTags.some((t) => t.type === tagToRemove.type && t.value === tagToRemove.value)

    if (wasAdded) {
      setAddedTags((prev) => prev.filter((t) => !(t.type === tagToRemove.type && t.value === tagToRemove.value)))
      setSmartTags((prev) => prev.filter((_, i) => i !== index))
    } else if (wasOriginal) {
      setRemovedTags((prev) => [...prev, tagToRemove])
      setSmartTags((prev) => prev.filter((_, i) => i !== index))
    }
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

  const handleSaveTags = () => {
    const finalTags = smartTags.filter((tag) => !removedTags.some((t) => t.type === tag.type && t.value === tag.value))
    setSmartTags(finalTags)
    setOriginalTags(finalTags)
    setRemovedTags([])
    setAddedTags([])
    setIsTagPopoverOpen(false)
    setNewTagType("")
    setNewTagValue("")
    setShowTagValues(false)
    setIsAddTagPopoverOpen(false)
    toast({
      title: "Tags Updated",
      description: "Smart tags have been successfully updated.",
      duration: 5000,
    })
  }

  const handleCancelTags = () => {
    setSmartTags(originalTags)
    setRemovedTags([])
    setAddedTags([])
    setIsTagPopoverOpen(false)
    setNewTagType("")
    setNewTagValue("")
    setShowTagValues(false)
    setIsAddTagPopoverOpen(false)
  }

  const tagTypeOptions = {
    "Cost-allocation-type": ["Direct", "Indirect", "Shared"],
    "Cost-center": ["Engineering", "Marketing", "Sales", "Operations"],
    Environment: ["Production", "Staging", "Development", "Testing"],
    Portfolio: ["Portfolio A", "Portfolio B", "Portfolio C"],
    "Shared-cost-type": ["Proportional", "Equal", "Usage-based"],
    "Sub-portfolio": ["Sub-portfolio 1", "Sub-portfolio 2", "Sub-portfolio 3"],
    Cloud: ["Azure", "AWS", "GCP"],
    Service: ["Virtual Machines", "Storage", "Networking", "Databases"],
    Impact: ["High Savings", "Medium Savings", "Low Savings"],
    Region: ["East US", "West US", "Central US", "North Europe", "West Europe"],
  }

  const tagTypeLabels = {
    "Cost-allocation-type": "Cost Allocation Type",
    "Cost-center": "Cost Center",
    Environment: "Environment",
    Portfolio: "Portfolio",
    "Shared-cost-type": "Shared Cost Type",
    "Sub-portfolio": "Sub-Portfolio",
    Cloud: "Cloud",
    Service: "Service",
    Impact: "Impact",
    Region: "Region",
  }

  const tagValueOptions = newTagType ? tagTypeOptions[newTagType as keyof typeof tagTypeOptions] || [] : []

  const getSelectedItemsData = () => {
    if (!item) return []

    // Extract savings amount from the savings string (e.g., "$7,260.96" -> 7260.96)
    const savingsMatch = detailsData.savingsP3y.match(/[\d,]+\.?\d*/)
    const savingsAmount = savingsMatch ? Number.parseFloat(savingsMatch[0].replace(/,/g, "")) : 0

    return [
      {
        id: item.id,
        title: item.title,
        savings: detailsData.savingsP3y,
        savingsAmount: savingsAmount,
      },
    ]
  }

  const generateImpactedAccounts = () => {
    const firstNames = [
      "Sarah",
      "Michael",
      "Emily",
      "David",
      "Jessica",
      "James",
      "Jennifer",
      "Robert",
      "Linda",
      "William",
      "Mary",
      "John",
      "Patricia",
      "Richard",
      "Barbara",
      "Thomas",
      "Susan",
      "Charles",
      "Margaret",
      "Daniel",
      "Lisa",
      "Matthew",
      "Nancy",
      "Anthony",
      "Karen",
      "Mark",
      "Betty",
      "Donald",
      "Helen",
      "Steven",
      "Sandra",
      "Paul",
      "Ashley",
      "Andrew",
      "Kimberly",
      "Joshua",
      "Donna",
      "Kenneth",
      "Emily",
      "Kevin",
      "Carol",
      "Brian",
      "Michelle",
      "George",
      "Amanda",
      "Edward",
      "Melissa",
      "Ronald",
      "Deborah",
      "Timothy",
    ]
    const lastNames = [
      "Johnson",
      "Chen",
      "Rodriguez",
      "Kim",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
      "Lee",
      "Perez",
      "Thompson",
      "White",
      "Harris",
      "Sanchez",
      "Clark",
      "Ramirez",
      "Lewis",
      "Robinson",
      "Walker",
      "Young",
      "Allen",
      "King",
      "Wright",
      "Scott",
      "Torres",
      "Nguyen",
      "Hill",
      "Flores",
      "Green",
      "Adams",
      "Nelson",
      "Baker",
      "Hall",
      "Rivera",
      "Campbell",
      "Mitchell",
      "Carter",
    ]

    const accounts = []
    const totalAccounts = 247 // Generate 247 accounts

    for (let i = 0; i < totalAccounts; i++) {
      const firstName = firstNames[i % firstNames.length]
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 49 ? i : ""}@company.com`
      accounts.push(email)
    }

    return accounts
  }

  const impactedAccounts = item?.subCategory ? generateImpactedAccounts() : []
  const filteredAccounts = accountSearchQuery
    ? impactedAccounts.filter((email) => email.toLowerCase().includes(accountSearchQuery.toLowerCase()))
    : impactedAccounts
  const displayedAccounts = showAllAccounts ? filteredAccounts : filteredAccounts.slice(0, 10)

  const handleAccountClick = (email: string) => {
    setSelectedAccount(email)
    setAccountTab("details")
  }

  const handleBackToRecommendation = () => {
    setSelectedAccount(null)
    // If there's no item, closing account view should close the panel
    if (!item) {
      handleClose()
    }
  }

  // Allow panel to open with just an account (no item required)
  if (!isOpen || (!item && !selectedAccount)) return null

  return (
    <>
      <div className="fixed inset-0 bg-transparent z-40" onClick={handleClose} />

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col ${
          isClosing
            ? "animate-out slide-out-to-right-full duration-400"
            : "animate-in slide-in-from-right-full duration-400"
        }`}
      >
        {selectedAccount ? (
          // Account Detail View
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute top-4 right-4 h-8 w-8 p-0 z-10"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Back button - only show if there's a recommendation item to go back to */}
              {item && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToRecommendation}
                  className="mb-4 -ml-2 gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to recommendation
                </Button>
              )}

              {/* Account header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedAccount}</h2>
                <div className="text-sm text-gray-600">
                  <span>Account Details</span>
                </div>
              </div>

              {/* Horizontal tabs navigation */}
              <div className="border-b border-gray-200 mb-6 -mx-8">
                <div className="flex gap-1 overflow-x-auto items-center pl-8">
                  {[
                    { id: "details", label: "Details" },
                    { id: "groups", label: "Groups" },
                    { id: "licenses", label: "Licenses" },
                    { id: "devices", label: "Devices" },
                  ].map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setAccountTab(tab.id)}
                      className={`${index === 0 ? "pl-0 pr-4" : "px-4"} py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                        accountTab === tab.id ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                      {accountTab === tab.id && (
                        <div
                          className={`absolute bottom-0 h-0.5 bg-blue-600 ${
                            index === 0 ? "left-0 right-4" : "left-4 right-4"
                          }`}
                        />
                      )}
                    </button>
                  ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                          accountTab === "activities" || accountTab === "recommendations"
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span>More</span>
                        <MoreHorizontal className="h-4 w-4" />
                        {(accountTab === "activities" || accountTab === "recommendations") && (
                          <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setAccountTab("activities")} className="cursor-pointer">
                        Activities
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAccountTab("recommendations")} className="cursor-pointer">
                        Recommendations
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tab content */}
              <div>
                {accountTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Account Information</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
                          <div className="text-sm text-gray-900">{selectedAccount}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium bg-green-50 text-green-700 border-green-200"
                          >
                            Enabled
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Department
                          </div>
                          <div className="text-sm text-gray-900">Engineering</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</div>
                          <div className="text-sm text-gray-900">San Francisco, CA</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Last Sign-in
                          </div>
                          <div className="text-sm text-gray-900">Nov 4, 2025 at 3:42 PM</div>
                        </div>
                      </div>
                    </div>

                    {/* Smart Tags section to Details tab */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Smart Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { type: "Department", value: "Engineering" },
                          { type: "Cost Center", value: "CC-1001" },
                          { type: "Location", value: "San Francisco" },
                          { type: "Employee Type", value: "Full-time" },
                          { type: "Manager", value: "John Smith" },
                        ].map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs font-normal bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tag.type}: {tag.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {accountTab === "activities" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-3">
                      {[
                        { action: "Signed in", time: "2 hours ago", device: "Windows Desktop" },
                        { action: "License assigned", time: "1 day ago", device: "Microsoft 365 E5" },
                        { action: "Password changed", time: "3 days ago", device: "Web Portal" },
                        { action: "Group membership updated", time: "5 days ago", device: "Admin Portal" },
                      ].map((activity, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                              <div className="text-xs text-gray-500 mt-1">{activity.device}</div>
                            </div>
                            <div className="text-xs text-gray-500">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {accountTab === "licenses" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Assigned Licenses</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Microsoft 365 E5", status: "Active", assigned: "Oct 15, 2025" },
                        { name: "Power BI Pro", status: "Active", assigned: "Sep 22, 2025" },
                        { name: "Project Plan 3", status: "Inactive", assigned: "Aug 10, 2025" },
                      ].map((license, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900">{license.name}</div>
                            <Badge
                              variant="secondary"
                              className={`text-xs font-medium ${
                                license.status === "Active"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {license.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">Assigned: {license.assigned}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {accountTab === "groups" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Group Memberships</h3>
                    <div className="space-y-2">
                      {[
                        "Engineering Team",
                        "All Employees",
                        "Microsoft 365 Users",
                        "Project Contributors",
                        "Development Team",
                      ].map((group, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="text-sm text-gray-900">{group}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {accountTab === "devices" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Registered Devices</h3>
                    <div className="space-y-3">
                      {[
                        { name: "DESKTOP-ABC123", type: "Windows 11 Pro", lastSeen: "2 hours ago" },
                        { name: "iPhone 14 Pro", type: "iOS 17.1", lastSeen: "1 day ago" },
                        { name: "MacBook Pro", type: "macOS Sonoma", lastSeen: "3 days ago" },
                      ].map((device, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">{device.name}</div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>{device.type}</div>
                            <div>Last seen: {device.lastSeen}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {accountTab === "recommendations" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Related Recommendations</h3>
                    <div className="space-y-3">
                      {[
                        {
                          title: "Remove unused Project Online license",
                          savings: "$120/year",
                          priority: "High",
                        },
                        {
                          title: "Downgrade to Microsoft 365 E3",
                          savings: "$180/year",
                          priority: "Medium",
                        },
                      ].map((rec, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900">{rec.title}</div>
                            <Badge
                              variant="secondary"
                              className={`text-xs font-medium ${
                                rec.priority === "High"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              }`}
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-green-600 font-medium">{rec.savings}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Original Recommendation View
          <>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto pb-24">
              <div className="p-8 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute top-4 right-4 h-8 w-8 p-0 z-10"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Recommendation Title and Subscription */}
                <div className="mb-6">
                  {dataSource === "saas" && item && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Recommendation details
                      </div>
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{detailsData.name}</h2>
                  {dataSource !== "saas" && (
                    <div className="text-sm text-gray-600">
                      <span>{detailsData.subscription}</span>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full mb-6">
                    <TabsTrigger value="details" className="flex-1">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex-1">
                      Logs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-8">
                    <div>
                      <div className="mb-4">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium border w-fit ${getStatusBadgeClass(item.status)}`}
                          >
                            {item.status}
                          </Badge>
                          {item.status.toLowerCase() === "snoozed" && item.snoozedUntil && (
                            <>
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-medium">{getTimeRemaining(item.snoozedUntil)}</span>
                              </div>
                            </>
                          )}
                          {item.status.toLowerCase() === "archived" && item.archivedUntil && (
                            <>
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-medium">{getTimeRemaining(item.archivedUntil)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Priority</div>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium ${
                              item.priority === "high"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : item.priority === "medium"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Effort</div>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            Low
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          {/* CHANGE: Updated label from "Potential Savings" to "POTENTIAL ANNUAL SAVINGS" */}
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            POTENTIAL ANNUAL SAVINGS
                          </div>
                          <div className="text-sm font-semibold text-green-600">{detailsData.savingsP3y}</div>
                        </div>
                        <div>
                          {/* CHANGE: For SaaS, show Account instead of Recommendation Name */}
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {dataSource === "saas" && item.account
                              ? "Account"
                              : item.subCategory &&
                              ["Financial", "Operations", "Security", "Adoption"].includes(
                                item.category || detailsData.category,
                              )
                              ? "Recommendation Name"
                              : "Resource Name"}
                          </div>
                          {dataSource === "saas" && item && item.account ? (
                            <button
                              onClick={() => item && item.account && handleAccountClick(item.account)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                            >
                              {item.account}
                            </button>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {item.subCategory &&
                              ["Financial", "Operations", "Security", "Adoption"].includes(
                                item.category || detailsData.category,
                              )
                                ? item.title
                                : detailsData.resourceName}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</div>
                          <div className="text-sm text-gray-900">{item.category || detailsData.category}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Sub-category
                          </div>
                          <div className="text-sm text-gray-900">{item.subCategory || "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Date Added
                          </div>
                          <div className="text-sm text-gray-900">{(item as any).createdDate || "-"}</div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* CHANGE: Moved Recommended Action section above Smart Tags */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Recommended Action</h3>
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{getActionDescription()}</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* CHANGE: Moved Impacted Accounts section above Smart Tags */}
                      {dataSource !== "saas" &&
                        item.subCategory &&
                        impactedAccounts.length > 0 &&
                        ["Financial", "Operations", "Security", "Adoption"].includes(
                          item.category || detailsData.category,
                        ) && (
                          <>
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900">Impacted Accounts</h3>
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                                >
                                  {filteredAccounts.length} Accounts
                                </Badge>
                              </div>

                              <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search account"
                                  value={accountSearchQuery}
                                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                />
                                {accountSearchQuery && (
                                  <button
                                    onClick={() => setAccountSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                {filteredAccounts.length === 0 ? (
                                  <div className="py-12 px-4 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                      <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">No accounts found</p>
                                    <p className="text-xs text-gray-500">
                                      Try adjusting your search to find what you're looking for
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="divide-y divide-gray-100">
                                      <div className="max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                                        {displayedAccounts.map((email, index) => (
                                          <button
                                            key={index}
                                            onClick={() => handleAccountClick(email)}
                                            className="w-full group flex items-center justify-between py-3 px-4 hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                                          >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                                {email.charAt(0).toUpperCase()}
                                              </div>
                                              <div className="flex-1 min-w-0 text-left">
                                                <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                  {email}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                  Active • Last sign-in: {Math.floor(Math.random() * 7) + 1}d ago
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex-shrink-0 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                                              <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M9 5l7 7-7 7"
                                                />
                                              </svg>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {filteredAccounts.length > 10 && (
                                      <div className="border-t border-gray-200 bg-gray-50">
                                        <button
                                          onClick={() => setShowAllAccounts(!showAllAccounts)}
                                          className="w-full py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150 flex items-center justify-center gap-2"
                                        >
                                          {showAllAccounts ? (
                                            <>
                                              <span>Show less</span>
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M5 15l7-7 7-7"
                                                />
                                              </svg>
                                            </>
                                          ) : (
                                            <>
                                              <span>Show {filteredAccounts.length - 10} more accounts</span>
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 9l-7 7-7-7"
                                                />
                                              </svg>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <Separator className="my-6" />
                          </>
                        )}

                      <div className="mt-6">
                        <div className="flex items-center gap-1 mb-3">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Smart Tags</div>
                          <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96" align="end" side="left" sideOffset={8}>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-gray-900">Manage Tags</h4>
                                  <Button variant="ghost" size="sm" onClick={handleCancelTags} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="space-y-2 pt-2">
                                  <div>
                                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                                      {smartTags.map((tag, index) => {
                                        const isNewlyAdded = addedTags.some(
                                          (t) => t.type === tag.type && t.value === tag.value,
                                        )

                                        return (
                                          <Badge
                                            key={`assigned-${tag.type}-${tag.value}-${index}`}
                                            variant="secondary"
                                            className={`text-xs font-normal px-2 py-0.5 h-6 ${
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
                                          <div className="relative overflow-hidden">
                                            <div
                                              className={`transition-all duration-300 ease-in-out ${
                                                showTagValues
                                                  ? "-translate-x-full opacity-0 absolute"
                                                  : "translate-x-0 opacity-100"
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
                                                showTagValues
                                                  ? "translate-x-0 opacity-100"
                                                  : "translate-x-full opacity-0 absolute"
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
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelTags}
                                    className="flex-1 h-9 text-xs bg-transparent"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveTags}
                                    className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {smartTags.map((tag, index) => (
                            <Badge
                              key={`${tag.type}-${tag.value}-${index}`}
                              variant="secondary"
                              className="text-xs font-normal bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              <span>
                                {tagTypeLabels[tag.type as keyof typeof tagTypeLabels]}: {tag.value}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {hasActivityLog && (
                        <>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Notes</h3>
                            <div className="space-y-3">
                              {activityLogEntries.map((entry) => (
                                <div key={entry.id} className="rounded-lg p-4 border bg-gray-50 border-gray-200">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {entry.type === "review" ? (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                                          {item.status.toLowerCase() === "snoozed" ? (
                                            <Clock className="h-3 w-3 text-gray-600" />
                                          ) : (
                                            <Flag className="h-3 w-3 text-gray-600" />
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                                          <Archive className="h-3 w-3 text-gray-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900">{entry.title}</h4>
                                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                          {entry.timestamp}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed mb-2">{entry.description}</p>
                                      {entry.timeRemaining && (
                                        <div className="text-xs text-gray-500 mb-2">
                                          <span className="font-medium">{entry.timeRemaining}</span>
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-500">
                                        <span>
                                          By: <span className="font-medium text-gray-700">{entry.owner}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="my-6" />
                        </>
                      )}

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Technical Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              External ID
                            </div>
                            <div className="text-sm text-gray-900">
                              {item.status.toLowerCase() === "actioned" ? (
                                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                                  SR{String(item.id).padStart(5, "0")}
                                </span>
                              ) : (
                                "-"
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Integration Plugin
                            </div>
                            <div className="text-sm text-gray-900">{detailsData.integrationPlugin}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="logs" className="space-y-4">
                    {logEntries.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-500">No logs available for this recommendation.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Activity History</span>
                        </div>

                        <div className="relative space-y-6">
                          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-200" />

                          {logEntries.map((log) => (
                            <div key={log.id} className="relative flex gap-4">
                              <div className="relative z-10 flex-shrink-0">
                                {log.type === "review" && (
                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                      item.status.toLowerCase() === "snoozed" ? "bg-purple-100" : "bg-yellow-100"
                                    }`}
                                  >
                                    {item.status.toLowerCase() === "snoozed" ? (
                                      <Clock className="h-3 w-3 text-purple-600" />
                                    ) : (
                                      <Flag className="h-3 w-3 text-yellow-600" />
                                    )}
                                  </div>
                                )}
                                {log.type === "archived" && (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                                    <Archive className="h-3 w-3 text-gray-600" />
                                  </div>
                                )}
                                {log.type === "sent" && (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                    <Send className="h-3 w-3 text-blue-600" />
                                  </div>
                                )}
                                {log.type === "status" && (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                                    <Clock className="h-3 w-3 text-amber-600" />
                                  </div>
                                )}
                                {log.type === "completed" && (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 pb-6">
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="text-sm font-semibold text-gray-900">{log.title}</h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                                  </div>
                                  {log.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed">{log.description}</p>
                                  )}
                                  {log.timeRemaining && (
                                    <div className="text-xs text-gray-500 mt-2">
                                      <span className="font-medium">{log.timeRemaining}</span>
                                    </div>
                                  )}
                                  {log.owner && (
                                    <div className="text-xs text-gray-500 mt-2">
                                      <span>
                                        By: <span className="font-medium text-gray-700">{log.owner}</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {item && item.status.toLowerCase() === "actioned" && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                              Connection Details
                            </h4>
                            <div className="space-y-1 text-sm text-blue-800">
                              <div className="flex justify-between">
                                <span className="text-blue-600">Organization:</span>
                                <span className="font-medium">contoso-cloud</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-600">Project:</span>
                                <span className="font-medium">Cloud Optimization</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-600">Work Item ID:</span>
                                <span className="font-medium">#4521</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* CHANGE: Only show footer for non-actioned items */}
            {item.status.toLowerCase() !== "actioned" && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="flex gap-2 justify-end">
                  {item.status.toLowerCase() === "archived" ? (
                    <>
                      <Button onClick={handleDelete} size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                      <Button onClick={handleRestore} variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Undo2 className="h-4 w-4" />
                        Restore
                      </Button>
                    </>
                  ) : item.status.toLowerCase() === "snoozed" ? (
                    <>
                      <Button
                        onClick={handleArchive}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 bg-transparent"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                      <Button
                        onClick={handleRestore}
                        size="sm"
                        className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Undo2 className="h-4 w-4" />
                        Restore
                      </Button>
                    </>
                  ) : item.status.toLowerCase() === "marked for review" ? (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                            More
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}} className="gap-2">
                            <Clock className="h-4 w-4" />
                            Snooze
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleArchive} className="gap-2">
                            <Archive className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button onClick={handleUnmark} variant="outline" size="sm" className="gap-2 bg-transparent">
                        <X className="h-4 w-4" />
                        Unmark item
                      </Button>
                      <Button
                        onClick={handleSendToIntegration}
                        size="sm"
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                        {dataSource === "saas" ? "Action recommendation" : "Send to integration"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                            More
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}} className="gap-2">
                            <Clock className="h-4 w-4" />
                            Snooze
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleArchive} className="gap-2">
                            <Archive className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        onClick={handleMarkForReview}
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                      >
                        <Flag className="h-4 w-4" />
                        Mark for review
                      </Button>
                      <Button
                        onClick={handleSendToIntegration}
                        size="sm"
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                        {dataSource === "saas" ? "Action recommendation" : "Send to integration"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onConfirmDelete?.(item.id)}
        itemTitle={item?.title || ""}
      />

      {/* Send to integration modal */}
      <SendToIntegrationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onConfirm={handleSendConfirm}
        selectedCount={1}
        selectedItems={getSelectedItemsData()}
        dataSource={dataSource} // Pass dataSource prop to modal
      />
    </>
  )
}
