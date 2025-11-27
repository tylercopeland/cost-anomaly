// Shared data for cost anomaly tables

// Helper function to generate dates relative to today
function getDateString(daysFromToday: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]
}

export interface RecommendedAction {
  title: string
  action: string
  type?: "primary" | "secondary"
}

export interface CostTrendDataPoint {
  date: string
  dailyCost: number | null
  isAnomaly?: boolean
  average?: number
  projection?: number | null
}

export interface CostAnomalyItem {
  id: string
  resourceGroup: string
  subIdentifier: string
  costChangeDollar: number
  costChangePercent: number
  diffFromBaseline: number
  severity: string
  classification: string
  // Details page fields
  baselineDaily: number
  currentDaily: number
  projectedMonthlyImpact: number
  worstCaseMonthlyCost?: number
  causes: string[]
  sparklineData: number[] // Keep for backward compatibility
  costTrendData?: CostTrendDataPoint[] // New date-based trend data
  recommendedActions: RecommendedAction[]
  smartTags?: { key: string; value: string }[]
  smartTargets?: { label: string; value: string | number; unit?: string }[]
}

// Static dummy data for Sudden Spikes
export const suddenSpikesData: CostAnomalyItem[] = [
  {
    id: "1",
    resourceGroup: "rg-prod-database",
    subIdentifier: "Production-Sub-01",
    costChangeDollar: 1234,
    costChangePercent: 45,
    diffFromBaseline: 890,
    severity: "High",
    classification: "Unexpected Cost Change",
    baselineDaily: 2744,
    currentDaily: 3978,
    projectedMonthlyImpact: 37020,
    worstCaseMonthlyCost: 145000,
    causes: [
      "Database instance was scaled up from 4 vCPUs to 8 vCPUs",
      "Increased read replica count from 1 to 3",
      "Storage auto-scaling triggered due to high I/O operations"
    ],
    sparklineData: [2744, 2750, 2760, 2780, 2850, 3000, 3200, 3500, 3800, 3978],
    costTrendData: [
      // Last 14 days - all at normal daily cost (baseline)
      { date: getDateString(-14), dailyCost: 2744 },
      { date: getDateString(-13), dailyCost: 2744 },
      { date: getDateString(-12), dailyCost: 2744 },
      { date: getDateString(-11), dailyCost: 2744 },
      { date: getDateString(-10), dailyCost: 2744 },
      { date: getDateString(-9), dailyCost: 2744 },
      { date: getDateString(-8), dailyCost: 2744 },
      { date: getDateString(-7), dailyCost: 2744 },
      { date: getDateString(-6), dailyCost: 2744 },
      { date: getDateString(-5), dailyCost: 2744 },
      { date: getDateString(-4), dailyCost: 2744 },
      { date: getDateString(-3), dailyCost: 2744 },
      { date: getDateString(-2), dailyCost: 2744 },
      { date: getDateString(-1), dailyCost: 2744 },
      // Anomaly spike - TODAY (sudden jump from stable baseline)
      { date: getDateString(0), dailyCost: 3978, isAnomaly: true },
      // Projection period - future days showing recovery
      { date: getDateString(1), dailyCost: null, projection: 3200 },
      { date: getDateString(2), dailyCost: null, projection: 3500 },
      { date: getDateString(3), dailyCost: null, projection: 3800 },
      { date: getDateString(4), dailyCost: null, projection: 3500 },
      { date: getDateString(5), dailyCost: null, projection: 3000 },
      { date: getDateString(6), dailyCost: null, projection: 2800 },
      { date: getDateString(7), dailyCost: null, projection: 2850 },
      { date: getDateString(8), dailyCost: null, projection: 2900 },
      { date: getDateString(9), dailyCost: null, projection: 2920 },
      { date: getDateString(10), dailyCost: null, projection: 2950 },
      { date: getDateString(11), dailyCost: null, projection: 2980 },
      { date: getDateString(12), dailyCost: null, projection: 3000 },
      { date: getDateString(13), dailyCost: null, projection: 3020 },
    ].map((point) => ({
      date: point.date,
      dailyCost: point.dailyCost, // Keep as number or null
      isAnomaly: point.isAnomaly,
      average: 2744, // Average of stable baseline costs (14 days before anomaly)
      projection: point.projection,
    })),
    recommendedActions: [
      { title: "Review and adjust database scaling configuration to ensure it matches actual workload requirements. Consider implementing scheduled scaling based on usage patterns.", action: "Review", type: "primary" },
      { title: "Optimize query performance by analyzing slow queries and adding appropriate indexes. This can reduce the need for additional read replicas.", action: "Optimize", type: "secondary" },
      { title: "Set up cost alerts to notify your team when database costs exceed baseline by more than 20%. This will help catch similar issues earlier.", action: "Configure", type: "secondary" }
    ],
    smartTags: [
      { key: "Cloud", value: "Azure" },
      { key: "Service", value: "Virtual Machines" },
      { key: "Impact", value: "High Savings" },
      { key: "Region", value: "East US" },
      { key: "Environment", value: "value1" }
    ],
    smartTargets: [
      { label: "Target Daily Cost", value: 2800, unit: "$" },
      { label: "Target Reduction", value: 30, unit: "%" },
      { label: "Expected Savings", value: 35000, unit: "/month" }
    ]
  },
  {
    id: "2",
    resourceGroup: "rg-dev-services",
    subIdentifier: "Development-Sub-02",
    costChangeDollar: 567,
    costChangePercent: 32,
    diffFromBaseline: 445,
    severity: "Medium",
    classification: "Unexpected Cost Change",
    baselineDaily: 1772,
    currentDaily: 2339,
    projectedMonthlyImpact: 17010,
    worstCaseMonthlyCost: 85000,
    causes: [
      "New development environment provisioned",
      "Additional compute instances added for testing"
    ],
    sparklineData: [1772, 1780, 1800, 1850, 1950, 2100, 2200, 2300, 2330, 2339],
    costTrendData: [
      // Last 14 days - all at normal daily cost (baseline)
      { date: getDateString(-14), dailyCost: 1772 },
      { date: getDateString(-13), dailyCost: 1772 },
      { date: getDateString(-12), dailyCost: 1772 },
      { date: getDateString(-11), dailyCost: 1772 },
      { date: getDateString(-10), dailyCost: 1772 },
      { date: getDateString(-9), dailyCost: 1772 },
      { date: getDateString(-8), dailyCost: 1772 },
      { date: getDateString(-7), dailyCost: 1772 },
      { date: getDateString(-6), dailyCost: 1780 },
      { date: getDateString(-5), dailyCost: 1800 },
      { date: getDateString(-4), dailyCost: 1850 },
      { date: getDateString(-3), dailyCost: 1950 },
      { date: getDateString(-2), dailyCost: 2100 },
      { date: getDateString(-1), dailyCost: 2200 },
      // Anomaly spike - TODAY (sudden jump from stable baseline)
      { date: getDateString(0), dailyCost: 2339, isAnomaly: true },
      // Projection period - future days showing potential stabilization
      { date: getDateString(1), dailyCost: null, projection: 2300 },
      { date: getDateString(2), dailyCost: null, projection: 2250 },
      { date: getDateString(3), dailyCost: null, projection: 2200 },
      { date: getDateString(4), dailyCost: null, projection: 2150 },
      { date: getDateString(5), dailyCost: null, projection: 2100 },
      { date: getDateString(6), dailyCost: null, projection: 2050 },
      { date: getDateString(7), dailyCost: null, projection: 2000 },
      { date: getDateString(8), dailyCost: null, projection: 1950 },
      { date: getDateString(9), dailyCost: null, projection: 1900 },
      { date: getDateString(10), dailyCost: null, projection: 1850 },
      { date: getDateString(11), dailyCost: null, projection: 1820 },
      { date: getDateString(12), dailyCost: null, projection: 1800 },
      { date: getDateString(13), dailyCost: null, projection: 1790 },
    ].map((point) => ({
      date: point.date,
      dailyCost: point.dailyCost,
      isAnomaly: point.isAnomaly,
      average: 1772, // Average of stable baseline costs
      projection: point.projection,
    })),
    recommendedActions: [
      { title: "Schedule auto-shutdown for dev environments during non-business hours and weekends. This can reduce costs by up to 60% without impacting productivity.", action: "Configure", type: "primary" },
      { title: "Review resource allocation and right-size development instances. Many dev environments are over-provisioned and can run on smaller instance types.", action: "Review", type: "secondary" }
    ]
  },
  {
    id: "3",
    resourceGroup: "rg-test-environment",
    subIdentifier: "Testing-Sub-01",
    costChangeDollar: -890,
    costChangePercent: -52,
    diffFromBaseline: -890,
    severity: "Medium",
    classification: "Unexpected Cost Change",
    baselineDaily: 1712,
    currentDaily: 822,
    projectedMonthlyImpact: -26700,
    causes: [
      "Test environment was decommissioned",
      "Reduced compute resources after load testing completion"
    ],
    sparklineData: [1712, 1700, 1650, 1500, 1300, 1100, 950, 900, 850, 822],
    costTrendData: [
      // Last 14 days - all at normal daily cost (baseline)
      { date: getDateString(-14), dailyCost: 1712 },
      { date: getDateString(-13), dailyCost: 1712 },
      { date: getDateString(-12), dailyCost: 1712 },
      { date: getDateString(-11), dailyCost: 1712 },
      { date: getDateString(-10), dailyCost: 1712 },
      { date: getDateString(-9), dailyCost: 1712 },
      { date: getDateString(-8), dailyCost: 1712 },
      { date: getDateString(-7), dailyCost: 1712 },
      { date: getDateString(-6), dailyCost: 1700 },
      { date: getDateString(-5), dailyCost: 1650 },
      { date: getDateString(-4), dailyCost: 1500 },
      { date: getDateString(-3), dailyCost: 1300 },
      { date: getDateString(-2), dailyCost: 1100 },
      { date: getDateString(-1), dailyCost: 950 },
      // Anomaly drop - TODAY (sudden decrease from stable baseline)
      { date: getDateString(0), dailyCost: 822, isAnomaly: true },
      // Projection period - future days showing continued low cost
      { date: getDateString(1), dailyCost: null, projection: 850 },
      { date: getDateString(2), dailyCost: null, projection: 870 },
      { date: getDateString(3), dailyCost: null, projection: 890 },
      { date: getDateString(4), dailyCost: null, projection: 900 },
      { date: getDateString(5), dailyCost: null, projection: 910 },
      { date: getDateString(6), dailyCost: null, projection: 920 },
      { date: getDateString(7), dailyCost: null, projection: 930 },
      { date: getDateString(8), dailyCost: null, projection: 940 },
      { date: getDateString(9), dailyCost: null, projection: 950 },
      { date: getDateString(10), dailyCost: null, projection: 960 },
      { date: getDateString(11), dailyCost: null, projection: 970 },
      { date: getDateString(12), dailyCost: null, projection: 980 },
      { date: getDateString(13), dailyCost: null, projection: 990 },
    ].map((point) => ({
      date: point.date,
      dailyCost: point.dailyCost,
      isAnomaly: point.isAnomaly,
      average: 1712, // Average of stable baseline costs
      projection: point.projection,
    })),
    recommendedActions: [
      { title: "Verify that the test environment shutdown was intentional and all resources have been properly decommissioned. Ensure no orphaned resources remain.", action: "Verify", type: "primary" },
      { title: "Document the cost savings achieved from decommissioning the test environment. This helps track optimization efforts and can inform future decisions.", action: "Document", type: "secondary" }
    ]
  },
  {
    id: "4",
    resourceGroup: "rg-analytics-cluster",
    subIdentifier: "Production-Sub-01",
    costChangeDollar: 345,
    costChangePercent: 28,
    diffFromBaseline: 267,
    severity: "Low",
    classification: "Unexpected Cost Change",
    baselineDaily: 1232,
    currentDaily: 1577,
    projectedMonthlyImpact: 10350,
    worstCaseMonthlyCost: 55000,
    causes: [
      "Increased data processing workload",
      "Additional analytics jobs scheduled"
    ],
    sparklineData: [1232, 1240, 1260, 1300, 1350, 1420, 1480, 1520, 1550, 1577],
    costTrendData: [
      // Last 14 days - stable baseline, then gradual increase
      { date: getDateString(-14), dailyCost: 1232 },
      { date: getDateString(-13), dailyCost: 1232 },
      { date: getDateString(-12), dailyCost: 1232 },
      { date: getDateString(-11), dailyCost: 1232 },
      { date: getDateString(-10), dailyCost: 1232 },
      { date: getDateString(-9), dailyCost: 1232 },
      { date: getDateString(-8), dailyCost: 1232 },
      { date: getDateString(-7), dailyCost: 1232 },
      { date: getDateString(-6), dailyCost: 1240 },
      { date: getDateString(-5), dailyCost: 1260 },
      { date: getDateString(-4), dailyCost: 1300 },
      { date: getDateString(-3), dailyCost: 1350 },
      { date: getDateString(-2), dailyCost: 1420 },
      { date: getDateString(-1), dailyCost: 1480 },
      // Anomaly spike - TODAY (sudden jump)
      { date: getDateString(0), dailyCost: 1577, isAnomaly: true },
      // Projection period - future days showing potential optimization
      { date: getDateString(1), dailyCost: null, projection: 1550 },
      { date: getDateString(2), dailyCost: null, projection: 1520 },
      { date: getDateString(3), dailyCost: null, projection: 1500 },
      { date: getDateString(4), dailyCost: null, projection: 1480 },
      { date: getDateString(5), dailyCost: null, projection: 1460 },
      { date: getDateString(6), dailyCost: null, projection: 1440 },
      { date: getDateString(7), dailyCost: null, projection: 1420 },
      { date: getDateString(8), dailyCost: null, projection: 1400 },
      { date: getDateString(9), dailyCost: null, projection: 1380 },
      { date: getDateString(10), dailyCost: null, projection: 1360 },
      { date: getDateString(11), dailyCost: null, projection: 1340 },
      { date: getDateString(12), dailyCost: null, projection: 1320 },
      { date: getDateString(13), dailyCost: null, projection: 1300 },
    ].map((point) => ({
      date: point.date,
      dailyCost: point.dailyCost,
      isAnomaly: point.isAnomaly,
      average: 1232, // Average of stable baseline costs
      projection: point.projection,
    })),
    recommendedActions: [
      { title: "Review job scheduling to consolidate overlapping analytics jobs and optimize run times. Consider batch processing during off-peak hours to reduce costs.", action: "Review", type: "primary" },
      { title: "Optimize data processing pipelines by implementing incremental processing instead of full table scans. This reduces compute requirements and costs.", action: "Optimize", type: "secondary" }
    ]
  },
  {
    id: "5",
    resourceGroup: "rg-backup-storage",
    subIdentifier: "Production-Sub-02",
    costChangeDollar: 1890,
    costChangePercent: 67,
    diffFromBaseline: 1234,
    severity: "High",
    classification: "Unexpected Cost Change",
    baselineDaily: 2821,
    currentDaily: 4711,
    projectedMonthlyImpact: 56700,
    worstCaseMonthlyCost: 180000,
    causes: [
      "Backup retention policy changed from 30 to 90 days",
      "New backup jobs added for additional databases",
      "Storage tier upgraded to premium for faster restore times"
    ],
    sparklineData: [2821, 2850, 2900, 3000, 3200, 3600, 4000, 4300, 4500, 4711],
    costTrendData: [
      // Extended baseline period - stable backup costs (20 days before)
      { date: getDateString(-20), dailyCost: 2800 },
      { date: getDateString(-19), dailyCost: 2805 },
      { date: getDateString(-18), dailyCost: 2810 },
      { date: getDateString(-17), dailyCost: 2815 },
      { date: getDateString(-16), dailyCost: 2820 },
      { date: getDateString(-15), dailyCost: 2821 },
      { date: getDateString(-14), dailyCost: 2822 },
      { date: getDateString(-13), dailyCost: 2823 },
      { date: getDateString(-12), dailyCost: 2824 },
      { date: getDateString(-11), dailyCost: 2825 },
      { date: getDateString(-10), dailyCost: 2826 },
      { date: getDateString(-9), dailyCost: 2827 },
      { date: getDateString(-8), dailyCost: 2828 },
      { date: getDateString(-7), dailyCost: 2821 },
      { date: getDateString(-6), dailyCost: 2850 },
      { date: getDateString(-5), dailyCost: 2900 },
      { date: getDateString(-4), dailyCost: 3000 },
      { date: getDateString(-3), dailyCost: 3200 },
      { date: getDateString(-2), dailyCost: 3600 },
      { date: getDateString(-1), dailyCost: 4000 },
      // Anomaly spike - TODAY (peak cost)
      { date: getDateString(0), dailyCost: 4711, isAnomaly: true },
      // Projection - stabilizing after anomaly
      { date: getDateString(1), dailyCost: null, projection: 4650 },
      { date: getDateString(2), dailyCost: null, projection: 4600 },
      { date: getDateString(3), dailyCost: null, projection: 4550 },
      { date: getDateString(4), dailyCost: null, projection: 4500 },
      { date: getDateString(5), dailyCost: null, projection: 4450 },
      { date: getDateString(6), dailyCost: null, projection: 4400 },
      { date: getDateString(7), dailyCost: null, projection: 4380 },
      { date: getDateString(8), dailyCost: null, projection: 4360 },
      { date: getDateString(9), dailyCost: null, projection: 4340 },
      { date: getDateString(10), dailyCost: null, projection: 4320 },
      { date: getDateString(11), dailyCost: null, projection: 4300 },
      { date: getDateString(12), dailyCost: null, projection: 4280 },
      { date: getDateString(13), dailyCost: null, projection: 4260 },
    ].map((point) => ({
      ...point,
      dailyCost: point.dailyCost ?? null,
      average: 3000, // Average of baseline costs (before rapid increase)
    })),
    recommendedActions: [
      { title: "Review backup retention policy and align it with actual business requirements. Consider reducing retention from 90 to 60 days if not needed, which could save approximately $18,900 monthly.", action: "Review", type: "primary" },
      { title: "Optimize backup schedule by reducing frequency for non-critical databases. Full backups daily may be excessive for some workloads.", action: "Optimize", type: "secondary" },
      { title: "Consider moving older backups to archive storage tier, which costs 80% less than premium storage while maintaining accessibility.", action: "Configure", type: "secondary" }
    ],
    smartTags: [
      { key: "Cloud", value: "Azure" },
      { key: "Service", value: "Backup Services" },
      { key: "Impact", value: "High Savings" },
      { key: "Region", value: "West US" },
      { key: "Environment", value: "Production" }
    ]
  },
  {
    id: "6",
    resourceGroup: "rg-monitoring-stack",
    subIdentifier: "Development-Sub-01",
    costChangeDollar: -234,
    costChangePercent: -18,
    diffFromBaseline: -234,
    severity: "Low",
    classification: "Unexpected Cost Change",
    baselineDaily: 1300,
    currentDaily: 1066,
    projectedMonthlyImpact: -7020,
    causes: [
      "Reduced log retention period",
      "Consolidated monitoring instances"
    ],
    sparklineData: [1300, 1280, 1250, 1200, 1150, 1120, 1100, 1080, 1070, 1066],
    costTrendData: [
      // Last 14 days - stable baseline, then gradual decrease
      { date: getDateString(-14), dailyCost: 1300 },
      { date: getDateString(-13), dailyCost: 1300 },
      { date: getDateString(-12), dailyCost: 1300 },
      { date: getDateString(-11), dailyCost: 1300 },
      { date: getDateString(-10), dailyCost: 1300 },
      { date: getDateString(-9), dailyCost: 1300 },
      { date: getDateString(-8), dailyCost: 1300 },
      { date: getDateString(-7), dailyCost: 1300 },
      { date: getDateString(-6), dailyCost: 1280 },
      { date: getDateString(-5), dailyCost: 1250 },
      { date: getDateString(-4), dailyCost: 1200 },
      { date: getDateString(-3), dailyCost: 1150 },
      { date: getDateString(-2), dailyCost: 1120 },
      { date: getDateString(-1), dailyCost: 1100 },
      // Anomaly drop - TODAY (sudden decrease)
      { date: getDateString(0), dailyCost: 1066, isAnomaly: true },
      // Projection period - future days showing continued low cost
      { date: getDateString(1), dailyCost: null, projection: 1080 },
      { date: getDateString(2), dailyCost: null, projection: 1090 },
      { date: getDateString(3), dailyCost: null, projection: 1100 },
      { date: getDateString(4), dailyCost: null, projection: 1110 },
      { date: getDateString(5), dailyCost: null, projection: 1120 },
      { date: getDateString(6), dailyCost: null, projection: 1130 },
      { date: getDateString(7), dailyCost: null, projection: 1140 },
      { date: getDateString(8), dailyCost: null, projection: 1150 },
      { date: getDateString(9), dailyCost: null, projection: 1160 },
      { date: getDateString(10), dailyCost: null, projection: 1170 },
      { date: getDateString(11), dailyCost: null, projection: 1180 },
      { date: getDateString(12), dailyCost: null, projection: 1190 },
      { date: getDateString(13), dailyCost: null, projection: 1200 },
    ].map((point) => ({
      date: point.date,
      dailyCost: point.dailyCost,
      isAnomaly: point.isAnomaly,
      average: 1300, // Average of stable baseline costs
      projection: point.projection,
    })),
    recommendedActions: [
      { title: "Verify that monitoring coverage remains adequate after consolidation. Ensure critical metrics and alerts are still being captured without gaps.", action: "Verify", type: "primary" },
      { title: "Document the optimization changes made to the monitoring stack. This helps maintain institutional knowledge and can guide future optimizations.", action: "Document", type: "secondary" }
    ]
  },
]

