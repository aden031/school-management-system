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
import { CoursesDialog } from "@/components/forms/courses-form"
import type { Faculty } from "./faculty-data-table"
import type { Department } from "./department-data-table"

// Define the Courses type
export type Course = {
  id: string
  departmentId: string
  departmentName: string
  courseName: string
  code: string
  semester: number
  facultyId: string
  facultyName: string
}

// Sample data
const data: Course[] = [
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

// Sample faculties for the form
export const faculties: Faculty[] = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Business" },
  { id: "3", name: "Medicine" },
  { id: "4", name: "Arts and Sciences" },
  { id: "5", name: "Education" },
]

// Sample departments for the form
export const departments: Department[] = [
  { id: "1", facultyId: "1", facultyName: "Engineering", name: "Computer Science", sCount: 120, departmentMode: "CMS" },
  {
    id: "2",
    facultyId: "1",
    facultyName: "Engineering",
    name: "Electrical Engineering",
    sCount: 85,
    departmentMode: "CMS",
  },
  { id: "3", facultyId: "2", facultyName: "Business", name: "Marketing", sCount: 95, departmentMode: "CMS" },
  { id: "4", facultyId: "2", facultyName: "Business", name: "Finance", sCount: 110, departmentMode: "CMS" },
  { id: "5", facultyId: "3", facultyName: "Medicine", name: "Nursing", sCount: 75, departmentMode: "CMS" },
]

// Define columns
const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "courseName",
    header: "Course Name",
  },
  {
    accessorKey: "departmentName",
    header: "Department",
  },
  {
    accessorKey: "facultyName",
    header: "Faculty",
  },
  {
    accessorKey: "semester",
    header: "Semester",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original

      return (
        <div className="flex items-center gap-2">
          <CoursesDialog mode="edit" course={course} />
          <CoursesDialog mode="delete" course={course} />
        </div>
      )
    },
  },
]

export function CoursesDataTable() {
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
          placeholder="Filter courses..."
          value={(table.getColumn("courseName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("courseName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <CoursesDialog mode="add" />
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
