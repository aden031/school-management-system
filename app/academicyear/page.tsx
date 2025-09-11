"use client"


import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AcademicYearDataTable } from "@/components/data-tables/academic-year-data-table"
import { AcademicYearDialog } from "@/components/forms/academic-year-form"
import DashboardLayout from "@/components/layout/dashboard-layout"


export default function AcademicYearPage() {
  const [refresh, setRefresh] = React.useState(0)
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4">
        <Tabs defaultValue="academicyear">
          <TabsList className="inline-flex w-full">
            <TabsTrigger value="academicyear" className="w-full">Academic Years</TabsTrigger>
          </TabsList>
          <TabsContent value="academicyear">
            <div className="mb-4">
              <AcademicYearDialog onSuccess={() => setRefresh(r => r + 1)} />
            </div>
            <AcademicYearDataTable key={refresh} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
