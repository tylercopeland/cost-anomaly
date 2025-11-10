import { Card, CardContent } from "@/components/ui/card"

export function OptimizationScore() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-2xl font-bold text-foreground">Reserved Instances</h2>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
              Potential £1,234 monthly saving
            </div>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed">
            Optimize your cloud spending by purchasing reserved instances for predictable workloads and long-term
            commitments. Reserved instances offer significant cost savings compared to on-demand pricing.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
