"use client"

import { useEffect, useState } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CoursesDialog } from "@/components/forms/courses-form"

export type Course = {
  id: string
  departmentId: string
  departmentName: string
  courseName: string
  teacherId: string
  teacherName: string
}

export function CoursesDataTable() {
  const [data, setData] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/courses")
      const resData = await res.json()

      const formatted: Course[] = resData.map((course: any) => ({
        id: course._id,
        departmentId: course.departmentId?._id,
        departmentName: course.departmentId?.name,
        courseName: course.courseName,
        teacherId: course.teacherId?._id,
        teacherName: course.teacherId?.FullName,
      }))

      setData(formatted)
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const columns: ColumnDef<Course>[] = [
    { accessorKey: "courseName", header: "Magaca madada" },
    { accessorKey: "departmentName", header: "Xarunta" },
    { accessorKey: "teacherName", header: "Macallinka" },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original
        return (
          <div className="flex items-center gap-2">
            <CoursesDialog mode="edit" course={course} onSuccess={fetchCourses} />
            <CoursesDialog mode="delete" course={course} onSuccess={fetchCourses} />
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Raadi Maadooyin..."
          value={(table.getColumn("courseName")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("courseName")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <CoursesDialog mode="add" onSuccess={fetchCourses}>
          Ku dar Koorso
        </CoursesDialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  LaMa helin wax  natiijo ah.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}