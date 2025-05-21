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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExamDialog } from "@/components/forms/exam-form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type Exam = {
  id: string
  studentId: string
  studentName: string
  examTypeId: string
  examTypeName: "midterm" | "final" | "quiz" | "unknown"
  courseId: string
  courseName: string
  marksObtained: number
  totalMarks: number
  date: string
}

export function ExamDataTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/exams")
      const raw = await res.json()

      const formatted: Exam[] = raw.map((item: any) => ({
        id: item?._id ?? "unknown",
        studentId: item?.studentId?._id ?? "unknown",
        studentName: item?.studentId?.name ?? "Unknown",
        examTypeId: item?.examTypeId?._id ?? "unknown",
        examTypeName: item?.examTypeId?.name ?? "unknown",
        courseId: item?.courseId?._id ?? "unknown",
        courseName: item?.courseId?.courseName ?? "Unknown",
        marksObtained: typeof item?.marksObtained === "number" ? item.marksObtained : 0,
        totalMarks: typeof item?.examTypeId?.marks === "number" ? item.examTypeId.marks : 100,
        date: item?.date ?? new Date().toISOString(),
      }))

      setData(formatted)
    } catch (err) {
      console.error("Failed to fetch exams:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

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
        const badgeVariant =
          examType === "midterm"
            ? "default"
            : examType === "final"
            ? "destructive"
            : examType === "quiz"
            ? "outline"
            : "outline"

        return (
          <Badge variant={badgeVariant} className="capitalize">
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
        const totalMarks = row.original.totalMarks || 100
        const percentage = totalMarks ? Math.round((marksObtained / totalMarks) * 100) : 0

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
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? "Unknown Date" : format(parsedDate, "PPP")
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const exam = row.original
        return (
          <div className="flex items-center gap-2">
            <ExamDialog mode="edit" exam={exam} onDone={fetchExams} />
            <ExamDialog mode="delete" exam={exam} onDone={fetchExams} />
          </div>
        )
      },
    },
  ]

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
        <ExamDialog mode="add" onDone={fetchExams} />
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
                  Loading exams...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
