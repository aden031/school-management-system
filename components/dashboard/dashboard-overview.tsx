"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Users,
  ArrowRight,
  Bell,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

interface DashboardOverviewProps {
  user: {
  id: string
  fullName: string
  email: string
  title: "user" | "dean" | "teacher" | "officer"
  status: "active" | "inactive"
} | null
}



export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<{
    totalStudents: number
    totalFaculty: number
    totalDepartments: number
    totalCourses: number
  } | null>(null)
  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  useEffect(()=>{
      axios.get('/api/stats').then(data=>{
        setStats(data.data)
      })
  },[])


  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.fullname || "Unknown"}
        </h1>
        <p className="text-muted-foreground">
          Welcome to your School management dashboard. Here's what's happening today.
        </p>
      </section>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Students"
              value={`${stats?.totalStudents}`}
              description="+12% from last month"
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Active Courses"
              value={`${stats?.totalCourses}`}
              description="Across 8 departments"
              icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Total Departments"
              value={`${stats?.totalDepartments}`}
              description="12 new this semester"
              icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />}
            />
          </div>

          {/* Quick Actions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                title="Add Student"
                description="Register a new student"
                icon={<Users className="h-5 w-5" />}
                href="/students"
              />
              <QuickActionCard
                title="Manage Courses"
                description="View and edit courses"
                icon={<BookOpen className="h-5 w-5" />}
                href="/courses"
              />
              <QuickActionCard
                title="Faculty Directory"
                description="Browse faculty members"
                icon={<Building2 className="h-5 w-5" />}
                href="/faculties"
              />
            </div>
          </section>

        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and notifications from your School.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  title="New student registration"
                  description="Hamza was registered in Computer Science department"
                  time="10 minutes ago"
                  icon={<Users className="h-4 w-4" />}
                />
                <ActivityItem
                  title="Course schedule updated"
                  description="Introduction to Programming schedule was modified"
                  time="1 hour ago"
                  icon={<BookOpen className="h-4 w-4" />}
                />
                <ActivityItem
                  title="Faculty meeting reminder"
                  description="Department heads meeting tomorrow at 10:00 AM"
                  time="2 hours ago"
                  icon={<Bell className="h-4 w-4" />}
                />
                <ActivityItem
                  title="Grades submitted"
                  description="Prof. Smith submitted grades for Advanced Mathematics"
                  time="Yesterday"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <ActivityItem
                  title="New department proposal"
                  description="Review proposal for Data Science department"
                  time="2 days ago"
                  icon={<Building2 className="h-4 w-4" />}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Management System Access */}
      <section className="pt-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Access Full Management System
            </CardTitle>
            <CardDescription>
              Navigate to the complete School management interface with detailed controls and data management.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-col gap-2 w-full">
              <Link href="/departments" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Departments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/students" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Students
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/classes" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Classes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/users" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Users
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}

// Stats Card Component
function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Quick Action Card Component
function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent hover:shadow-md transition-all duration-200 cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

// Department Card Component
function DepartmentCard({
  name,
  studentCount,
  progress,
  facultyCount,
}: {
  name: string
  studentCount: number
  progress: number
  facultyCount: number
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{name}</CardTitle>
          <Badge variant="outline" className="font-normal">
            {facultyCount} Faculty
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Enrollment Progress</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">{studentCount} Students</span>
          <span className="text-muted-foreground">Target: {Math.round(studentCount / (progress / 100))}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Item Component
function ActivityItem({
  title,
  description,
  time,
  icon,
}: {
  title: string
  description: string
  time: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start space-x-4 rounded-md p-3 hover:bg-accent transition-colors">
      <div className="mt-0.5 bg-primary/10 p-2 rounded-full">{icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
