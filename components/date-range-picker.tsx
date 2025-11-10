"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, subDays, subMonths } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
}

type PresetRange = "alltime" | "7days" | "30days" | "90days" | "12months" | "custom"

export function DateRangePicker({ className, date, onDateChange }: DateRangePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<DateRange | undefined>(date)
  const [selectedPreset, setSelectedPreset] = React.useState<PresetRange>("alltime")
  const [open, setOpen] = React.useState(false)

  const handleDateChange = (newDate: DateRange | undefined) => {
    setSelectedDate(newDate)
    setSelectedPreset("custom")
    onDateChange?.(newDate)
  }

  const handlePresetSelect = (preset: PresetRange) => {
    setSelectedPreset(preset)

    if (preset === "alltime") {
      setSelectedDate(undefined)
      onDateChange?.(undefined)
      setOpen(false)
      return
    }

    if (preset === "custom") {
      return
    }

    const today = new Date()
    let from: Date

    switch (preset) {
      case "7days":
        from = subDays(today, 7)
        break
      case "30days":
        from = subDays(today, 30)
        break
      case "90days":
        from = subDays(today, 90)
        break
      case "12months":
        from = subMonths(today, 12)
        break
      default:
        return
    }

    const newRange = { from, to: today }
    setSelectedDate(newRange)
    onDateChange?.(newRange)
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "MMM dd, yyyy")} - {format(selectedDate.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(selectedDate.from, "MMM dd, yyyy")
              )
            ) : (
              <span>All Time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <div className="flex flex-col">
            {/* Preset buttons section */}
            <div className="px-3 py-3 space-y-2 border-b">
              <Button
                variant={selectedPreset === "alltime" ? "default" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => handlePresetSelect("alltime")}
              >
                All Time
              </Button>
              <Button
                variant={selectedPreset === "7days" ? "default" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => handlePresetSelect("7days")}
              >
                Last 7 days
              </Button>
              <Button
                variant={selectedPreset === "30days" ? "default" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => handlePresetSelect("30days")}
              >
                Last 30 days
              </Button>
              <Button
                variant={selectedPreset === "90days" ? "default" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => handlePresetSelect("90days")}
              >
                Last 90 days
              </Button>
              <Button
                variant={selectedPreset === "12months" ? "default" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => handlePresetSelect("12months")}
              >
                Last 12 months
              </Button>
              <Button
                variant={selectedPreset === "custom" ? "default" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => handlePresetSelect("custom")}
              >
                Custom
              </Button>
            </div>

            {selectedPreset === "custom" && (
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedDate?.from}
                selected={selectedDate}
                onSelect={handleDateChange}
                numberOfMonths={1}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
