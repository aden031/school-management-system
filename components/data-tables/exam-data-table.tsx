"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExamDialog } from "@/components/forms/exam-form"
import { Badge } from "@/components/ui/badge"
import type { Student } from "@/components/data-tables/student-data-table"
import type { Course } from "@/components/data-tables/courses-data-table"
import type { ExamType } from "@/components/data-tables/exam-type-data-table"
import { format } from "date-fns"

// Define the Exam type
export type Exam = {
  id: string
  studentId: string
  studentName: string
  examTypeId: string
  examTypeName: "midterm" | "final" | "quiz"
  courseId: string
  courseName: string
  marksObtained: number
  totalMarks: number
  date: string
}

// Sample data
const data: Exam[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Doe",
    examTypeId: "1",
    examTypeName: "midterm",
    courseId: "1",
    courseName: "Introduction to Programming",
    marksObtained: 25,
    totalMarks: 30,
    date: "2023-10-15",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Jane Smith",
    examTypeId: "2",
    examTypeName: "final",
    courseId: "1",
    courseName: "Introduction to Programming",
    marksObtained: 45,
    totalMarks: 50,
    date: "2023-12-20",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Bob Johnson",
    examTypeId: "3",
    examTypeName: "quiz",
    courseId: "2",
    courseName: "Data Structures",
    marksObtained: 8,
    totalMarks: 10,
    date: "2023-09-05",
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Alice Brown",
    examTypeId: "1",
    examTypeName: "midterm",
    courseId: "3",
    courseName: "Circuit Analysis",
    marksObtained: 22,
    totalMarks: 30,
    date: "2023-10-18",
  },
  {
    id: "5",
    studentId: "5",
    studentName: "Charlie Wilson",
    examTypeId: "2",
    examTypeName: "final",
    courseId: "4",
    courseName: "Marketing Principles",
    marksObtained: 42,
    totalMarks: 50,
    date: "2023-12-22",
  },
]

// Sample students for the form
export const students: Student[] = [
  {
    id: "1",
    facultyId: "1",
    facultyName: "Engineering",
    classId: "1",
    className: "Computer Science - Semester 1",
    name: "John Doe",
    gender: "Male",
    parentPhone: "+1234567890",
    phone: "+1234567891",
    studentId: "ENG001",
    passcode: "1234",
    status: "active",
  },
  {
    id: "2",
    facultyId: "1",
    facultyName: "Engineering",
    classId: "2",
    className: "Electrical Engineering - Semester 2",
    name: "Jane Smith",
    gender: "Female",
    parentPhone: "+1234567892",
    phone: "+1234567893",
    studentId: "ENG002",
    passcode: "1234",
    status: "active",
  },
  {
    id: "3",
    facultyId: "2",
    facultyName: "Business",
    classId: "3",
    className: "Marketing - Semester 3",
    name: "Bob Johnson",
    gender: "Male",
    parentPhone: "+1234567894",
    phone: "+1234567895",
    studentId: "BUS001",
    passcode: "1234",
    status: "inactive",
  },
  {
    id: "4",
    facultyId: "2",
    facultyName: "Business",
    classId: "4",
    className: "Finance - Semester 4",
    name: "Alice Brown",
    gender: "Female",
    parentPhone: "+1234567896",
    phone: "+1234567897",
    studentId: "BUS002",
    passcode: "1234",
    status: "active",
  },
  {
    id: "5",
    facultyId: "3",
    facultyName: "Medicine",
    classId: "5",
    className: "Nursing - Semester 1",
    name: "Charlie Wilson",
    gender: "Other",
    parentPhone: "+1234567898",
    phone: "+1234567899",
    studentId: "MED001",
    passcode: "1234",
    status: "active",
  },
]

// Sample courses for the form
export const courses: Course[] = [
  {
    id: "1",
    departmentId: "1",
    departmentName: "Computer Science",
    courseName: "Introduction to Programming",
    code: "CS101",
    semester: 1,
    facultyId: "1",
    facultyName: "Engineering",
  },
  {
    id: "2",
    departmentId: "1",
    departmentName: "Computer Science",
    courseName: "Data Structures",
    code: "CS201",
    semester: 2,
    facultyId: "1",
    facultyName: "Engineering",
  },
  {
    id: "3",
    departmentId: "2",
    departmentName: "Electrical Engineering",
    courseName: "Circuit Analysis",
    code: "EE101",
    semester: 1,
    facultyId: "1",
    facultyName: "Engineering",
  },
  {
    id: "4",
    departmentId: "3",
    departmentName: "Marketing",
    courseName: "Marketing Principles",
    code: "MKT101",
    semester: 1,
    facultyId: "2",
    facultyName: "Business",
  },
  {
    id: "5",
    departmentId: "4",
    departmentName: "Finance",
    courseName: "Financial Accounting",
    code: "FIN101",
    semester: 1,
    facultyId: "2",
    facultyName: "Business",
  },
]

// Sample exam types for the form
export const examTypes: ExamType[] = [
  {
    id: "1",
    name: "midterm",
    marks: 30,
    description: "Mid-semester examination",
  },
  {
    id: "2",
    name: "final",
    marks: 50,
    description: "End of semester examination",
  },
  {
    id: "3",
    name: "quiz",
    marks: 10,
    description: "Regular class quiz",
  },
]

// Define columns
const columns: ColumnDef<Exam>[] = [
  {
    accessorKey: "studentName",
    header: "Student",
  },
  {
    accessorKey: "courseName",
    header: "Course",
  },
  {
    accessorKey: "examTypeName",
    header: "Exam Type",
    cell: ({ row }) => {
      const examType = row.getValue("examTypeName") as string
      return (
        <Badge
          variant={examType === "midterm" ? "default" : examType === "final" ? "destructive" : "outline"}
          className="capitalize"
        >
          {examType}
        </Badge>
      )
    },
  },
  {
    accessorKey: "marksObtained",
    header: "Marks Obtained",
    cell: ({ row }) => {
      const marksObtained = row.getValue("marksObtained") as number
      const totalMarks = row.original.totalMarks
      const percentage = Math.round((marksObtained / totalMarks) * 100)

      let badgeVariant: "default" | "destructive" | "outline" | "success" = "outline"
      if (percentage >= 80) badgeVariant = "success"
      else if (percentage >= 60) badgeVariant = "default"
      else if (percentage < 40) badgeVariant = "destructive"

      return (
        <div className="flex items-center gap-2">
          <span>
            {marksObtained}/{totalMarks}
          </span>
          <Badge variant={badgeVariant}>{percentage}%</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string
      return format(new Date(date), "PPP")
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const exam = row.original

      return (
        <div className="flex items-center gap-2">
          <ExamDialog mode="edit" exam={exam} />
          <ExamDialog mode="delete" exam={exam} />
        </div>
      )
    },
  },
]

export function ExamDataTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by student name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("studentName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <ExamDialog mode="add" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
