"use client"

import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

export interface CostTrendDataPoint {
  date: string
  dailyCost?: number | null
  isAnomaly?: boolean
  average?: number
  projection?: number | null
}

export interface WorstCaseProjectionPoint {
  date: string
  value: number
}

interface CostTrendChartProps {
  data: CostTrendDataPoint[]
  average?: number
  showProjection?: boolean
  worstCaseProjection?: WorstCaseProjectionPoint[]
  projectedTrendData?: WorstCaseProjectionPoint[]
  height?: number
}

export function CostTrendChart({
  data,
  average,
  showProjection = false,
  worstCaseProjection,
  projectedTrendData,
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
  const anomalyIndex = actualDataPoints.findIndex((point) => point.isAnomaly)
  const todayIndex = anomalyIndex !== -1 ? anomalyIndex : actualDataPoints.length - 1
  
  // Get 7 days before today and today itself (8 points total for left side)
  // Ensure we always show at least 7 historical points + anomaly = 8 points minimum
  const daysBeforeToday = Math.max(0, todayIndex - 6)
  const leftSideData = actualDataPoints.slice(daysBeforeToday, todayIndex + 1)
  
  // Debug: Log data processing
  console.log('Data Processing:', {
    totalDataPoints: data.length,
    actualDataPoints: actualDataPoints.length,
    projectionPoints: projectionPoints.length,
    anomalyIndex,
    todayIndex,
    daysBeforeToday,
    leftSideDataCount: leftSideData.length,
    leftSideDates: leftSideData.map(d => d.date),
    rightSideProjectionsCount: projectionPoints.slice(0, 7).length
  })
  
  // Get projection data for the right side (7 days after today to center it)
  const rightSideProjections = projectionPoints.slice(0, 7)
  
  // Combine left side (actual) + right side (projections)
  const combinedData = [...leftSideData, ...rightSideProjections]
  
  // Use provided average (baselineDaily from summary cards) or calculate from data
  const baselineData = leftSideData.filter((point) => !point.isAnomaly)
  const costsForAverage = baselineData.map((point) => point.dailyCost as number)
  const calculatedAverage =
    average !== undefined
      ? average
      : costsForAverage.length > 0
      ? costsForAverage.reduce((sum, cost) => sum + cost, 0) / costsForAverage.length
      : 0
  
  // Ensure baseline is set to 3200
  const baselineValue = calculatedAverage || 3200

  // Merge worst-case projection data into chart data
  const worstCaseMap = new Map<string, number>()
  if (worstCaseProjection && worstCaseProjection.length > 0) {
    worstCaseProjection.forEach((point) => {
      worstCaseMap.set(point.date, point.value)
    })
  }

  // Merge projected trend data (from monthly impact) into chart data
  const projectedTrendMap = new Map<string, number>()
  if (projectedTrendData && projectedTrendData.length > 0) {
    projectedTrendData.forEach((point) => {
      projectedTrendMap.set(point.date, point.value)
    })
  }

  // Prepare chart data - mix actual and projection
  const chartData = combinedData.map((point, index) => {
    const isProjection = index >= leftSideData.length
    // Try to find worst-case value by exact date match
    const worstCaseValue = worstCaseMap.get(point.date) || null
    // Use projected trend data if available (from monthly impact), otherwise use original projection
    // Prioritize projectedTrendMap over original projection data
    let projectionValue = null
    if (projectedTrendMap.has(point.date)) {
      projectionValue = projectedTrendMap.get(point.date) || null
    } else if (isProjection && point.projection != null) {
      projectionValue = point.projection
    }
    const dataPoint = {
      date: point.date,
      dailyCost: isProjection ? null : (point.dailyCost as number),
      projection: projectionValue,
      worstCaseValue: worstCaseValue,
      isAnomaly: point.isAnomaly ?? false,
      average: baselineValue, // Always use baselineValue for consistent baseline
    }
    return dataPoint
  })
  
  // Debug: Log projection data mapping
  console.log('Projection Data Mapping:', {
    projectedTrendMapEntries: Array.from(projectedTrendMap.entries()),
    chartDataWithProjections: chartData.filter(d => d.projection != null).map(d => ({
      date: d.date,
      projection: d.projection,
      isProjection: chartData.indexOf(d) >= leftSideData.length
    }))
  })

  // Ensure baseline is set to 3200 for all points (already set in map above, but double-check)
  chartData.forEach(point => {
    point.average = baselineValue
  })

  // Debug: Log all data to verify rendering
  const projectionDataPoints = chartData.filter(d => d.projection != null)
  console.log('Chart Data Summary:', {
    totalPoints: chartData.length,
    hasDailyCost: chartData.filter(d => d.dailyCost != null).length,
    hasProjection: projectionDataPoints.length,
    hasWorstCase: chartData.filter(d => d.worstCaseValue != null).length,
    hasAverage: chartData.filter(d => d.average != null && d.average > 0).length,
    baseline: baselineValue,
    worstCasePoints: worstCaseProjection?.length || 0,
    projectedTrendPoints: projectedTrendData?.length || 0,
    showProjection,
    projectionSample: projectionDataPoints.slice(0, 5).map(d => ({ date: d.date, projection: d.projection })),
    projectedTrendMapSize: projectedTrendMap.size,
    projectedTrendSample: projectedTrendData?.slice(0, 3),
    allProjectionValues: projectionDataPoints.map(d => d.projection)
  })

  // Also add worst-case points that might not be in combinedData
  if (worstCaseProjection && worstCaseProjection.length > 0) {
    worstCaseProjection.forEach((wcPoint) => {
      // Check if this date is already in chartData
      const exists = chartData.some((cd) => cd.date === wcPoint.date)
      if (!exists) {
        // Add it to chartData
        chartData.push({
          date: wcPoint.date,
          dailyCost: null,
          projection: null,
          worstCaseValue: wcPoint.value,
          isAnomaly: false,
          average: baselineValue,
        })
      }
    })
    // Sort chartData by date to maintain order
    chartData.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  }

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
    ...chartData.map((d) => d.worstCaseValue).filter((v) => v != null) as number[],
    calculatedAverage,
  ]
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  const yAxisPadding = (maxValue - minValue) * 0.1 // 10% padding
  
  // Debug: Log Y-axis domain and projection values
  console.log('Y-Axis Domain Debug:', {
    minValue,
    maxValue,
    yAxisPadding,
    domainMin: Math.max(0, minValue - yAxisPadding),
    domainMax: maxValue + yAxisPadding,
    projectionValues: chartData.filter(d => d.projection != null).map(d => ({ date: d.date, projection: d.projection })),
    allProjectionCount: chartData.filter(d => d.projection != null).length
  })

  return (
    <div style={{ width: "100%", height: `${height}px`, minHeight: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
        >
          <defs>
            <linearGradient id="colorDailyCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={50}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={formatCurrency}
            domain={[Math.max(0, minValue - yAxisPadding), maxValue + yAxisPadding]}
            axisLine={false}
            ticks={(() => {
              const domainMin = Math.max(0, minValue - yAxisPadding)
              const domainMax = maxValue + yAxisPadding
              const range = domainMax - domainMin
              const tickCount = 5
              const tickStep = range / (tickCount - 1)
              return Array.from({ length: tickCount }, (_, i) => domainMin + tickStep * i)
            })()}
          />
          <Tooltip
            formatter={(value: any, name: string, props: any) => {
              if (name === "worstCaseValue") {
                return `Worst-case projection: ${formatCurrency(value)} on ${formatDate(props.payload.date)}`
              }
              return formatCurrency(value)
            }}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {/* Daily Cost Area with gradient fill */}
          <Area
            type="monotone"
            dataKey="dailyCost"
            name="Daily Cost"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorDailyCost)"
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
                  r={4}
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 6 }}
          />
          {/* Baseline Reference Line - Green dotted line at $3200 */}
          <ReferenceLine
            y={baselineValue}
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          {/* Baseline Line for Legend - renders the same line but shows in legend */}
          <Line
            type="monotone"
            dataKey="average"
            name="Baseline"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={true}
            isAnimationActive={false}
            strokeOpacity={1}
            legendType="line"
          />
          {/* Worst-case Projection Line - pink dotted line with markers */}
          {worstCaseProjection && worstCaseProjection.length > 0 && (
            <Line
              type="monotone"
              dataKey="worstCaseValue"
              name="Worst-case Projection"
              stroke="#ec4899"
              strokeWidth={2}
              strokeDasharray="2 4"
              strokeOpacity={0.9}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                if (payload?.worstCaseValue != null && typeof payload.worstCaseValue === 'number') {
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#ec4899"
                        stroke="#fff"
                        strokeWidth={1.5}
                        opacity={0.9}
                      />
                    </g>
                  )
                }
                return null
              }}
              activeDot={{ r: 6, fill: "#ec4899" }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          {/* Projection Line - shows trend if anomaly is not addressed - RENDERED LAST TO APPEAR ON TOP */}
          {/* Force render by ensuring we have projection data */}
          {(() => {
            const hasProjectionData = chartData.some(d => d.projection != null && typeof d.projection === 'number')
            console.log('Rendering Projection Line:', {
              hasProjectionData,
              projectionCount: chartData.filter(d => d.projection != null).length,
              projectionValues: chartData.filter(d => d.projection != null).map(d => ({ date: d.date, projection: d.projection }))
            })
            return hasProjectionData ? (
              <Line
                type="monotone"
                dataKey="projection"
                name="Projected Trend"
                stroke="#f97316"
                strokeWidth={5}
                strokeDasharray="8 4"
                dot={(props: any) => {
                  const { cx, cy, payload } = props
                  if (payload?.projection != null && typeof payload.projection === 'number') {
                    return (
                      <polygon
                        points={`${cx},${cy - 8} ${cx - 6},${cy + 5} ${cx + 6},${cy + 5}`}
                        fill="#f97316"
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    )
                  }
                  return null
                }}
                connectNulls={true}
                isAnimationActive={false}
                strokeOpacity={1}
                activeDot={{ r: 8, fill: "#f97316" }}
                style={{ zIndex: 100 }}
              />
            ) : null
          })()}
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            iconType="line"
            align="left"
            verticalAlign="bottom"
            payload={[
              { value: "Daily Cost", type: "monotone", id: "dailyCost", color: "#3b82f6" },
              { value: "Baseline", type: "monotone", id: "baseline", color: "#10b981" },
              ...(showProjection ? [{ value: "Projected Trend", type: "monotone", id: "projection", color: "#f97316" }] : []),
              ...(worstCaseProjection && worstCaseProjection.length > 0 ? [{ value: "Worst-case Projection", type: "monotone", id: "worstCase", color: "#ec4899" }] : [])
            ]}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
