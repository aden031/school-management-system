"use client"

import axios from "axios"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

type Role = "parent" | "teacher" | "officer"

interface User {
  email: string
  fullname: string
  role: Role
  phone?: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
      const response = await axios.post("/api/users/user/login", {
        Email: email, // backend expects capital "E"
        password,
      })

      if (response.status === 200) {
        const data = response.data

        const user: User = {
          email: data.Email,
          fullname:data.FullName,
          role:data.Title,
          phone:data?.phone || null
        }

        localStorage.setItem("user", JSON.stringify(user))
        setUser(user)
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error: any) {
      console.error("Login failed:", error?.response?.data || error.message)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
