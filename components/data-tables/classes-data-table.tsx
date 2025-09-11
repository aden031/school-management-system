"use client"

import { useEffect, useState } from "react"
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
import { ClassesDialog } from "@/components/forms/classes-form"
import { Badge } from "@/components/ui/badge"

export type Classes = {
  id: string
  departmentId: string
  departmentName: string
  semesterName: number
  classMode: "full time" | "part time"
  type: "A" | "B" | "C" | "D"
  status: "active" | "inactive"
  academicYearName?: string
}

export function ClassesDataTable() {
  const [data, setData] = useState<Classes[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/classes")
      const classesData: Classes[] = res.data.map((item: any) => ({
        id: item._id,
        departmentId: item.departmentId?._id ?? "",
        departmentName: item.departmentId?.name ?? "N/A",
        semesterName: item.semester,
        classMode: item.classMode,
        type: item.type,
        status: item.status,
        academicYearName: item.academicYearId?.name ?? "-",
      }))
      setData(classesData)
    } catch (error) {
      console.error("Failed to fetch classes", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns: ColumnDef<Classes>[] = [
    {
      accessorKey: "academicYearName",
      header: "Academic Year",
      cell: ({ row }) => row.original.academicYearName || "-",
    },
    {
      id: "index",
      header: "ID",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "departmentName",
      header: "Xarunta",
    },
    {
      accessorKey: "semesterName",
      header: "Room #",
    },
    {
      accessorKey: "classMode",
      header: "Class Mode",
      cell: ({ row }) => {
        const value = row.getValue("classMode") as string
        return <Badge variant={value === "full time" ? "default" : "outline"}>{value}</Badge>
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
        const value = row.getValue("status") as string
        return <Badge variant={value === "active" ? "success" : "destructive"}>{value}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            <ClassesDialog mode="edit" classes={item} onDone={fetchData} />
            <ClassesDialog mode="delete" classes={item} onDone={fetchData} />
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
          placeholder="Raadi fasal..."
          value={(table.getColumn("departmentName")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("departmentName")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <ClassesDialog mode="add" onDone={fetchData} />
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
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
