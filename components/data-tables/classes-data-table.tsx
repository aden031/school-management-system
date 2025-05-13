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
import { ClassesDialog } from "@/components/forms/classes-form"
import { Badge } from "@/components/ui/badge"
import type { Faculty } from "./faculty-data-table"
import type { Department } from "./department-data-table"

// Define the Classes type
export type Classes = {
  id: string
  facultyId: string
  facultyName: string
  departmentId: string
  departmentName: string
  semesterName: number
  classMode: "full time" | "part time"
  type: "A" | "B" | "C" | "D"
  status: "active" | "inactive"
}

// Sample data
const data: Classes[] = [
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
const columns: ColumnDef<Classes>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "facultyName",
    header: "Faculty",
  },
  {
    accessorKey: "departmentName",
    header: "Department",
  },
  {
    accessorKey: "semesterName",
    header: "Semester",
  },
  {
    accessorKey: "classMode",
    header: "Class Mode",
    cell: ({ row }) => {
      const classMode = row.getValue("classMode") as string
      return <Badge variant={classMode === "full time" ? "default" : "outline"}>{classMode}</Badge>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
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
      const classes = row.original

      return (
        <div className="flex items-center gap-2">
          <ClassesDialog mode="edit" classes={classes} />
          <ClassesDialog mode="delete" classes={classes} />
        </div>
      )
    },
  },
]

export function ClassesDataTable() {
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
          placeholder="Filter classes..."
          value={(table.getColumn("departmentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("departmentName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <ClassesDialog mode="add" />
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
