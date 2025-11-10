"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface M365LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (email: string) => void
}

export function M365LoginModal({ isOpen, onClose, onLoginSuccess }: M365LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLoginSuccess(email)
      onClose()
      // Reset form
      setEmail("")
      setPassword("")
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 3v8.5H3V3h8.5zm0 18H3v-8.5h8.5V21zm9.5 0h-8.5v-8.5H21V21zm0-9.5h-8.5V3H21v8.5z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Sign in to Microsoft 365</DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">Admin access required to action recommendations</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && email && password) {
                  handleLogin()
                }
              }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Note:</span> This is a prototype. Enter any credentials to simulate admin
              login.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-6 font-medium bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 font-medium shadow-sm"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
