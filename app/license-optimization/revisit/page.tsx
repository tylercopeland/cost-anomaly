import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { RevisitRecommendationsDashboard } from "@/components/revisit-recommendations-dashboard"

export default function RevisitRecommendationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <RevisitRecommendationsDashboard />
        </main>
      </div>
    </div>
  )
}
