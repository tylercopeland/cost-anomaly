// Shared data for cost anomaly tables

export interface CostAnomalyItem {
  id: string
  resourceGroup: string
  subIdentifier: string
  costChangeDollar: number
  costChangePercent: number
  diffFromBaseline: number
  severity: string
  classification: string
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
  },
]

// Helper function to find an item by ID
export function findCostAnomalyItem(id: string): CostAnomalyItem | undefined {
  const allData = [...suddenSpikesData, ...trendingConcernsData]
  return allData.find((item) => item.id === id)
}

