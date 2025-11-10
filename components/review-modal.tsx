"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  selectedCount: number
}

export function ReviewModal({ isOpen, onClose, onConfirm, selectedCount }: ReviewModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark for Review</DialogTitle>
          <DialogDescription>
            Add a note explaining why {selectedCount === 1 ? "this recommendation is" : "these recommendations are"}{" "}
            being marked for review.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Enter your review note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!note.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
