"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FacultyDataTable } from "@/components/data-tables/faculty-data-table"
import { DepartmentDataTable } from "@/components/data-tables/department-data-table"
import { ClassesDataTable } from "@/components/data-tables/classes-data-table"
import { StudentDataTable } from "@/components/data-tables/student-data-table"
import { CoursesDataTable } from "@/components/data-tables/courses-data-table"
import { UsersDataTable } from "@/components/data-tables/users-data-table"
import { ExamTypeDataTable } from "@/components/data-tables/exam-type-data-table"
import { ExamDataTable } from "@/components/data-tables/exam-data-table"
import { FeeDataTable } from "@/components/data-tables/fee-data-table"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ManagementPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState("faculty")

  useEffect(() => {
    if (
      tabParam &&
      ["faculty", "department", "classes", "student", "courses", "users", "examtype", "exam", "fee"].includes(tabParam)
    ) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Management System</h1>
          <p className="text-muted-foreground">
            Manage your school's faculties, departments, classes, students, courses, exams, fees, and users.
          </p>
        </div>

        <Tabs defaultValue="fee" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="fee" className="w-full">Fee</TabsTrigger>
            </TabsList>


          <TabsContent value="fee">
            <FeeDataTable />
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}
