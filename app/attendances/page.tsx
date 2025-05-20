"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceDataTable } from "@/components/data-tables/attendance-data-table"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function ManagementPage() {

  return (
    <DashboardLayout>
    <div className="container mx-auto py-4">
      <Tabs defaultValue="attendance">
          <TabsList className="inline-flex w-full">
            <TabsTrigger value="attendance" className="w-full">Attendance</TabsTrigger>
          </TabsList>
        <TabsContent value="attendance">
          <AttendanceDataTable />
        </TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
  )
}
