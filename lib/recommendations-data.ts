// Simple seeded random number generator (Mulberry32)
function seededRandom(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const tagTypes = ["type1", "type2", "type3"] // Declare tagTypes variable

interface Recommendation {
  id: number
  title: string
  description: string
  savings: number
  savingsFormatted: string
  period: string
  provider: string
  status: string
  owner: string
  priority: string
  category: string
  subCategory?: string
  tagType: string
  tagValue: string
  easeToImplement: string
  createdDate: string
  actionedDate?: string // ISO date string for when item was actioned
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
  snoozedUntil?: string // ISO date string for when snooze expires
  archivedUntil?: string // ISO date string for when archive expires (9 months)
}

export const generateRecommendations = (): Recommendation[] => {
  const random = seededRandom(12345) // Fixed seed for consistent results

  const providers = [{ name: "Microsoft Azure" }, { name: "Amazon Web Services" }, { name: "Google Cloud Platform" }]

  const statuses = ["New", "Viewed", "Re-visit", "Archived", "Actioned", "Snoozed", "Marked for review"]
  const primaryStatuses = ["New", "Viewed", "Marked for review"]
  const secondaryStatuses = ["Re-visit", "Archived", "Actioned", "Snoozed"]

  const categories = [
    "Reserved Instances",
    "DEVUAT",
    "Hybrid Benefit",
    "Savings Plans",
    "VM Optimisation",
    "Zombies",
    "Storage",
    "Database",
  ]

  const categorySubCategories: Record<string, string[]> = {
    "Reserved Instances": ["Cosmos DB", "Reserved VM", "SQL", "Synapse", "VM Instances"],
    DEVUAT: ["Development", "UAT", "Testing", "Staging"],
    "Hybrid Benefit": ["Windows Server", "SQL Server", "Linux"],
    "Savings Plans": ["Compute", "EC2", "Lambda", "Fargate"],
    "VM Optimisation": ["Underutilized", "Oversized", "Idle", "Right-sizing"],
    Zombies: ["Unattached Disks", "Idle Resources", "Orphaned Snapshots", "Unused IPs"],
    Storage: ["Blob Storage", "Disk Storage", "Archive Storage", "Backup Storage"],
    Database: ["SQL Database", "CosmosDB", "PostgreSQL", "MySQL"],
  }

  const highValueCategories = new Set(["Reserved Instances", "VM Optimisation", "Savings Plans"])
  const lowValueCategories = new Set(["Database", "Storage", "Zombies", "DEVUAT"])
  const noHighPriorityCategories = new Set(["Storage", "Database", "Zombies"])
  // Hybrid Benefit will be medium-value (not in either set)

  const titles = [
    "Virtual Machine",
    "SQL Database Reserved Capacity",
    "CosmosDB Reserved Capacity",
    "Synapse Analytics Reserved Capacity",
    "Storage Reserved Capacity",
    "Archive Old Backup Data",
    "Compute Engine Instance",
    "RDS Database Instance",
    "S3 Storage Optimization",
    "Lambda Function Optimization",
    "App Service Plan",
    "Azure Functions Optimization",
    "Kubernetes Cluster",
    "Container Registry",
    "Load Balancer Configuration",
    "CDN Optimization",
    "API Gateway Configuration",
    "Data Lake Storage",
    "Blob Storage Tier Optimization",
    "Redis Cache Configuration",
  ]

  const services = [
    "gbl_produs_services",
    "gbl_prodexact_services",
    "gbl_analytics_services",
    "gbl_compute_services",
    "gbl_storage_services",
    "gbl_database_services",
    "gbl_network_services",
    "gbl_security_services",
  ]

  const owners = ["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]

  const archiveReasons = [
    "Resource is scheduled for decommissioning in Q2. Will revisit after infrastructure review.",
    "Current workload requirements don't align with this optimization. Team decided to maintain existing configuration for stability.",
    "Cost-benefit analysis shows minimal impact given current usage patterns. Archived for future consideration.",
    "Dependencies on legacy systems prevent implementation at this time. Will reassess after migration project completion.",
    "Business unit has different priorities this quarter. Recommendation archived pending budget review.",
    "Technical constraints identified during assessment. Requires architectural changes before implementation.",
    "Duplicate recommendation already being addressed through separate initiative. Archived to avoid redundancy.",
    "Resource utilization patterns have changed since recommendation was generated. No longer applicable.",
    "Compliance requirements prevent implementation of suggested changes. Archived pending policy review.",
    "Team capacity constraints. Archived for consideration in next planning cycle.",
  ]

  const reviewReasons = [
    "Needs further analysis on cost-benefit ratio before implementation.",
    "Waiting for approval from finance team to proceed with this optimization.",
    "Technical feasibility assessment required. Scheduling meeting with infrastructure team.",
    "Potential impact on production workloads needs to be evaluated in staging environment first.",
    "Dependencies on other projects need to be resolved before implementation.",
    "Requires coordination with security team for compliance review.",
    "Cost savings look promising but need to verify with current usage patterns.",
    "Implementation timeline conflicts with Q2 migration project. Revisit after completion.",
    "Resource allocation needs to be confirmed before proceeding with this recommendation.",
    "Business stakeholder review pending. Awaiting feedback on priority level.",
  ]

  const snoozeReasons = [
    "Postponing implementation until after Q1 budget review. Will reassess priority based on available funds.",
    "Waiting for completion of infrastructure upgrade project before proceeding with this optimization.",
    "Resource team is currently at capacity. Snoozed for 3 months until bandwidth becomes available.",
    "Dependencies on external vendor need to be resolved. Following up with vendor support team.",
    "Aligning with upcoming maintenance window scheduled for next quarter to minimize disruption.",
    "Pending approval from change advisory board. Will revisit after next CAB meeting.",
    "Coordinating with security team for compliance assessment. Snoozed pending their review.",
    "Waiting for completion of related optimization initiatives to avoid conflicts.",
    "Business unit requested delay due to current project priorities. Will reassess in 2 months.",
    "Technical prerequisites not yet met. Snoozed until prerequisite systems are updated.",
  ]

  const archiveReasonsExtended = [
    "Resource is scheduled for decommissioning in Q2. Will revisit after infrastructure review.",
    "Current workload requirements don't align with this optimization. Team decided to maintain existing configuration for stability.",
    "Cost-benefit analysis shows minimal impact given current usage patterns. Archived for future consideration.",
    "Dependencies on legacy systems prevent implementation at this time. Will reassess after migration project completion.",
    "Business unit has different priorities this quarter. Recommendation archived pending budget review.",
    "Technical constraints identified during assessment. Requires architectural changes before implementation.",
    "Duplicate recommendation already being addressed through separate initiative. Archived to avoid redundancy.",
    "Resource utilization patterns have changed since recommendation was generated. No longer applicable.",
    "Compliance requirements prevent implementation of suggested changes. Archived pending policy review.",
    "Team capacity constraints. Archived for consideration in next planning cycle.",
  ]

  const items: Recommendation[] = []
  let idCounter = 1

  categories.forEach((category) => {
    const categoryStartId = idCounter

    const isHighValue = highValueCategories.has(category)
    const isLowValue = lowValueCategories.has(category)
    const hasNoHighPriority = noHighPriorityCategories.has(category)

    let minHighPrimary, minMediumPrimary, minLowPrimary
    let extraHighPrimary, extraMediumPrimary, extraLowPrimary
    let extraHighSecondary, extraMediumSecondary, extraLowSecondary
    let highSavingsMin, highSavingsMax, mediumSavingsMin, mediumSavingsMax

    if (isHighValue) {
      minHighPrimary = 25 // was 15
      minMediumPrimary = 35 // was 20
      minLowPrimary = 25 // was 15
      extraHighPrimary = Math.floor(random() * 11) // 25-35 high priority (was 15-20)
      extraMediumPrimary = Math.floor(random() * 16) // 35-50 medium priority (was 20-30)
      extraLowPrimary = Math.floor(random() * 11) // 25-35 low priority (was 15-20)
      extraHighSecondary = Math.floor(random() * 8) // extra with other statuses
      extraMediumSecondary = Math.floor(random() * 12)
      extraLowSecondary = Math.floor(random() * 10)
      highSavingsMin = 20000
      highSavingsMax = 80000 // £20k-£100k for high priority
      mediumSavingsMin = 8000
      mediumSavingsMax = 12000 // £8k-£20k for medium priority
    } else if (isLowValue) {
      minHighPrimary = hasNoHighPriority ? 0 : 8 // was 5
      minMediumPrimary = 15 // was 8
      minLowPrimary = 15 // was 8
      extraHighPrimary = hasNoHighPriority ? 0 : Math.floor(random() * 7) // 0 or 8-14 high priority (was 5-8)
      extraMediumPrimary = Math.floor(random() * 10) // 15-24 medium priority (was 8-12)
      extraLowPrimary = Math.floor(random() * 13) // 15-27 low priority (was 8-15)
      extraHighSecondary = hasNoHighPriority ? 0 : Math.floor(random() * 5) // 0 or fewer extras with other statuses
      extraMediumSecondary = Math.floor(random() * 8)
      extraLowSecondary = Math.floor(random() * 10)
      highSavingsMin = 5000
      highSavingsMax = 3000 // £5k-£8k for high priority
      mediumSavingsMin = 2000
      mediumSavingsMax = 3000 // £2k-£5k for medium priority
    } else {
      minHighPrimary = 25 // was 15
      minMediumPrimary = 45 // was 30
      minLowPrimary = 30 // was 20
      extraHighPrimary = Math.floor(random() * 13) // 25-37 high priority (was 15-22)
      extraMediumPrimary = Math.floor(random() * 20) // 45-64 medium priority (was 30-41)
      extraLowPrimary = Math.floor(random() * 15) // 30-44 low priority (was 20-29)
      extraHighSecondary = Math.floor(random() * 12)
      extraMediumSecondary = Math.floor(random() * 18)
      extraLowSecondary = Math.floor(random() * 15)
      highSavingsMin = 10000
      highSavingsMax = 6000 // £10k-£16k for high priority
      mediumSavingsMin = 3000
      mediumSavingsMax = 7000 // £3k-£10k for medium priority
    }

    // Generate minimum + extra high priority items with New/Viewed status
    for (let i = 0; i < minHighPrimary + extraHighPrimary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = primaryStatuses[Math.floor(random() * primaryStatuses.length)]
      const title = titles[Math.floor(random() * titles.length)]
      const service = services[Math.floor(random() * services.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const savingsAmount = Math.floor(random() * highSavingsMax) + highSavingsMin
      const easeToImplement = "Easy"
      const period = random() > 0.5 ? "monthly saving" : "annual saving"

      const daysAgo = Math.floor(random() * 60)
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const formattedDate = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      const actionedDate =
        status === "Actioned"
          ? new Date(createdDate.getTime() + Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined

      const archiveNote =
        status === "Archived"
          ? {
              note: archiveReasons[Math.floor(random() * archiveReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      const reviewNote =
        status === "Marked for review"
          ? {
              note: reviewReasons[Math.floor(random() * reviewReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 14 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      items.push({
        id: idCounter++,
        title: `${title} #${idCounter - 1}`,
        description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "high",
        category,
        subCategory, // Added subCategory field
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote, // Added reviewNote field
        snoozedUntil: undefined,
        archivedUntil: undefined,
      })
    }

    // Generate minimum + extra medium priority items with New/Viewed status
    for (let i = 0; i < minMediumPrimary + extraMediumPrimary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = primaryStatuses[Math.floor(random() * primaryStatuses.length)]
      const title = titles[Math.floor(random() * titles.length)]
      const service = services[Math.floor(random() * services.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const savingsAmount = Math.floor(random() * mediumSavingsMax) + mediumSavingsMin
      const easeToImplement = random() > 0.5 ? "Medium" : "Easy"
      const period = random() > 0.5 ? "monthly saving" : "annual saving"

      const daysAgo = Math.floor(random() * 60)
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const formattedDate = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      const actionedDate =
        status === "Actioned"
          ? new Date(createdDate.getTime() + Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined

      const archiveNote =
        status === "Archived"
          ? {
              note: archiveReasons[Math.floor(random() * archiveReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      const reviewNote =
        status === "Marked for review"
          ? {
              note: reviewReasons[Math.floor(random() * reviewReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 14 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      items.push({
        id: idCounter++,
        title: `${title} #${idCounter - 1}`,
        description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "medium",
        category,
        subCategory, // Added subCategory field
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote, // Added reviewNote field
        snoozedUntil: undefined,
        archivedUntil: undefined,
      })
    }

    // Generate minimum + extra low priority items with New/Viewed status
    for (let i = 0; i < minLowPrimary + extraLowPrimary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = primaryStatuses[Math.floor(random() * primaryStatuses.length)]
      const title = titles[Math.floor(random() * titles.length)]
      const service = services[Math.floor(random() * services.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const savingsAmount = Math.floor(random() * 2800) + 200
      const easeToImplement = random() > 0.5 ? "Hard" : "Medium"
      const period = random() > 0.5 ? "monthly saving" : "annual saving"

      const daysAgo = Math.floor(random() * 60)
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const formattedDate = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      const actionedDate =
        status === "Actioned"
          ? new Date(createdDate.getTime() + Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined

      const archiveNote =
        status === "Archived"
          ? {
              note: archiveReasons[Math.floor(random() * archiveReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      const reviewNote =
        status === "Marked for review"
          ? {
              note: reviewReasons[Math.floor(random() * reviewReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 14 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      items.push({
        id: idCounter++,
        title: `${title} #${idCounter - 1}`,
        description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "low",
        category,
        subCategory, // Added subCategory field
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote, // Added reviewNote field
        snoozedUntil: undefined,
        archivedUntil: undefined,
      })
    }

    // Additional high priority items with secondary statuses
    for (let i = 0; i < extraHighSecondary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = secondaryStatuses[Math.floor(random() * secondaryStatuses.length)]
      const title = titles[Math.floor(random() * titles.length)]
      const service = services[Math.floor(random() * services.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const savingsAmount = Math.floor(random() * highSavingsMax) + highSavingsMin
      const easeToImplement = "Easy"
      const period = random() > 0.5 ? "monthly saving" : "annual saving"

      const daysAgo = Math.floor(random() * 60)
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const formattedDate = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      const actionedDate =
        status === "Actioned"
          ? new Date(createdDate.getTime() + Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined

      const archiveNote =
        status === "Archived"
          ? {
              note: archiveReasons[Math.floor(random() * archiveReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      const reviewNote =
        status === "Marked for review"
          ? {
              note: reviewReasons[Math.floor(random() * reviewReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 14 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      items.push({
        id: idCounter++,
        title: `${title} #${idCounter - 1}`,
        description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "high",
        category,
        subCategory, // Added subCategory field
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote, // Added reviewNote field
        snoozedUntil: undefined,
        archivedUntil: undefined,
      })
    }

    // Additional medium priority items with secondary statuses
    for (let i = 0; i < extraMediumSecondary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = secondaryStatuses[Math.floor(random() * secondaryStatuses.length)]
      const title = titles[Math.floor(random() * titles.length)]
      const service = services[Math.floor(random() * services.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const savingsAmount = Math.floor(random() * mediumSavingsMax) + mediumSavingsMin
      const easeToImplement = random() > 0.5 ? "Medium" : "Easy"
      const period = random() > 0.5 ? "monthly saving" : "annual saving"

      const daysAgo = Math.floor(random() * 60)
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const formattedDate = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      const actionedDate =
        status === "Actioned"
          ? new Date(createdDate.getTime() + Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined

      const archiveNote =
        status === "Archived"
          ? {
              note: archiveReasons[Math.floor(random() * archiveReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      const reviewNote =
        status === "Marked for review"
          ? {
              note: reviewReasons[Math.floor(random() * reviewReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 14 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      items.push({
        id: idCounter++,
        title: `${title} #${idCounter - 1}`,
        description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "medium",
        category,
        subCategory, // Added subCategory field
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote, // Added reviewNote field
        snoozedUntil: undefined,
        archivedUntil: undefined,
      })
    }

    // Additional low priority items with secondary statuses
    for (let i = 0; i < extraLowSecondary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = secondaryStatuses[Math.floor(random() * secondaryStatuses.length)]
      const title = titles[Math.floor(random() * titles.length)]
      const service = services[Math.floor(random() * services.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const savingsAmount = Math.floor(random() * 2800) + 200
      const easeToImplement = random() > 0.5 ? "Hard" : "Medium"
      const period = random() > 0.5 ? "monthly saving" : "annual saving"

      const daysAgo = Math.floor(random() * 60)
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const formattedDate = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      const actionedDate =
        status === "Actioned"
          ? new Date(createdDate.getTime() + Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined

      const archiveNote =
        status === "Archived"
          ? {
              note: archiveReasons[Math.floor(random() * archiveReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      const reviewNote =
        status === "Marked for review"
          ? {
              note: reviewReasons[Math.floor(random() * reviewReasons.length)],
              owner: owners[Math.floor(random() * owners.length)],
              timestamp: new Date(Date.now() - Math.floor(random() * 14 * 24 * 60 * 60 * 1000)).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                },
              ),
            }
          : undefined

      items.push({
        id: idCounter++,
        title: `${title} #${idCounter - 1}`,
        description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "low",
        category,
        subCategory, // Added subCategory field
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote, // Added reviewNote field
        snoozedUntil: undefined,
        archivedUntil: undefined,
      })
    }

    const categoryEndId = idCounter
    const categoryItemCount = categoryEndId - categoryStartId
    console.log(`[v0] Generated ${categoryItemCount} recommendations for category: ${category}`)
  })

  // Generate 10 snoozed recommendations across different categories and priorities
  const snoozedCategories = ["Reserved Instances", "VM Optimisation", "Hybrid Benefit", "Savings Plans"]
  for (let i = 0; i < 10; i++) {
    const category = snoozedCategories[i % snoozedCategories.length]
    const provider = providers[Math.floor(random() * providers.length)]
    const title = titles[Math.floor(random() * titles.length)]
    const service = services[Math.floor(random() * services.length)]
    const owner = owners[Math.floor(random() * owners.length)]
    const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
    const tagValue = random() > 0.5 ? "value1" : "value2"
    const priority = i < 3 ? "high" : i < 7 ? "medium" : "low"

    const subCategories = categorySubCategories[category]
    const subCategory =
      subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

    const savingsAmount =
      priority === "high"
        ? Math.floor(random() * 60000) + 20000
        : priority === "medium"
          ? Math.floor(random() * 12000) + 8000
          : Math.floor(random() * 2800) + 200

    const easeToImplement = priority === "high" ? "Easy" : priority === "medium" ? "Medium" : "Hard"
    const period = random() > 0.5 ? "monthly saving" : "annual saving"

    const daysAgo = Math.floor(random() * 60)
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const formattedDate = createdDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    // Set snooze expiration dates - some expired (should show as Re-visit), some still active
    const monthsToSnooze = Math.floor(random() * 6) + 1 // 1-6 months
    const daysToSnooze = monthsToSnooze * 30 + Math.floor(random() * 15) // Add some variation
    const snoozedUntil = new Date(Date.now() + daysToSnooze * 24 * 60 * 60 * 1000).toISOString()

    const snoozeNote = {
      note: snoozeReasons[Math.floor(random() * snoozeReasons.length)],
      owner: owners[Math.floor(random() * owners.length)],
      timestamp: new Date(Date.now() - Math.floor(random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }

    items.push({
      id: idCounter++,
      title: `${title} #${idCounter - 1}`,
      description: `${service}${random() > 0.7 ? ` • SR${String(idCounter - 1).padStart(6, "0")}` : ""}`,
      savings: savingsAmount,
      savingsFormatted: `£${savingsAmount.toLocaleString()}`,
      period,
      provider: provider.name,
      status: "Snoozed",
      owner,
      priority,
      category,
      subCategory,
      tagType,
      tagValue,
      easeToImplement,
      createdDate: formattedDate,
      archiveNote: undefined,
      reviewNote: snoozeNote as any, // Using reviewNote field to store snooze note
      snoozedUntil,
      archivedUntil: undefined,
    })
  }

  const snoozedItems = items.filter((item) => item.status === "Snoozed")
  console.log(`[v0] Generated ${snoozedItems.length} snoozed recommendations`)
  snoozedItems.forEach((item) => {
    console.log(
      `[v0] Snoozed item ${item.id}: has snoozedUntil=${!!item.snoozedUntil}, has reviewNote=${!!item.reviewNote}`,
    )
  })

  items.forEach((item) => {
    if (item.status === "Snoozed") {
      // Add snoozedUntil date if missing (1-6 months from now with variation)
      if (!item.snoozedUntil) {
        const monthsToSnooze = Math.floor(random() * 6) + 1 // 1-6 months
        const daysToSnooze = monthsToSnooze * 30 + Math.floor(random() * 15) // Add some variation
        item.snoozedUntil = new Date(Date.now() + daysToSnooze * 24 * 60 * 60 * 1000).toISOString()
      }

      // Add snooze note if missing (using reviewNote field)
      if (!item.reviewNote) {
        item.reviewNote = {
          note: snoozeReasons[Math.floor(random() * snoozeReasons.length)],
          owner: owners[Math.floor(random() * owners.length)],
          timestamp: new Date(Date.now() - Math.floor(random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        }
      }
    }
  })

  // Log final snoozed items count after adding missing data
  const finalSnoozedItems = items.filter((item) => item.status === "Snoozed")
  console.log(`[v0] Final snoozed items count: ${finalSnoozedItems.length}`)
  finalSnoozedItems.forEach((item) => {
    console.log(
      `[v0] Final snoozed item ${item.id}: has snoozedUntil=${!!item.snoozedUntil}, has reviewNote=${!!item.reviewNote}`,
    )
  })

  items.forEach((item) => {
    if (item.status === "Archived") {
      const daysArchived = Math.floor(random() * (9 * 30)) // 0-270 days (up to 9 months)
      item.archivedUntil = new Date(Date.now() + daysArchived * 24 * 60 * 60 * 1000).toISOString()
    }
  })

  items.forEach((item) => {
    if (item.status === "Archived" && item.archivedUntil) {
      const now = new Date()
      const expirationDate = new Date(item.archivedUntil)

      // If the archive period has expired, change status to Re-visit
      if (expirationDate.getTime() <= now.getTime()) {
        item.status = "Re-visit"
        console.log(`[v0] Archived item ${item.id} expired, transitioning to Re-visit status`)
      }
    }
  })

  const categoryActionedCounts: Record<string, number> = {
    "Hybrid Benefit": 20,
    "Reserved Instances": 20,
    DEVUAT: 20,
    "Savings Plans": 20,
    "VM Optimisation": 5,
    Zombies: 5,
    Storage: 5,
    Database: 5,
  }

  console.log("[v0] Converting medium priority recommendations to Actioned status...")

  Object.entries(categoryActionedCounts).forEach(([category, count]) => {
    // Find medium priority items for this category that are not already Snoozed or Archived
    const mediumPriorityItems = items.filter(
      (item) =>
        item.category === category &&
        item.priority === "medium" &&
        item.status !== "Snoozed" &&
        item.status !== "Archived" &&
        item.status !== "Actioned",
    )

    // Select the specified number of items to convert
    const itemsToConvert = mediumPriorityItems.slice(0, count)

    console.log(
      `[v0] ${category}: Converting ${itemsToConvert.length} of ${mediumPriorityItems.length} medium priority items to Actioned`,
    )

    // Convert selected items to Actioned status
    itemsToConvert.forEach((item) => {
      item.status = "Actioned"
      // Set actionedDate to a random date within the last 90 days
      const daysAgo = Math.floor(random() * 90)
      item.actionedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

      console.log(
        `[v0]   - Item ${item.id} (${item.title}): ${item.priority} priority, £${item.savings.toLocaleString()} savings → Actioned`,
      )
    })
  })

  const totalActionedItems = items.filter((item) => item.status === "Actioned")
  console.log(`[v0] Total Actioned items after conversion: ${totalActionedItems.length}`)

  return items
}

// Generate once and export
export const allRecommendations = generateRecommendations()

// Calculate totals
export const calculateTotals = (selectedStatuses?: Set<string>) => {
  const filteredRecommendations =
    selectedStatuses && selectedStatuses.size > 0
      ? allRecommendations.filter((item) => selectedStatuses.has(item.status))
      : allRecommendations

  const totalSavings = filteredRecommendations.reduce((sum, item) => sum + item.savings, 0)
  const actionedItems = filteredRecommendations.filter((item) => item.status === "Actioned")
  const actionedSavings = actionedItems.reduce((sum, item) => sum + item.savings, 0)

  // Calculate category savings
  const categorySavings: Record<string, number> = {}
  filteredRecommendations.forEach((item) => {
    if (!categorySavings[item.category]) {
      categorySavings[item.category] = 0
    }
    categorySavings[item.category] += item.savings
  })

  return {
    totalSavings,
    totalCount: filteredRecommendations.length,
    actionedSavings,
    actionedCount: actionedItems.length,
    categorySavings,
  }
}

export const calculateUnfilteredTotals = () => {
  const totalSavings = allRecommendations.reduce((sum, item) => sum + item.savings, 0)
  const totalCount = allRecommendations.length
  const actionedItems = allRecommendations.filter((item) => item.status === "Actioned")
  const actionedSavings = actionedItems.reduce((sum, item) => sum + item.savings, 0)
  const actionedCount = actionedItems.length

  return {
    totalSavings,
    totalCount,
    actionedSavings,
    actionedCount,
  }
}

export const calculatePriorities = () => {
  const priorityMap = new Map<number, string>()

  allRecommendations.forEach((item) => {
    // Use the priority that was set during generation
    priorityMap.set(item.id, item.priority)
  })

  return priorityMap
}

export const priorityMap = calculatePriorities()

export const getHighPriorityCountByCategory = (categoryTitle: string, selectedStatuses?: Set<string>) => {
  const categoryItems = allRecommendations.filter((item) => item.category === categoryTitle)
  const highPriorityItems = categoryItems.filter((item) => {
    const calculatedPriority = priorityMap.get(item.id)
    if (selectedStatuses && selectedStatuses.size > 0) {
      return calculatedPriority === "high" && selectedStatuses.has(item.status)
    }
    return calculatedPriority === "high"
  })

  return highPriorityItems.length
}
