"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  School,
  Users,
  X,
  BookCheck,
  Coins,
  BarChart2,
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
  const { user } = useAuth()

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileOpen])

  // Show links based on role
  const role = user?.role
  const isAdmin = role === "admin"
  const isOfficer = role === "officer"
  const isTeacher = role === "teacher"

  return (
    <>
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden" onClick={toggleMobileMenu}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <aside
        className={cn(
          "z-30 flex flex-col border-r bg-background transition-all duration-300",
          "fixed inset-y-0 left-0 w-72 md:static",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          open ? "md:w-72" : "md:w-20",
          className,
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-6", !open && "md:justify-center md:px-0")}>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <School className="h-6 w-6" />
            {(open || isMobileOpen) && <span className="text-lg">EduAdmin</span>}
          </Link>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 md:hidden" onClick={toggleMobileMenu}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close Menu</span>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="flex flex-col gap-2">
            <Link href="/" className={cn("flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground", !open && "md:justify-center md:px-0")}>
              <LayoutDashboard className="h-4 w-4" />
              {(open || isMobileOpen) && <span>Xogta Guud</span>}
            </Link>

            {(isAdmin || isOfficer || isTeacher) && (open || isMobileOpen) && (
              <div className="mt-2 px-3 text-xs font-semibold text-muted-foreground">Academic</div>
            )}

            {isAdmin && (
              <>
                <SidebarLink href="/departments" icon={BookOpen} label="Xarumaha" open={open} isMobileOpen={isMobileOpen} />
                <SidebarLink href="/classes" icon={GraduationCap} label="Fasalada" open={open} isMobileOpen={isMobileOpen} />
                <SidebarLink href="/students" icon={Users} label="Ardayda" open={open} isMobileOpen={isMobileOpen} />
                <SidebarLink href="/courses" icon={BookOpen} label="Maadooyinka" open={open} isMobileOpen={isMobileOpen} />
              </>
            )}

            {(isAdmin || isTeacher) && (
              <SidebarLink href="/attendances" icon={BookCheck} label="Xaadirinta" open={open} isMobileOpen={isMobileOpen} />
            )}

            {(isAdmin || isOfficer || isTeacher) && (
              <SidebarLink href="/exams" icon={GraduationCap} label="Imtixanadka" open={open} isMobileOpen={isMobileOpen} />
            )}

            {(isAdmin || isOfficer) && (
              <>
                <SidebarLink href="/reports" icon={BarChart2} label="Reports" open={open} isMobileOpen={isMobileOpen} />
                <SidebarLink href="/finances" icon={Coins} label="Lacag Bixinada" open={open} isMobileOpen={isMobileOpen} />
              </>
            )}

            {isAdmin && (open || isMobileOpen) && (
              <>
                <div className="mt-2 px-3 text-xs font-semibold text-muted-foreground">Administration</div>
                <SidebarLink href="/users" icon={Users} label="Users" open={open} isMobileOpen={isMobileOpen} />
              </>
            )}
          </nav>
        </ScrollArea>

        {(open || isMobileOpen) && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{user?.fullname?.charAt(0).toUpperCase() || "U"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.fullname || "User"} </p>
                  <p className="text-xs text-muted-foreground">{user?.email || "example@email.com"}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        )}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
      )}
    </>
  )
}

// 🔧 Mini helper component for DRY sidebar links
function SidebarLink({ href, icon: Icon, label, open, isMobileOpen }: { href: string, icon: any, label: string, open: boolean, isMobileOpen: boolean }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground", !open && "md:justify-center md:px-0")}
    >
      <Icon className="h-4 w-4" />
      {(open || isMobileOpen) && <span>{label}</span>}
    </Link>
  )
}
