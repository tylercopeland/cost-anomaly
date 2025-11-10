"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash, CheckCircle2, LogOut } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { M365LoginModal } from "@/components/m365-login-modal"

interface SelectedItem {
  id: number
  title: string
  savings: string
  savingsAmount: number
}

interface SendToIntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  selectedItems?: SelectedItem[]
  onRemoveItem?: (id: number) => void
  onConfirm: (integration: string) => void
  dataSource?: "cloud" | "saas" // Added dataSource prop to differentiate workflows
}

export function SendToIntegrationModal({
  isOpen,
  onClose,
  selectedCount,
  selectedItems = [],
  onRemoveItem,
  onConfirm,
  dataSource = "cloud", // Default to cloud for backward compatibility
}: SendToIntegrationModalProps) {
  const [selectedIntegration, setSelectedIntegration] = useState("azure-devops")
  const [actionType, setActionType] = useState<"integration" | "platform">(
    dataSource === "saas" ? "platform" : "integration",
  )
  const [m365Email, setM365Email] = useState<string>("")
  const [isM365LoggedIn, setIsM365LoggedIn] = useState(false)
  const [showM365Login, setShowM365Login] = useState(false)

  const handleExecute = () => {
    if (actionType === "platform" && !isM365LoggedIn) {
      setShowM365Login(true)
      return
    }

    onConfirm(actionType === "integration" ? selectedIntegration : "platform")
    onClose()
  }

  const handleM365LoginSuccess = (email: string) => {
    setIsM365LoggedIn(true)
    setM365Email(email)
    // Don't close the main modal or proceed with action yet
  }

  const handleM365SignOut = () => {
    setIsM365LoggedIn(false)
    setM365Email("")
  }

  const totalSavings = selectedItems.reduce((sum, item) => sum + item.savingsAmount, 0)
  const formattedTotalSavings = `£${totalSavings.toLocaleString()}`

  const showActionTypeSelection = dataSource === "saas"

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {showActionTypeSelection ? "Action recommendation" : "Send to integrations"}
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1.5">
              {showActionTypeSelection
                ? "Choose how you want to implement the selected recommendations."
                : "Select an integration to send the selected recommendations."}
            </p>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {selectedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
                    <span className="text-xs font-semibold text-blue-700">
                      {selectedItems.length} {selectedItems.length === 1 ? "recommendation" : "recommendations"}{" "}
                      selected
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <ScrollArea className="max-h-[240px]">
                    <div className="divide-y divide-gray-100">
                      {selectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium text-gray-900 truncate mb-0.5">{item.title}</p>
                            <p className="text-xs text-green-600 font-semibold">{item.savings}</p>
                          </div>
                          {onRemoveItem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 hover:bg-red-50 group flex items-center gap-1.5 rounded-md"
                              onClick={() => onRemoveItem(item.id)}
                            >
                              <Trash className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                              <span className="text-xs text-gray-500 group-hover:text-red-600 transition-colors font-medium">
                                Remove
                              </span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Total Savings</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{formattedTotalSavings}</div>
                      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                        Annual Savings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showActionTypeSelection && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Action Type</label>
                <Select
                  value={actionType}
                  onValueChange={(value) => setActionType(value as "integration" | "platform")}
                >
                  <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">On platform</SelectItem>
                    <SelectItem value="integration">Send to integration</SelectItem>
                  </SelectContent>
                </Select>
                {actionType === "platform" && !isM365LoggedIn && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 mb-1">Sign in required</p>
                      <p className="text-xs text-blue-700">Sign in with your M365 admin account to proceed.</p>
                    </div>
                    <Button
                      onClick={() => setShowM365Login(true)}
                      variant="link"
                      className="h-auto px-0 text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
                    >
                      Sign in
                    </Button>
                  </div>
                )}
                {actionType === "platform" && isM365LoggedIn && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-900">Signed in to Microsoft 365</p>
                      <p className="text-xs text-green-700 truncate">{m365Email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleM365SignOut}
                      className="h-7 px-2 hover:bg-green-100 text-green-700 hover:text-green-900"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs font-medium">Sign out</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(!showActionTypeSelection || actionType === "integration") && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Integration Plugin</label>
                <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                  <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="azure-devops">Azure DevOps</SelectItem>
                    <SelectItem value="jira">Jira Integration</SelectItem>
                    <SelectItem value="servicenow">ServiceNow</SelectItem>
                    <SelectItem value="slack">Slack Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="h-10 px-6 font-medium bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleExecute}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 font-medium shadow-sm"
                disabled={actionType === "platform" && !isM365LoggedIn}
              >
                {showActionTypeSelection ? (actionType === "integration" ? "Send" : "Action") : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <M365LoginModal
        isOpen={showM365Login}
        onClose={() => setShowM365Login(false)}
        onLoginSuccess={handleM365LoginSuccess}
      />
    </>
  )
}
