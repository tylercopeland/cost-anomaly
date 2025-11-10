"use client"

import { Button } from "@/components/ui/button"
import { X, AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemTitle: string
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemTitle }: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-[70] p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Recommendation</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Are you sure you want to permanently delete this recommendation?</p>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{itemTitle}</p>
          </div>
          <p className="text-sm text-red-600 mt-3 font-medium">This action cannot be undone.</p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Delete
          </Button>
        </div>
      </div>
    </>
  )
}
