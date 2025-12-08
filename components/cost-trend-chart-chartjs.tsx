"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

// Plugin to draw vertical dotted line on hover
const verticalLinePlugin = {
  id: 'verticalLine',
  afterEvent: (chart: any, args: any) => {
    const { inChartArea } = args
    const event = args.event
    const type = event?.type || event?.native?.type
    
    // Get x position from event
    let x = null
    if (event?.x !== undefined) {
      x = event.x
    } else if (event?.native?.x !== undefined) {
      x = event.native.x
    } else if (event?.clientX !== undefined && chart.canvas) {
      // Convert clientX to chart coordinates
      const rect = chart.canvas.getBoundingClientRect()
      x = event.clientX - rect.left
    }
    
    if (type === 'mousemove' && inChartArea && x !== null) {
      chart.verticalLineX = x
      chart.draw()
    } else if (type === 'mouseout') {
      chart.verticalLineX = null
      chart.draw()
    }
  },
  afterDatasetsDraw: (chart: any) => {
    if (chart.verticalLineX !== null && chart.verticalLineX !== undefined) {
      const ctx = chart.ctx
      const chartArea = chart.chartArea
      const x = chart.verticalLineX
      
      if (x >= chartArea.left && x <= chartArea.right) {
        ctx.save()
        ctx.strokeStyle = '#9ca3af'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, chartArea.top)
        ctx.lineTo(x, chartArea.bottom)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}



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
  const daysBeforeToday = Math.max(0, todayIndex - 6)
  const leftSideData = actualDataPoints.slice(daysBeforeToday, todayIndex + 1)
  
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
  
  // Ensure baseline is set to provided value or default
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

  // Prepare chart data
  const chartData = combinedData.map((point, index) => {
    const isProjection = index >= leftSideData.length
    const worstCaseValue = worstCaseMap.get(point.date) || null
    let projectionValue = null
    if (projectedTrendMap.has(point.date)) {
      projectionValue = projectedTrendMap.get(point.date) || null
    } else if (isProjection && point.projection != null) {
      projectionValue = point.projection
    }
    return {
      date: point.date,
      dailyCost: isProjection ? null : (point.dailyCost as number),
      projection: projectionValue,
      worstCaseValue: worstCaseValue,
      isAnomaly: point.isAnomaly ?? false,
      average: baselineValue,
    }
  })

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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare Chart.js data
  const labels = chartData.map(d => formatDate(d.date))
  const dailyCostData = chartData.map(d => d.dailyCost)
  const baselineDataArray = chartData.map(() => baselineValue)
  const projectionData = chartData.map(d => d.projection)
  const worstCaseData = chartData.map(d => d.worstCaseValue)

  const chartConfig = {
    labels,
    datasets: [
      // Daily Cost Area (conditional gradient: green when above baseline, purple when below) - appears first in legend
      {
        label: 'Daily Cost',
        data: dailyCostData,
        borderColor: '#10b981',
        pointRadius: 0,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        backgroundColor: (context: any) => {
          if (!context.chart.chartArea) return 'transparent'
          const ctx = context.chart.ctx
          const chart = context.chart
          const chartArea = chart.chartArea
          const yScale = chart.scales.y
          
          // Find baseline position on chart
          const baselinePixel = yScale.getPixelForValue(baselineValue)
          const chartHeight = chartArea.bottom - chartArea.top
          
          // Create gradient from line to bottom
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          
          // Get current data point value
          const dataIndex = context.dataIndex
          const value = dailyCostData[dataIndex]
          
          if (value != null && typeof value === 'number') {
            // Determine if value is above or below baseline
            const valuePixel = yScale.getPixelForValue(value)
            const isAboveBaseline = valuePixel < baselinePixel // Y-axis is inverted in canvas
            
            if (isAboveBaseline) {
              // Green/teal gradient when above baseline - fade from green to transparent
              gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)')
              gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.125)')
              gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
            } else {
              // Purple/blue gradient when below baseline - fade from purple to transparent
              gradient.addColorStop(0, 'rgba(197, 181, 253, 0.25)')
              gradient.addColorStop(0.5, 'rgba(197, 181, 253, 0.125)')
              gradient.addColorStop(1, 'rgba(197, 181, 253, 0)')
            }
          } else {
            // Default green gradient for null values
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)')
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
          }
          
          return gradient
        },
        fill: true, // Fill to the bottom (0 on Y-axis)
        tension: 0.4,
        borderWidth: 2,
        order: 2, // Draw on top (above baseline)
      },
      // Baseline Line (light purple dashed with gradient fill to transparent) - appears second in legend
      {
        label: 'Baseline',
        data: baselineDataArray,
        borderColor: '#C5B5FD',
        backgroundColor: (context: any) => {
          if (!context.chart.chartArea) {
            return 'rgba(197, 181, 253, 0.25)'
          }
          const ctx = context.chart.ctx
          const chart = context.chart
          const chartArea = chart.chartArea
          
          // Create gradient from baseline line position to bottom of chart
          const yScale = chart.scales.y
          const baselinePixel = yScale.getPixelForValue(baselineValue)
          const chartHeight = chartArea.bottom - chartArea.top
          
          const gradient = ctx.createLinearGradient(0, baselinePixel, 0, chartArea.bottom)
          
          // Purple gradient fading from baseline to transparent at bottom
          gradient.addColorStop(0, 'rgba(197, 181, 253, 0.25)')
          gradient.addColorStop(0.5, 'rgba(197, 181, 253, 0.125)')
          gradient.addColorStop(1, 'rgba(197, 181, 253, 0)')
          
          return gradient
        },
        borderDash: [5, 5],
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointBackgroundColor: '#C5B5FD',
        pointBorderColor: '#C5B5FD',
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#C5B5FD',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        tension: 0,
        order: 1, // Draw behind Daily Cost
      },
      // Projected Trend Line
      ...(projectionData.some(v => v != null) ? [{
        label: 'Projected Trend',
        data: projectionData,
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 4,
        fill: false,
        pointRadius: 0,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#f97316',
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#f97316',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        order: 3, // Draw third
      }] : []),
      // Worst-case Projection Line
      ...(worstCaseData.some(v => v != null) ? [{
        label: 'Worst-case Projection',
        data: worstCaseData,
        borderColor: '#ec4899',
        backgroundColor: 'transparent',
        borderDash: [2, 4],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ec4899',
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#ec4899',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        order: 4, // Draw fourth
      }] : []),
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: false,
          boxWidth: 20,
          boxHeight: 1,
          padding: 15,
          font: {
            size: 12,
            color: '#374151',
          },
          generateLabels: function(chart: any) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original(chart);
            
            // Define the desired order
            const order = ['Daily Cost', 'Baseline', 'Projected Trend', 'Worst-case Projection'];
            
            // Sort labels according to the desired order
            labels.sort((a: any, b: any) => {
              const indexA = order.indexOf(a.text);
              const indexB = order.indexOf(b.text);
              // If not found in order array, put at the end
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });
            
            // All items use stroke style (lines) only, no filled boxes
            labels.forEach((label: any) => {
              if (label.text === 'Daily Cost') {
                label.fillStyle = 'transparent';
                label.strokeStyle = '#10b981';
                label.lineWidth = 2;
                label.boxWidth = 20;
                label.boxHeight = 1;
              } else if (label.text === 'Baseline') {
                label.fillStyle = 'transparent';
                label.strokeStyle = '#C5B5FD';
                label.lineWidth = 2;
                label.borderDash = [5, 5];
                label.boxWidth = 20;
                label.boxHeight = 1;
              } else if (label.text === 'Projected Trend') {
                label.fillStyle = 'transparent';
                label.strokeStyle = '#f97316';
                label.lineWidth = 2;
                label.borderDash = [5, 5];
                label.boxWidth = 20;
                label.boxHeight = 1;
              } else if (label.text === 'Worst-case Projection') {
                label.fillStyle = 'transparent';
                label.strokeStyle = '#ec4899';
                label.lineWidth = 2;
                label.borderDash = [2, 4];
                label.boxWidth = 20;
                label.boxHeight = 1;
              }
            });
            return labels;
          },
        },
      },
      tooltip: {
        backgroundColor: '#374151',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4b5563',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        intersect: false,
        mode: 'index' as const,
        filter: function(tooltipItem: any) {
          // Only show items that have valid values
          return tooltipItem.parsed.y !== null && tooltipItem.parsed.y !== undefined
        },
        callbacks: {
          title: function(context: any) {
            return context[0].label || ''
          },
          label: function() {
            // Return empty string to hide default labels
            // We'll show all labels in afterBody in the correct order
            return ''
          },
          afterBody: function(context: any) {
            // Define the desired order
            const order = ['Worst-case Projection', 'Projected Trend', 'Daily Cost', 'Baseline']
            
            // Filter out items with null/undefined values and sort by desired order
            const validItems = context.filter((item: any) => 
              item.parsed.y !== null && item.parsed.y !== undefined
            )
            
            const sortedItems = [...validItems].sort((a: any, b: any) => {
              const labelA = a.dataset.label || ''
              const labelB = b.dataset.label || ''
              const indexA = order.indexOf(labelA)
              const indexB = order.indexOf(labelB)
              
              // If not found in order, put at end
              if (indexA === -1) return 1
              if (indexB === -1) return -1
              return indexA - indexB
            })
            
            // Return sorted labels
            return sortedItems.map((item: any) => {
              const datasetLabel = item.dataset.label || ''
              let label = ''
              
              if (datasetLabel === 'Daily Cost') {
                label = 'Daily Cost: '
              } else if (datasetLabel === 'Baseline') {
                label = 'Baseline: '
              } else if (datasetLabel === 'Projected Trend') {
                label = 'Projected Trend: '
              } else if (datasetLabel === 'Worst-case Projection') {
                label = 'Worst-case Projection: '
              } else {
                label = datasetLabel + ': '
              }
              
              label += formatCurrency(item.parsed.y)
              return label
            })
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        offset: false,
        beginAtZero: true,
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
          drawBorder: false,
          borderDash: [5, 5],
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
          callback: function(value: any) {
            return formatCurrency(value)
          },
        },
        afterFit: function(scale: any) {
          // Add padding to top to prevent clipping of worst-case projection line
          scale.paddingTop = 20
        },
      },
    },
  }

  return (
    <div style={{ width: "100%", height: `${height}px`, minHeight: `${height}px` }}>
      <Line data={chartConfig} options={options} plugins={[verticalLinePlugin]} />
    </div>
  )
}

