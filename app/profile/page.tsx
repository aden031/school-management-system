"use client"

import { EditProfileForm } from "@/components/profile/edit-profile-form"
import { useAuth } from "@/components/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md p-6 text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">You need to be logged in to view and edit your profile.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <Card className="w-full  mx-auto">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProfileForm currentUser={user} />
        </CardContent>
      </Card>
      </DashboardLayout>
  )
}
