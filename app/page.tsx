"use client"

import { useAuth } from "@/components/auth/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export default function Home() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <DashboardOverview user={user} />
    </DashboardLayout>
  )
}
