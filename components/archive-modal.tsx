"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface ArchiveModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  selectedCount: number
}

export function ArchiveModal({ isOpen, onClose, onConfirm, selectedCount }: ArchiveModalProps) {
  const [note, setNote] = useState("")

  const handleConfirm = () => {
    if (note.trim()) {
      onConfirm(note)
      setNote("")
      onClose()
    }
  }

  const handleCancel = () => {
    setNote("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleCancel} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Archive {selectedCount} {selectedCount === 1 ? "Recommendation" : "Recommendations"}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <label htmlFor="archive-note" className="block text-sm font-medium text-gray-700 mb-2">
              Archive Note <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="archive-note"
              placeholder="Please provide a reason for archiving these recommendations..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">This note will be logged in the activity history.</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!note.trim()}>
              Archive
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
