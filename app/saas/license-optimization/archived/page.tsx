import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ArchivedRecommendationsDashboard } from "@/components/archived-recommendations-dashboard"

export default function SaaSArchivedRecommendationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <ArchivedRecommendationsDashboard />
        </main>
      </div>
    </div>
  )
}
