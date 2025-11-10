"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ManagementType = "Multi-Cloud" | "Multi-SaaS"

interface ManagementContextType {
  managementType: ManagementType
  setManagementType: (type: ManagementType) => void
}

const ManagementContext = createContext<ManagementContextType | undefined>(undefined)

export function ManagementProvider({ children }: { children: ReactNode }) {
  const [managementType, setManagementType] = useState<ManagementType>("Multi-Cloud")

  return (
    <ManagementContext.Provider value={{ managementType, setManagementType }}>{children}</ManagementContext.Provider>
  )
}

export function useManagement() {
  const context = useContext(ManagementContext)
  if (context === undefined) {
    throw new Error("useManagement must be used within a ManagementProvider")
  }
  return context
}
