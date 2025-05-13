"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

interface User {
  email: string
  name: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you would validate credentials with your backend
      // For demo purposes, we'll accept any valid email/password
      if (email && password.length >= 6) {
        const user = {
          email,
          name: "Admin User",
          role: "admin",
        }

        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(user))

        // Update state
        setUser(user)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("user")

    // Update state
    setUser(null)
    setIsAuthenticated(false)
  }

  // Provide a loading state to avoid flash of content
  if (loading) {
    return null
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
