"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Building2,
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  University,
  Settings,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "../auth/auth-context"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DashboardSidebar({ className, open = true, onOpenChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const {user}=useAuth()
  // Handle mobile menu separately from desktop sidebar state
  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Close mobile menu on window resize (if screen becomes larger)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile menu button - visible only on mobile */}
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden" onClick={toggleMobileMenu}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar - different behavior on mobile vs desktop */}
      <aside
        className={cn(
          "z-30 flex flex-col border-r bg-background transition-all duration-300",
          // Mobile: fixed positioning with transform
          "fixed inset-y-0 left-0 w-72 md:static",
          // Mobile: show/hide based on isMobileOpen
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop: width based on open state
          open ? "md:w-72" : "md:w-20",
          className,
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-6", !open && "md:justify-center md:px-0")}>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <University className="h-6 w-6" />
            {(open || isMobileOpen) && <span className="text-lg">EduAdmin</span>}
          </Link>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 md:hidden" onClick={toggleMobileMenu}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close Menu</span>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Dashboard</span>}
            </Link>
            {(open || isMobileOpen) && (
              <div className="mt-2 px-3 text-xs font-semibold text-muted-foreground">Academic</div>
            )}
            <Link
              href="/faculties"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <Building2 className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Faculties</span>}
            </Link>
            <Link
              href="/departments"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <BookOpen className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Departments</span>}
            </Link>
            <Link
              href="/classes"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <GraduationCap className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Classes</span>}
            </Link>
            <Link
              href="/students"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <Users className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Students</span>}
            </Link>
            <Link
              href="/courses"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <BookOpen className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Courses</span>}
            </Link>
            <Link
              href="exams"
              className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              !open && "md:justify-center md:px-0",
              )}
            >
              <GraduationCap className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Exams</span>}
            </Link>
            {(open || isMobileOpen) && (
              <div className="mt-2 px-3 text-xs font-semibold text-muted-foreground">Administration</div>
            )}
            <Link
              href="/users"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                !open && "md:justify-center md:px-0",
              )}
            >
              <Users className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Users</span>}
            </Link>
          </nav>
        </ScrollArea>
        {(open || isMobileOpen) && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">AD</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.fullname || "Admin user"} </p>
                  <p className="text-xs text-muted-foreground">{user?.email || "admin@gmail.com"}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay - only visible when mobile menu is open */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
      )}
    </>
  )
}
