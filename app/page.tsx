"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FacultyDataTable } from "@/components/data-tables/faculty-data-table"
import { DepartmentDataTable } from "@/components/data-tables/department-data-table"
import { ClassesDataTable } from "@/components/data-tables/classes-data-table"
import { StudentDataTable } from "@/components/data-tables/student-data-table"
import { CoursesDataTable } from "@/components/data-tables/courses-data-table"
import { UsersDataTable } from "@/components/data-tables/users-data-table"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">University Management System</h1>
          <p className="text-muted-foreground">
            Manage your University's faculties, departments, classes, students, courses, and users.
          </p>
        </div>

        <Tabs defaultValue="faculty" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="faculty">
            <FacultyDataTable />
          </TabsContent>

          <TabsContent value="department">
            <DepartmentDataTable />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesDataTable />
          </TabsContent>

          <TabsContent value="student">
            <StudentDataTable />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesDataTable />
          </TabsContent>

          <TabsContent value="users">
            <UsersDataTable />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
