"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RevisitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (snoozeDuration: string) => void
  selectedCount: number
}

export function RevisitModal({ isOpen, onClose, onConfirm, selectedCount }: RevisitModalProps) {
  const [snoozeDuration, setSnoozeDuration] = useState("")

  const handleConfirm = () => {
    if (snoozeDuration) {
      onConfirm(snoozeDuration)
      setSnoozeDuration("")
      onClose()
    }
  }

  const handleCancel = () => {
    setSnoozeDuration("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Snooze {selectedCount} {selectedCount === 1 ? "Recommendation" : "Recommendations"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1.5">
            The recommendation{selectedCount === 1 ? "" : "s"} will reappear in your feed after the selected duration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="space-y-2">
            <label htmlFor="snooze-duration" className="block text-sm font-semibold text-gray-700">
              Snooze Duration
            </label>
            <Select value={snoozeDuration} onValueChange={setSnoozeDuration}>
              <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Select snooze duration" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="6-months">6 Months</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel} className="h-10 px-6 font-medium bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!snoozeDuration}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50"
            >
              Snooze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
