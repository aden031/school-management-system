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
import { DepartmentDialog } from "@/components/forms/department-form"
import type { Faculty } from "./faculty-data-table"

// Define the Department type
export type Department = {
  id: string
  facultyId: string
  facultyName: string
  name: string
  sCount: number
  departmentMode: string
}

// Sample data
const data: Department[] = [
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

// Sample faculties for the form
export const faculties: Faculty[] = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Business" },
  { id: "3", name: "Medicine" },
  { id: "4", name: "Arts and Sciences" },
  { id: "5", name: "Education" },
]

// Define columns
const columns: ColumnDef<Department>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "facultyName",
    header: "Faculty",
  },
  {
    accessorKey: "name",
    header: "Department Name",
  },
  {
    accessorKey: "sCount",
    header: "Student Count",
  },
  {
    accessorKey: "departmentMode",
    header: "Department Mode",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const department = row.original

      return (
        <div className="flex items-center gap-2">
          <DepartmentDialog mode="edit" department={department} />
          <DepartmentDialog mode="delete" department={department} />
        </div>
      )
    },
  },
]

export function DepartmentDataTable() {
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
          placeholder="Filter departments..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DepartmentDialog mode="add" />
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
