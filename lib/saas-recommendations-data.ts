// Simple seeded random number generator (Mulberry32)
function seededRandom(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const tagTypes = ["type1", "type2", "type3"]

interface SaaSRecommendation {
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
  actionedDate?: string
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
  snoozedUntil?: string
  archivedUntil?: string // ISO date string for when archive expires (9 months)
}

export const generateSaaSRecommendations = (): SaaSRecommendation[] => {
  const random = seededRandom(54321) // Different seed from cloud data

  const providers = [
    { name: "Microsoft 365" },
    { name: "Salesforce" },
    { name: "Adobe" },
    { name: "Slack" },
    { name: "Zoom" },
  ]

  const statuses = ["New", "Viewed", "Re-visit", "Archived", "Actioned", "Snoozed", "Marked for review"]
  const primaryStatuses = ["New", "Viewed", "Marked for review"]
  const secondaryStatuses = ["Re-visit", "Archived", "Actioned", "Snoozed"]

  // New SaaS category structure
  const categories = ["Financial", "Operations", "Security", "Adoption"]

  const categorySubCategories: Record<string, string[]> = {
    Financial: ["Over-subscribed", "Zombie", "Downgrade", "Recategorize"],
    Operations: ["AD Hygiene", "Device Lifecycle", "License Hygiene"],
    Security: ["Identity", "Compliance"],
    Adoption: ["Copilot", "Feature Adoption"],
  }

  const highValueCategories = new Set(["Financial", "Operations"])
  const lowValueCategories = new Set(["Security", "Adoption"])

  const titles = [
    "Microsoft 365 License",
    "Salesforce User License",
    "Adobe Creative Cloud",
    "Slack Workspace",
    "Zoom Meeting License",
    "SharePoint Site",
    "Teams Channel",
    "OneDrive Storage",
    "Exchange Mailbox",
    "Power BI License",
    "Dynamics 365 License",
    "Azure AD Premium",
    "Intune Device License",
    "Office 365 E3",
    "Office 365 E5",
    "Microsoft Copilot",
    "Salesforce Platform",
    "Adobe Acrobat Pro",
    "Slack Enterprise",
    "Zoom Phone",
  ]

  const services = [
    "gbl_m365_services",
    "gbl_salesforce_services",
    "gbl_adobe_services",
    "gbl_collaboration_services",
    "gbl_productivity_services",
    "gbl_security_services",
    "gbl_identity_services",
    "gbl_device_services",
  ]

  const owners = ["Chris Taylor", "John Smith", "Rachel Green", "Alex Wilson", "Jessica Lee"]

  const archiveReasons = [
    "License is scheduled for review in Q2. Will revisit after budget planning.",
    "User requirements don't align with this optimization. Team decided to maintain current licenses.",
    "Cost-benefit analysis shows minimal impact. Archived for future consideration.",
    "Dependencies on existing workflows prevent changes. Will reassess after process review.",
    "Business unit has different priorities. Archived pending stakeholder approval.",
    "Technical constraints identified. Requires policy changes before implementation.",
    "Duplicate recommendation already addressed. Archived to avoid redundancy.",
    "Usage patterns have changed. No longer applicable.",
    "Compliance requirements prevent changes. Archived pending policy review.",
    "Team capacity constraints. Archived for next planning cycle.",
  ]

  const reviewReasons = [
    "Needs further analysis on license utilization before optimization.",
    "Waiting for approval from IT governance to proceed.",
    "User impact assessment required before making changes.",
    "Potential productivity impact needs evaluation.",
    "Dependencies on other licenses need resolution.",
    "Requires coordination with security team for compliance.",
    "Cost savings look promising but need usage verification.",
    "Implementation conflicts with migration project.",
    "Resource allocation needs confirmation.",
    "Business stakeholder review pending.",
  ]

  const snoozeReasons = [
    "Postponing until after Q1 license renewal cycle.",
    "Waiting for completion of M365 migration project.",
    "User onboarding in progress. Will reassess in 3 months.",
    "Dependencies on vendor need resolution.",
    "Aligning with annual license true-up process.",
    "Pending approval from change advisory board.",
    "Coordinating with security team for assessment.",
    "Waiting for related optimization initiatives.",
    "Business unit requested delay due to priorities.",
    "Technical prerequisites not yet met.",
  ]

  const recommendationNames: Record<string, Record<string, string[]>> = {
    Financial: {
      "Over-subscribed": [
        "Excess Licenses",
        "Over-allocated User Licenses",
        "Unused Premium Features",
        "Redundant Subscription Tiers",
      ],
      Zombie: [
        "Active User (member) with a product that was never used",
        "Active User (member) with a Product with Inactive Usage",
        "Zombie Account - Enabled (member) account, inactive, with licenses",
        "Inactive User with Active Licenses",
        "Dormant Account with Premium Access",
      ],
      Downgrade: [
        "Downgrade from Project P5 or P3 to Project P1",
        "Downgrade from E5 to E3 License",
        "Reduce Premium to Standard Tier",
        "Downgrade Enterprise to Business Plan",
      ],
      Recategorize: [
        "Recategorize M365 E-class licenses to F-class licenses",
        "Recategorize M365 E5 licenses to E3 licenses",
        "Recategorize M365 E3 licenses to F3 licenses",
        "Recategorize Office 365 E-class to appropriate tier",
      ],
    },
    Operations: {
      "AD Hygiene": [
        "Stale User Accounts in Active Directory",
        "Orphaned AD Objects",
        "Duplicate User Entries",
        "Inactive Service Accounts",
      ],
      "Device Lifecycle": [
        "End-of-Life Device with Active License",
        "Retired Device with Assigned Licenses",
        "Decommissioned Hardware with Active Subscriptions",
      ],
      "License Hygiene": [
        "Mismatched License Assignments",
        "Duplicate License Allocations",
        "Incorrect License Type Assignment",
      ],
    },
    Security: {
      Identity: [
        "User with Excessive Permissions",
        "Privileged Account without MFA",
        "Guest User with Admin Access",
        "Shared Account Credentials",
      ],
      Compliance: [
        "Non-compliant License Usage",
        "Unlicensed Software Installation",
        "Policy Violation - Unauthorized Access",
      ],
    },
    Adoption: {
      Copilot: [
        "Copilot License with Zero Usage",
        "Underutilized Copilot Features",
        "Copilot Assigned to Non-active User",
      ],
      "Feature Adoption": [
        "Premium Feature Never Accessed",
        "Advanced Tools with Low Utilization",
        "Paid Add-on with No Usage",
      ],
    },
  }

  const recommendedActions: Record<string, Record<string, string[]>> = {
    Financial: {
      "Over-subscribed": [
        "Reduce license quantities by removing unused allocations",
        "Review and remove excess licenses from inactive users",
        "Consolidate duplicate license assignments",
        "Optimize subscription tier based on actual usage",
      ],
      Zombie: [
        "Remove license(s) from inactive user accounts",
        "Disable and archive dormant accounts",
        "Review and remove licenses from users with zero activity",
        "Deactivate zombie accounts and reallocate licenses",
      ],
      Downgrade: [
        "Downgrade the 'Project Online' license from P5 to P1",
        "Reduce Microsoft 365 license from E5 to E3",
        "Downgrade premium tier to standard for low-usage users",
        "Switch from Enterprise to Business plan for appropriate users",
      ],
      Recategorize: [
        "Review and reclassify user having E-type license to F3 license, estimated savings: 77.36%",
        "Review and reclassify user having E5 license to E3 license, estimated savings: 45.20%",
        "Review and reclassify user having E3 license to F3 license, estimated savings: 62.15%",
        "Review and reclassify user having E-class license to appropriate tier, estimated savings: 55.80%",
      ],
    },
    Operations: {
      "AD Hygiene": [
        "Clean up stale Active Directory accounts",
        "Remove orphaned AD objects from directory",
        "Merge duplicate user entries",
        "Disable inactive service accounts",
      ],
      "Device Lifecycle": [
        "Remove licenses from decommissioned devices",
        "Unassign subscriptions from retired hardware",
        "Update device inventory and remove obsolete entries",
      ],
      "License Hygiene": [
        "Correct mismatched license assignments",
        "Remove duplicate license allocations",
        "Reassign appropriate license types to users",
      ],
    },
    Security: {
      Identity: [
        "Review and reduce excessive user permissions",
        "Enable MFA for privileged accounts",
        "Remove or restrict guest user admin access",
        "Separate shared account credentials",
      ],
      Compliance: [
        "Remediate non-compliant license usage",
        "License or remove unauthorized software",
        "Revoke unauthorized access and enforce policies",
      ],
    },
    Adoption: {
      Copilot: [
        "Remove Copilot license from non-active users",
        "Provide training to increase Copilot utilization",
        "Reassign Copilot licenses to active users",
      ],
      "Feature Adoption": [
        "Remove premium features from non-users",
        "Downgrade users with low advanced tool utilization",
        "Cancel paid add-ons with zero usage",
      ],
    },
  }

  const items: SaaSRecommendation[] = []
  let idCounter = 1

  categories.forEach((category) => {
    const categoryStartId = idCounter

    const isHighValue = highValueCategories.has(category)
    const isLowValue = lowValueCategories.has(category)

    let minHighPrimary, minMediumPrimary, minLowPrimary
    let extraHighPrimary, extraMediumPrimary, extraLowPrimary
    let extraHighSecondary, extraMediumSecondary, extraLowSecondary
    let highSavingsMin, highSavingsMax, mediumSavingsMin, mediumSavingsMax

    if (isHighValue) {
      // Financial and Operations: ~13,000 items each
      minHighPrimary = 3800
      minMediumPrimary = 5200
      minLowPrimary = 3200
      extraHighPrimary = Math.floor(random() * 400)
      extraMediumPrimary = Math.floor(random() * 500)
      extraLowPrimary = Math.floor(random() * 400)
      extraHighSecondary = Math.floor(random() * 200)
      extraMediumSecondary = Math.floor(random() * 300)
      extraLowSecondary = Math.floor(random() * 200)
      highSavingsMin = 15000
      highSavingsMax = 60000
      mediumSavingsMin = 6000
      mediumSavingsMax = 9000
    } else if (isLowValue) {
      // Security and Adoption: ~12,000 items each
      minHighPrimary = 3600
      minMediumPrimary = 4800
      minLowPrimary = 3000
      extraHighPrimary = Math.floor(random() * 400)
      extraMediumPrimary = Math.floor(random() * 500)
      extraLowPrimary = Math.floor(random() * 400)
      extraHighSecondary = Math.floor(random() * 200)
      extraMediumSecondary = Math.floor(random() * 300)
      extraLowSecondary = Math.floor(random() * 200)
      highSavingsMin = 4000
      highSavingsMax = 2000
      mediumSavingsMin = 1500
      mediumSavingsMax = 2500
    } else {
      minHighPrimary = 3700
      minMediumPrimary = 5000
      minLowPrimary = 3100
      extraHighPrimary = Math.floor(random() * 400)
      extraMediumPrimary = Math.floor(random() * 500)
      extraLowPrimary = Math.floor(random() * 400)
      extraHighSecondary = Math.floor(random() * 200)
      extraMediumSecondary = Math.floor(random() * 300)
      extraLowSecondary = Math.floor(random() * 200)
      highSavingsMin = 8000
      highSavingsMax = 4000
      mediumSavingsMin = 2500
      mediumSavingsMax = 5500
    }

    // Generate high priority items with primary statuses
    for (let i = 0; i < minHighPrimary + extraHighPrimary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = primaryStatuses[Math.floor(random() * primaryStatuses.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const recNames = subCategory ? recommendationNames[category]?.[subCategory] : undefined
      const title = recNames
        ? recNames[Math.floor(random() * recNames.length)]
        : titles[Math.floor(random() * titles.length)]

      const actions = subCategory ? recommendedActions[category]?.[subCategory] : undefined
      const description = actions
        ? actions[Math.floor(random() * actions.length)]
        : `${services[Math.floor(random() * services.length)]}${random() > 0.7 ? ` • SR${String(idCounter).padStart(6, "0")}` : ""}`

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

      const archivedUntil =
        status === "Archived" ? new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined

      items.push({
        id: idCounter++,
        title,
        description,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "high",
        category,
        subCategory,
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote,
        snoozedUntil: undefined,
        archivedUntil,
      })
    }

    // Generate medium priority items
    for (let i = 0; i < minMediumPrimary + extraMediumPrimary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = primaryStatuses[Math.floor(random() * primaryStatuses.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const recNames = subCategory ? recommendationNames[category]?.[subCategory] : undefined
      const title = recNames
        ? recNames[Math.floor(random() * recNames.length)]
        : titles[Math.floor(random() * titles.length)]

      const actions = subCategory ? recommendedActions[category]?.[subCategory] : undefined
      const description = actions
        ? actions[Math.floor(random() * actions.length)]
        : `${services[Math.floor(random() * services.length)]}${random() > 0.7 ? ` • SR${String(idCounter).padStart(6, "0")}` : ""}`

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

      const archivedUntil =
        status === "Archived" ? new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined

      items.push({
        id: idCounter++,
        title,
        description,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "medium",
        category,
        subCategory,
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote,
        snoozedUntil: undefined,
        archivedUntil,
      })
    }

    // Generate low priority items
    for (let i = 0; i < minLowPrimary + extraLowPrimary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = primaryStatuses[Math.floor(random() * primaryStatuses.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const recNames = subCategory ? recommendationNames[category]?.[subCategory] : undefined
      const title = recNames
        ? recNames[Math.floor(random() * recNames.length)]
        : titles[Math.floor(random() * titles.length)]

      const actions = subCategory ? recommendedActions[category]?.[subCategory] : undefined
      const description = actions
        ? actions[Math.floor(random() * actions.length)]
        : `${services[Math.floor(random() * services.length)]}${random() > 0.7 ? ` • SR${String(idCounter).padStart(6, "0")}` : ""}`

      const savingsAmount = Math.floor(random() * 2500) + 200
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

      const archivedUntil =
        status === "Archived" ? new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined

      items.push({
        id: idCounter++,
        title,
        description,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "low",
        category,
        subCategory,
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote,
        snoozedUntil: undefined,
        archivedUntil,
      })
    }

    // Add secondary status items (similar pattern for high, medium, low)
    for (let i = 0; i < extraHighSecondary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = secondaryStatuses[Math.floor(random() * secondaryStatuses.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const recNames = subCategory ? recommendationNames[category]?.[subCategory] : undefined
      const title = recNames
        ? recNames[Math.floor(random() * recNames.length)]
        : titles[Math.floor(random() * titles.length)]

      const actions = subCategory ? recommendedActions[category]?.[subCategory] : undefined
      const description = actions
        ? actions[Math.floor(random() * actions.length)]
        : `${services[Math.floor(random() * services.length)]}${random() > 0.7 ? ` • SR${String(idCounter).padStart(6, "0")}` : ""}`

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

      const archivedUntil =
        status === "Archived" ? new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined

      items.push({
        id: idCounter++,
        title,
        description,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "high",
        category,
        subCategory,
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote,
        snoozedUntil: undefined,
        archivedUntil,
      })
    }

    for (let i = 0; i < extraMediumSecondary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = secondaryStatuses[Math.floor(random() * secondaryStatuses.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const recNames = subCategory ? recommendationNames[category]?.[subCategory] : undefined
      const title = recNames
        ? recNames[Math.floor(random() * recNames.length)]
        : titles[Math.floor(random() * titles.length)]

      const actions = subCategory ? recommendedActions[category]?.[subCategory] : undefined
      const description = actions
        ? actions[Math.floor(random() * actions.length)]
        : `${services[Math.floor(random() * services.length)]}${random() > 0.7 ? ` • SR${String(idCounter).padStart(6, "0")}` : ""}`

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

      const archivedUntil =
        status === "Archived" ? new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined

      items.push({
        id: idCounter++,
        title,
        description,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "medium",
        category,
        subCategory,
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote,
        snoozedUntil: undefined,
        archivedUntil,
      })
    }

    for (let i = 0; i < extraLowSecondary; i++) {
      const provider = providers[Math.floor(random() * providers.length)]
      const status = secondaryStatuses[Math.floor(random() * secondaryStatuses.length)]
      const owner = owners[Math.floor(random() * owners.length)]
      const tagType = tagTypes[Math.floor(random() * tagTypes.length)]
      const tagValue = random() > 0.5 ? "value1" : "value2"

      const subCategories = categorySubCategories[category]
      const subCategory =
        subCategories.length > 0 ? subCategories[Math.floor(random() * subCategories.length)] : undefined

      const recNames = subCategory ? recommendationNames[category]?.[subCategory] : undefined
      const title = recNames
        ? recNames[Math.floor(random() * recNames.length)]
        : titles[Math.floor(random() * titles.length)]

      const actions = subCategory ? recommendedActions[category]?.[subCategory] : undefined
      const description = actions
        ? actions[Math.floor(random() * actions.length)]
        : `${services[Math.floor(random() * services.length)]}${random() > 0.7 ? ` • SR${String(idCounter).padStart(6, "0")}` : ""}`

      const savingsAmount = Math.floor(random() * 2500) + 200
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

      const archivedUntil =
        status === "Archived" ? new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined

      items.push({
        id: idCounter++,
        title,
        description,
        savings: savingsAmount,
        savingsFormatted: `£${savingsAmount.toLocaleString()}`,
        period,
        provider: provider.name,
        status,
        owner,
        priority: "low",
        category,
        subCategory,
        tagType,
        tagValue,
        easeToImplement,
        createdDate: formattedDate,
        actionedDate,
        archiveNote,
        reviewNote,
        snoozedUntil: undefined,
        archivedUntil,
      })
    }

    const categoryEndId = idCounter
    const categoryItemCount = categoryEndId - categoryStartId
    console.log(`[v0] Generated ${categoryItemCount} SaaS recommendations for category: ${category}`)
  })

  items.forEach((item) => {
    if (item.status === "Archived" && item.archivedUntil) {
      const now = new Date()
      const expirationDate = new Date(item.archivedUntil)

      // If the archive period has expired, change status to Re-visit
      if (expirationDate.getTime() <= now.getTime()) {
        item.status = "Re-visit"
        console.log(`[v0] Archived SaaS item ${item.id} expired, transitioning to Re-visit status`)
      }
    }
  })

  items.forEach((item) => {
    if (item.status === "Archived" && !item.archivedUntil) {
      const daysArchived = Math.floor(random() * (9 * 30)) // 0-270 days (up to 9 months)
      item.archivedUntil = new Date(Date.now() + daysArchived * 24 * 60 * 60 * 1000).toISOString()
      console.log(`[v0] Added archivedUntil date to SaaS item ${item.id}`)
    }
  })

  const categoryActionedCounts: Record<string, number> = {
    Financial: 2000,
    Operations: 2000,
    Security: 800,
    Adoption: 800,
  }

  console.log("[v0] Converting medium priority SaaS recommendations to Actioned status...")

  Object.entries(categoryActionedCounts).forEach(([category, count]) => {
    const mediumPriorityItems = items.filter(
      (item) =>
        item.category === category &&
        item.priority === "medium" &&
        item.status !== "Snoozed" &&
        item.status !== "Archived" &&
        item.status !== "Actioned",
    )

    const itemsToConvert = mediumPriorityItems.slice(0, count)

    console.log(
      `[v0] ${category}: Converting ${itemsToConvert.length} of ${mediumPriorityItems.length} medium priority items to Actioned`,
    )

    itemsToConvert.forEach((item) => {
      item.status = "Actioned"
      const daysAgo = Math.floor(random() * 90)
      item.actionedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    })
  })

  console.log(`[v0] Total SaaS recommendations generated: ${items.length}`)

  return items
}

export const allSaaSRecommendations = generateSaaSRecommendations()

// Export as allRecommendations for compatibility
export const allRecommendations = allSaaSRecommendations

export const calculateSaaSTotals = (selectedStatuses?: Set<string>) => {
  const filteredRecommendations =
    selectedStatuses && selectedStatuses.size > 0
      ? allSaaSRecommendations.filter((item) => selectedStatuses.has(item.status))
      : allSaaSRecommendations

  const totalSavings = filteredRecommendations.reduce((sum, item) => sum + item.savings, 0)
  const actionedItems = filteredRecommendations.filter((item) => item.status === "Actioned")
  const actionedSavings = actionedItems.reduce((sum, item) => sum + item.savings, 0)

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
  const totalSavings = allSaaSRecommendations.reduce((sum, item) => sum + item.savings, 0)
  const totalCount = allSaaSRecommendations.length
  const actionedItems = allSaaSRecommendations.filter((item) => item.status === "Actioned")
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

  allSaaSRecommendations.forEach((item) => {
    priorityMap.set(item.id, item.priority)
  })

  return priorityMap
}

export const priorityMap = calculatePriorities()

export const getHighPriorityCountByCategory = (categoryTitle: string, selectedStatuses?: Set<string>) => {
  const categoryItems = allSaaSRecommendations.filter((item) => item.category === categoryTitle)
  const highPriorityItems = categoryItems.filter((item) => {
    const calculatedPriority = priorityMap.get(item.id)
    if (selectedStatuses && selectedStatuses.size > 0) {
      return calculatedPriority === "high" && selectedStatuses.has(item.status)
    }
    return calculatedPriority === "high"
  })

  return highPriorityItems.length
}
