"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {StudentFileUpload } from "../forms/students-file-upload"

export type Student = {
  id: string
  className: string
  name: string
  parentPhone: string
  studentId: number
  passcode: string
  status: "active" | "inactive"
  studentImage?: string
}

export function StudentDataTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
        const response = await axios.get("/api/student");
        const data = (response.data || []).map((student: any) => ({
          id: student?._id ?? "N/A",
          className: student?.classId?.departmentId?.name && student?.classId?.semester
            ? `${student.classId.departmentId.name} - fasal ${student.classId.semester}`
            : "Unknown Class",
          name: student?.name ?? "Unnamed",
          parentPhone: student?.parentPhone ?? "No Phone",
          studentId: student?.studentId ?? "No ID",
          passcode: student?.passcode ?? "No Passcode",
          status: student?.status ?? "No Status",
          studentImage: student?.studentImage ?? undefined,
        }));
        setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "studentImage",
      header: "Image",
      cell: ({ row }) => {
        const img = row.original.studentImage;
        if (!img) return <span style={{ color: '#aaa' }}>No Image</span>;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={img}
                alt="Student"
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 20, cursor: "pointer" }}
              />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center justify-center">
              <img
                src={img}
                alt="Student Full"
                style={{ maxWidth: 400, maxHeight: 400, borderRadius: 12 }}
              />
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      accessorKey: "studentId",
      header: "ID-ga ardayga",
    },
    {
      accessorKey: "name",
      header: "Magaca",
    },
    {
      accessorKey: "className",
      header: "Fasalka",
    },
    {
      accessorKey: "parentPhone",
      header: "Talefon walidka",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "active" ? "success" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex items-center gap-2">
            <StudentDialog mode="edit" student={student} onDone={fetchStudents} />
            <StudentDialog mode="delete" student={student} onDone={fetchStudents} />
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: students,
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
          placeholder="Raadi Arday..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <StudentFileUpload onDone={fetchStudents}/>
        <StudentDialog mode="add" onDone={fetchStudents} /> 
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
