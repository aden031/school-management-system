"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassesDataTable } from "@/components/data-tables/classes-data-table"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Management System</h1>
          <p className="text-muted-foreground">
            Manage your School's   departments, classes, students, courses, and users.
          </p>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>
 

          <TabsContent value="classes">
            <ClassesDataTable />
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}
