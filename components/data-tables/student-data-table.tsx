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
import { StudentDialog } from "@/components/forms/student-form"
import { Badge } from "@/components/ui/badge"
import type { Faculty } from "./faculty-data-table"
import type { Classes } from "./classes-data-table"

// Define the Student type
export type Student = {
  id: string
  facultyId: string
  facultyName: string
  classId: string
  className: string
  name: string
  gender: "Male" | "Female" | "Other"
  parentPhone: string
  phone: string
  studentId: string
  passcode: string
  status: "active" | "inactive"
}

// Sample data
const data: Student[] = [
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

// Sample faculties for the form
export const faculties: Faculty[] = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Business" },
  { id: "3", name: "Medicine" },
  { id: "4", name: "Arts and Sciences" },
  { id: "5", name: "Education" },
]

// Sample classes for the form
export const classes: Classes[] = [
  {
    id: "1",
    facultyId: "1",
    facultyName: "Engineering",
    departmentId: "1",
    departmentName: "Computer Science",
    semesterName: 1,
    classMode: "full time",
    type: "A",
    status: "active",
  },
  {
    id: "2",
    facultyId: "1",
    facultyName: "Engineering",
    departmentId: "2",
    departmentName: "Electrical Engineering",
    semesterName: 2,
    classMode: "part time",
    type: "B",
    status: "active",
  },
  {
    id: "3",
    facultyId: "2",
    facultyName: "Business",
    departmentId: "3",
    departmentName: "Marketing",
    semesterName: 3,
    classMode: "full time",
    type: "C",
    status: "inactive",
  },
  {
    id: "4",
    facultyId: "2",
    facultyName: "Business",
    departmentId: "4",
    departmentName: "Finance",
    semesterName: 4,
    classMode: "part time",
    type: "D",
    status: "active",
  },
  {
    id: "5",
    facultyId: "3",
    facultyName: "Medicine",
    departmentId: "5",
    departmentName: "Nursing",
    semesterName: 1,
    classMode: "full time",
    type: "A",
    status: "active",
  },
]

// Define columns
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "studentId",
    header: "Student ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "facultyName",
    header: "Faculty",
  },
  {
    accessorKey: "className",
    header: "Class",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant={status === "active" ? "success" : "destructive"}>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original

      return (
        <div className="flex items-center gap-2">
          <StudentDialog mode="edit" student={student} />
          <StudentDialog mode="delete" student={student} />
        </div>
      )
    },
  },
]

export function StudentDataTable() {
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
          placeholder="Filter students..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <StudentDialog mode="add" />
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
