"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/components/auth/auth-context"

export default function LoginPage() {
  const { isAuthenticated , user} = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      if (user?.role === "parent") {
        router.push("/parent")
      } else {
        router.push("/")
      }
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
