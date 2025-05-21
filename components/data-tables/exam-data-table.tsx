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
  const [data, setData] = useState<Exam[]>([])

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams")
        const raw = await res.json()

        const formatted: Exam[] = raw.map((item: any) => ({
          id: item._id,
          studentId: item.studentId._id,
          studentName: item.studentId.name,
          examTypeId: item.examTypeId._id,
          examTypeName: item.examTypeId.name,
          courseId: item.courseId._id,
          courseName: item.courseId.courseName,
          marksObtained: item.marksObtained,
          totalMarks: item.examTypeId.marks,
          date: item.date,
        }))

        setData(formatted)
      } catch (err) {
        console.error("Failed to fetch exams:", err)
      }
    }

    fetchExams()
  }, [])

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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
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
