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
  title: "user"  | "teacher" | "officer" | "admin"
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
    if (hour < 12) return "Subax wanaagsan"
    if (hour < 18) return "Galab Wanaagsan"
    return "Fiidnimo wacan"
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
          Ku soo dhawoow barta maamulka iskuulka. Waa kuwan waxyaabaha maanta dhacaya.
        </p>
      </section>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Guudmar</TabsTrigger>
            <TabsTrigger value="activity">Waxqabad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Ardayda Guud"
              value={`${stats?.totalStudents}`}
              description="+12% bishii hore"
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Maadooyinka Ladhigto"
              value={`${stats?.totalCourses}`}
              description="8 waaxood guud ahaan"
              icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
            />
            <StatsCard
              title="Xarumaha Guud"
              value={`${stats?.totalDepartments}`}
              description="12 cusub faslakan-kan"
              icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />}
            />
            </div>

          {/* Quick Actions */}
            <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Ficilo Degdeg ah</h2>
              <Button variant="outline" size="sm">
              Dhammaan eeg
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <QuickActionCard
              title="Ku dar Arday"
              description="Diiwaan geli arday cusub"
              icon={<Users className="h-5 w-5" />}
              href="/students"
              />
              <QuickActionCard
              title="Maamul Maadooyinka"
              description="Eeg oo wax ka beddel maadooyinka"
              icon={<BookOpen className="h-5 w-5" />}
              href="/courses"
              />
            </div>
            </section>

        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Waxqabadkii Ugu Dambeeyay</CardTitle>
              <CardDescription>Fariimaha iyo falalka ugu dambeeyay ee ka dhacay iskuulkaaga.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
          <ActivityItem
            title="Diiwaangelin arday cusub"
            description="Hamza waxaa loo diiwaangeliyay waaxda Computer Science"
            time="10 daqiiqo kahor"
            icon={<Users className="h-4 w-4" />}
          />
          <ActivityItem
            title="Jadwalka maadada waa la cusbooneysiiyay"
            description="Jadwalka 'Hordhac Barnaamij Sameynta' waa la beddelay"
            time="1 saac kahor"
            icon={<BookOpen className="h-4 w-4" />}
          />
          <ActivityItem
            title="Xasuusin kulan macallimiin"
            description="Kulanka madaxda waaxyaha berri 10:00 subaxnimo"
            time="2 saac kahor"
            icon={<Bell className="h-4 w-4" />}
          />
          <ActivityItem
            title="Darajooyin la gudbiyay"
            description="Prof. ahmed wuxuu gudbiyay darajooyinka 'Xisaabta Sare'"
            time="Shalay"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <ActivityItem
            title="Soo jeedin waax cusub"
            description="Dib u eegis ku samee soo jeedinta waaxda Data Science"
            time="2 maalmood kahor"
            icon={<Building2 className="h-4 w-4" />}
          />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
          Dhammaan Waxqabadka Daaawo
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
          Gal Nidaamka Maamulka Buuxa
        </CardTitle>
        <CardDescription>
          U gudub interface-ka maamulka iskuulka oo dhameystiran, si aad u hesho xakameyn iyo maarayn xog faahfaahsan.
        </CardDescription>
          </CardHeader>
          <CardFooter>
        <div className="flex flex-col gap-2 w-full">
          <Link href="/departments" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-between">
          Xarumaha
          <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/students" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-between">
          Ardayda
          <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/classes" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-between">
          Fasalada
          <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/courses" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-between">
          Maadooyinka
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
