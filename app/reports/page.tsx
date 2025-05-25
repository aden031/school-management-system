"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentReport } from "@/components/reports/student-report"
import { ClassReport } from "@/components/reports/class-report"
import { FeeReport } from "@/components/reports/fee-report"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("student")

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate comprehensive reports for students, classes, and fees.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student">Student Report</TabsTrigger>
            <TabsTrigger value="class">Class Report</TabsTrigger>
            <TabsTrigger value="fee">Fee Report</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="mt-6">
            <StudentReport />
          </TabsContent>

          <TabsContent value="class" className="mt-6">
            <ClassReport />
          </TabsContent>

          <TabsContent value="fee" className="mt-6">
            <FeeReport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