// Static dummy data for Trending Concerns
export const trendingConcernsData: CostAnomalyItem[] = [
  {
    id: "tc-1",
    resourceGroup: "rg-prod-compute",
    subIdentifier: "Production-Sub-01",
    costChangeDollar: 1789,
    costChangePercent: 20,
    diffFromBaseline: 1789,
    severity: "High",
    classification: "Unexpected Cost Increase",
    baselineDaily: 8945,
    currentDaily: 10734,
    projectedMonthlyImpact: 53670,
    causes: [
      "Gradual increase in compute usage over the past 30 days",
      "New microservices deployed without resource limits",
      "Auto-scaling policies too aggressive",
      "Increased traffic from new feature launches"
    ],
    sparklineData: [8945, 9100, 9250, 9450, 9700, 9950, 10100, 10300, 10500, 10734],
    costTrendData: [
      // Extended baseline period - showing gradual increase trend (20 days before)
      { date: getDateString(-20), dailyCost: 8500 },
      { date: getDateString(-19), dailyCost: 8550 },
      { date: getDateString(-18), dailyCost: 8600 },
      { date: getDateString(-17), dailyCost: 8650 },
      { date: getDateString(-16), dailyCost: 8700 },
      { date: getDateString(-15), dailyCost: 8750 },
      { date: getDateString(-14), dailyCost: 8800 },
      { date: getDateString(-13), dailyCost: 8850 },
      { date: getDateString(-12), dailyCost: 8900 },
      { date: getDateString(-11), dailyCost: 8920 },
      { date: getDateString(-10), dailyCost: 8940 },
      { date: getDateString(-9), dailyCost: 8960 },
      { date: getDateString(-8), dailyCost: 8980 },
      { date: getDateString(-7), dailyCost: 8945 },
      { date: getDateString(-6), dailyCost: 9100 },
      { date: getDateString(-5), dailyCost: 9250 },
      { date: getDateString(-4), dailyCost: 9450 },
      { date: getDateString(-3), dailyCost: 9700 },
      { date: getDateString(-2), dailyCost: 9950 },
      { date: getDateString(-1), dailyCost: 10100 },
      // Today - continuing the trend (no anomaly, just trending concern)
      { date: getDateString(0), dailyCost: 10300 },
      // Projection - continuing upward trend
      { date: getDateString(1), dailyCost: null, projection: 10500 },
      { date: getDateString(2), dailyCost: null, projection: 10734 },
      { date: getDateString(3), dailyCost: null, projection: 10800 },
      { date: getDateString(4), dailyCost: null, projection: 10850 },
      { date: getDateString(5), dailyCost: null, projection: 10900 },
      { date: getDateString(6), dailyCost: null, projection: 10950 },
      { date: getDateString(7), dailyCost: null, projection: 11000 },
      { date: getDateString(8), dailyCost: null, projection: 11050 },
      { date: getDateString(9), dailyCost: null, projection: 11100 },
      { date: getDateString(10), dailyCost: null, projection: 11150 },
      { date: getDateString(11), dailyCost: null, projection: 11200 },
      { date: getDateString(12), dailyCost: null, projection: 11250 },
      { date: getDateString(13), dailyCost: null, projection: 11300 },
    ].map((point) => ({
      ...point,
      dailyCost: point.dailyCost ?? null,
      average: 9200, // Average of baseline costs
    })),
    recommendedActions: [
      { title: "Set resource limits on new microservices to prevent uncontrolled scaling. Define CPU and memory limits based on expected load patterns to control costs.", action: "Configure", type: "primary" },
      { title: "Review auto-scaling policies to ensure they're not too aggressive. Consider implementing scaling delays and cooldown periods to prevent rapid cost increases.", action: "Review", type: "secondary" },
      { title: "Implement cost budgets with alerts at 80% and 100% thresholds. This provides early warning before costs spiral out of control.", action: "Configure", type: "secondary" }
    ]
  },
  {
    id: "tc-2",
    resourceGroup: "rg-storage-main",
    subIdentifier: "Production-Sub-02",
    costChangeDollar: 891,
    costChangePercent: 17,
    diffFromBaseline: 891,
    severity: "Medium",
    classification: "Unexpected Cost Increase",
    baselineDaily: 5241,
    currentDaily: 6132,
    projectedMonthlyImpact: 26730,
    causes: [
      "Storage growth rate increased by 15% month-over-month",
      "New data ingestion pipelines storing more data",
      "No lifecycle policies configured for old data"
    ],
    sparklineData: [5241, 5300, 5400, 5520, 5650, 5780, 5900, 6000, 6080, 6132],
    recommendedActions: [
      { title: "Configure storage lifecycle policies to automatically move data older than 30 days to cheaper storage tiers. This can reduce storage costs by up to 50% for infrequently accessed data.", action: "Configure", type: "primary" },
      { title: "Review data retention requirements with stakeholders to ensure you're not storing data longer than necessary. Reducing retention by 30 days could save significant costs.", action: "Review", type: "secondary" },
      { title: "Archive old data to cold storage tiers, which cost 90% less than standard storage. This is ideal for data that's rarely accessed but must be retained for compliance.", action: "Archive", type: "secondary" }
    ]
  },
  {
    id: "tc-3",
    resourceGroup: "rg-network-services",
    subIdentifier: "Infrastructure-Sub",
    costChangeDollar: 432,
    costChangePercent: 12.5,
    diffFromBaseline: 432,
    severity: "Medium",
    classification: "Expected Change",
    baselineDaily: 3456,
    currentDaily: 3888,
    projectedMonthlyImpact: 12960,
    causes: [
      "Planned network infrastructure upgrade",
      "Increased bandwidth allocation for new regions"
    ],
    sparklineData: [3456, 3500, 3550, 3600, 3650, 3700, 3750, 3800, 3850, 3888],
    recommendedActions: [
      { title: "Monitor network performance metrics to ensure the infrastructure upgrade is delivering expected improvements. Track latency, throughput, and error rates.", action: "Monitor", type: "primary" },
      { title: "Review bandwidth utilization patterns to identify optimization opportunities. Consider implementing data compression or caching to reduce bandwidth requirements.", action: "Review", type: "secondary" }
    ]
  },
  {
    id: "tc-4",
    resourceGroup: "rg-ml-training",
    subIdentifier: "Data-Science-Sub",
    costChangeDollar: 289,
    costChangePercent: 10,
    diffFromBaseline: 289,
    severity: "Low",
    classification: "Unexpected Cost Increase",
    baselineDaily: 2890,
    currentDaily: 3179,
    projectedMonthlyImpact: 8670,
    causes: [
      "More frequent model training runs",
      "Larger datasets being processed"
    ],
    sparklineData: [2890, 2920, 2950, 2980, 3020, 3060, 3100, 3130, 3160, 3179],
    recommendedActions: [
      { title: "Optimize training job frequency by implementing incremental training instead of full retraining. Consider scheduling training during off-peak hours to take advantage of lower compute costs.", action: "Optimize", type: "primary" },
      { title: "Review dataset sizes and implement data sampling or feature selection techniques. Training on smaller, representative datasets can reduce costs while maintaining model quality.", action: "Review", type: "secondary" }
    ]
  },
]

// Helper function to find an item by ID
export function findCostAnomalyItem(id: string): CostAnomalyItem | undefined {
  const allData = [...suddenSpikesData, ...trendingConcernsData]
  return allData.find((item) => item.id === id)
}

