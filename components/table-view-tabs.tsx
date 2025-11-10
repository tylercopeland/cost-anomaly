"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, MoreHorizontal, Pencil, Trash2, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { TableView } from "@/hooks/use-table-views"

interface TableViewTabsProps {
  views: TableView[]
  activeViewId: string
  onViewChange: (viewId: string) => void
  onSaveView: (name: string) => void
  onUpdateView: () => void // Add prop to update current view
  onDeleteView: (viewId: string) => void
  onRenameView: (viewId: string, newName: string) => void
  hasUnsavedChanges: boolean // Add prop to indicate unsaved changes
}

export function TableViewTabs({
  views,
  activeViewId,
  onViewChange,
  onSaveView,
  onUpdateView, // Destructure new prop
  onDeleteView,
  onRenameView,
  hasUnsavedChanges, // Destructure new prop
}: TableViewTabsProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [viewName, setViewName] = useState("")
  const [renamingViewId, setRenamingViewId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredViews = views

  const activeView = filteredViews.find((view) => view.id === activeViewId)
  const isDefaultView = activeView?.isDefault ?? false
  const isPermanentView = activeView?.isPermanent ?? false

  const handleViewChange = (viewId: string) => {
    startTransition(() => {
      onViewChange(viewId)
    })
  }

  const handleSaveView = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim())
      setViewName("")
      setIsSaveDialogOpen(false)
    }
  }

  const handleRenameView = () => {
    if (viewName.trim() && renamingViewId) {
      onRenameView(renamingViewId, viewName.trim())
      setViewName("")
      setRenamingViewId(null)
      setIsRenameDialogOpen(false)
    }
  }

  const openRenameDialog = (view: TableView) => {
    setRenamingViewId(view.id)
    setViewName(view.name)
    setIsRenameDialogOpen(true)
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border bg-background">
        <div className="flex items-center gap-1">
          {filteredViews.map((view) => (
            <div
              key={view.id}
              onClick={() => handleViewChange(view.id)}
              className={`flex items-center gap-1 px-3 py-2 border-b-2 transition-all duration-200 ease-in-out cursor-pointer group ${
                activeViewId === view.id
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="text-sm flex items-center gap-1">
                {view.isDefault ? "Default View" : view.name}
                {activeViewId === view.id && hasUnsavedChanges && !view.isDefault && !view.isPermanent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Unsaved changes" />
                )}
              </span>
              {!view.isDefault && !view.isPermanent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`transition-opacity p-0.5 hover:bg-accent rounded ${
                        activeViewId === view.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => openRenameDialog(view)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteView(view.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
          {hasUnsavedChanges && !isDefaultView && !activeView?.isPermanent && (
            <Button variant="default" size="sm" onClick={onUpdateView} className="h-8 gap-1.5 ml-2">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          )}
          {/* New View button now visible in all tabs */}
          <button
            onClick={() => setIsSaveDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 ease-in-out cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New View
          </button>
        </div>
      </div>

      {/* Save View Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as New View</DialogTitle>
            <DialogDescription>Save your current filters and group by settings as a new view.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="View name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveView()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={!viewName.trim()}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename View Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename View</DialogTitle>
            <DialogDescription>Enter a new name for this view.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="View name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameView()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameView} disabled={!viewName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
