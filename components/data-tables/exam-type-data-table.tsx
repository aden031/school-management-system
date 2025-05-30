"use client"

import { useEffect, useState, useCallback } from "react"
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
import { ExamTypeDialog } from "@/components/forms/exam-type-form"
import { Badge } from "@/components/ui/badge"

export type ExamType = {
  _id: string // 👈 real MongoDB ID
  id: number  // 👈 just for table display
  name: "midterm" | "final" | "quiz"
  marks: number
  description?: string
}

export function ExamTypeDataTable() {
  const [data, setData] = useState<ExamType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/exam-types")
      if (!res.ok) throw new Error("Failed to fetch exam types")
      const raw = await res.json()

      const mapped: ExamType[] = raw.map((item: any, index: number) => ({
        _id: item._id,
        id: index + 1,
        name: item.name,
        marks: item.marks,
        description: item.description,
      }))

      setData(mapped)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns: ColumnDef<ExamType>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Nuuca Imtixaanka",
      cell: ({ row }) => {
        const name = row.getValue("name") as string
        return (
          <Badge
            variant={
              name === "midterm"
                ? "default"
                : name === "final"
                ? "destructive"
                : "outline"
            }
            className="capitalize"
          >
            {name}
          </Badge>
        )
      },
    },
    {
      accessorKey: "marks",
      header: "Natiijada Guud",
    },
    {
      accessorKey: "description",
      header: "Faahfaahin",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const examType = row.original
        return (
          <div className="flex items-center gap-2">
            <ExamTypeDialog mode="edit" examType={examType} onDone={fetchData} />
            <ExamTypeDialog mode="delete" examType={examType} onDone={fetchData} />
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })

  if (loading) return <p>Loading exam types...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter exam types..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <ExamTypeDialog mode="add" onDone={fetchData} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
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
