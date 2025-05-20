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
import { ExamTypeDialog } from "@/components/forms/exam-type-form"
import { Badge } from "@/components/ui/badge"

// Define the ExamType type 
export type ExamType = {
  id: string
  name: "midterm" | "final" | "quiz"
  marks: number
  description?: string
}

// Sample data
const data: ExamType[] = [
  {
    id: "1",
    name: "midterm",
    marks: 30,
    description: "Mid-semester examination",
  },
  {
    id: "2",
    name: "final",
    marks: 50,
    description: "End of semester examination",
  },
  {
    id: "3",
    name: "quiz",
    marks: 10,
    description: "Regular class quiz",
  },
  {
    id: "4",
    name: "midterm",
    marks: 25,
    description: "Second mid-semester examination",
  },
  {
    id: "5",
    name: "quiz",
    marks: 15,
    description: "Major quiz",
  },
]

// Define columns
const columns: ColumnDef<ExamType>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Exam Type",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <Badge
          variant={name === "midterm" ? "default" : name === "final" ? "destructive" : "outline"}
          className="capitalize"
        >
          {name}
        </Badge>
      )
    },
  },
  {
    accessorKey: "marks",
    header: "Total Marks",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const examType = row.original

      return (
        <div className="flex items-center gap-2">
          <ExamTypeDialog mode="edit" examType={examType} />
          <ExamTypeDialog mode="delete" examType={examType} />
        </div>
      )
    },
  },
]

export function ExamTypeDataTable() {
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
          placeholder="Filter exam types..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <ExamTypeDialog mode="add" />
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
