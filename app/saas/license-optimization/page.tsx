import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LicenseOptimizationDashboard } from "@/components/license-optimization-dashboard"

export default function SaaSLicenseOptimizationPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <LicenseOptimizationDashboard />
        </main>
      </div>
    </div>
  )
}
