"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export interface CostTrendDataPoint {
  date: string
  dailyCost?: number | null
  isAnomaly?: boolean
  average?: number
  projection?: number | null
}

interface CostTrendChartProps {
  data: CostTrendDataPoint[]
  average?: number
  showProjection?: boolean
  height?: number
}

export function CostTrendChart({
  data,
  average,
  showProjection = false,
  height = 300,
}: CostTrendChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500 p-4">No data available</div>
  }

  // Separate actual data and projection data
  const actualDataPoints = data.filter((point) => point.dailyCost != null && typeof point.dailyCost === "number")
  const projectionPoints = data.filter((point) => 
    point.projection != null && typeof point.projection === "number" && (!point.dailyCost || point.dailyCost === null)
  )
  
  // Find today's date (the most recent actual data point, or the anomaly point)
  const todayIndex = actualDataPoints.findIndex((point) => point.isAnomaly) !== -1
    ? actualDataPoints.findIndex((point) => point.isAnomaly)
    : actualDataPoints.length - 1
  
  // Get 7 days before today and today itself (8 points total for left side)
  const daysBeforeToday = Math.max(0, todayIndex - 6)
  const leftSideData = actualDataPoints.slice(daysBeforeToday, todayIndex + 1)
  
  // Get projection data for the right side (7 days after today to center it)
  const rightSideProjections = projectionPoints.slice(0, 7)
  
  // Combine left side (actual) + right side (projections)
  const combinedData = [...leftSideData, ...rightSideProjections]
  
  // Calculate average from the actual data points (before today)
  const baselineData = leftSideData.filter((point) => !point.isAnomaly)
  const costsForAverage = baselineData.map((point) => point.dailyCost as number)
  const calculatedAverage =
    average ||
    (costsForAverage.length > 0
      ? costsForAverage.reduce((sum, cost) => sum + cost, 0) / costsForAverage.length
      : 0)

  // Prepare chart data - mix actual and projection
  const chartData = combinedData.map((point, index) => {
    const isProjection = index >= leftSideData.length
    return {
      date: point.date,
      dailyCost: isProjection ? null : (point.dailyCost as number),
      projection: isProjection ? point.projection : null,
      isAnomaly: point.isAnomaly ?? false,
      average: point.average ?? calculatedAverage,
    }
  })

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return dateString
    }
  }

  // Calculate Y-axis domain to ensure all data is visible with padding
  const allValues = [
    ...chartData.map((d) => d.dailyCost).filter((v) => v != null) as number[],
    ...chartData.map((d) => d.projection).filter((v) => v != null) as number[],
    calculatedAverage,
  ]
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  const yAxisPadding = (maxValue - minValue) * 0.1 // 10% padding

  return (
    <div style={{ width: "100%", height: `${height}px`, minHeight: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={formatCurrency}
            domain={[Math.max(0, minValue - yAxisPadding), maxValue + yAxisPadding]}
          />
          <Tooltip
            formatter={(value: any) => formatCurrency(value)}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            iconType="line"
          />
          {/* Daily Cost Line */}
          <Line
            type="monotone"
            dataKey="dailyCost"
            name="Daily Cost"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props
              if (payload?.isAnomaly) {
                return (
                  <g>
                    <polygon
                      points={`${cx},${cy - 6} ${cx - 6},${cy + 6} ${cx + 6},${cy + 6}`}
                      fill="#ef4444"
                      stroke="#dc2626"
                      strokeWidth={1}
                    />
                  </g>
                )
              }
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 8 }}
          />
          {/* Average Line */}
          <Line
            type="monotone"
            dataKey="average"
            name={`Average (${formatCurrency(calculatedAverage)})`}
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          {/* Projection Line - shows trend if anomaly is not addressed */}
          {showProjection && (
            <Line
              type="monotone"
              dataKey="projection"
              name="Projected Trend"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={(props: any) => {
                const { cx, cy, payload } = props
                if (payload?.projection != null) {
                  return (
                    <polygon
                      points={`${cx},${cy - 6} ${cx - 5},${cy + 4} ${cx + 5},${cy + 4}`}
                      fill="#f97316"
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  )
                }
                return null
              }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
