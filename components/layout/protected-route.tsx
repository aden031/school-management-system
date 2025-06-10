"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip redirect for login page to avoid redirect loops
    if (!isAuthenticated && pathname !== "/login" && pathname !== "/studentportal") {
      router.push("/login")
    }
  }, [isAuthenticated, router, pathname])

  // If not authenticated and not on login page, don't render children
  if (!isAuthenticated && pathname !== "/login" && pathname !== "/studentportal") {
    return null
  }

  return <>{children}</>
}
