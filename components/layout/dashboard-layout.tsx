"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen} user={user} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}
