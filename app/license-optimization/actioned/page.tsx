import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ActionedRecommendationsDashboard } from "@/components/actioned-recommendations-dashboard"

export default function ActionedRecommendationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <ActionedRecommendationsDashboard />
        </main>
      </div>
    </div>
  )
}
