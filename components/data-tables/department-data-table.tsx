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
import { DepartmentDialog } from "@/components/forms/department-form"
import axios from "axios"

export type Department = {
  _id: string
  name?: string
  studentCount?: number
  departmentMode?: string
  createdAt?: string
  updatedAt?: string
}

const fetchDepartments = async () => {
  try {
    const response = await axios.get("/api/department")
    return response.data
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

export function DepartmentDataTable() {
  const [data, setData] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const departments = await fetchDepartments()
      setData(departments)
      setLoading(false)
    }

    loadData()
  }, [])

  const updateDepartmentList = () => {
    fetchDepartments().then(setData)
  }

  const columns: ColumnDef<Department>[] = [
    {
      id: "index",
      header: "ID",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: "Department Name",
      cell: ({ row }) => row.original?.name ?? "Unknown",
    },
    {
      header: "Student Count",
      cell: ({ row }) => row.original?.studentCount ?? "Unknown",
    },
    {
      header: "Department Mode",
      cell: ({ row }) => row.original?.departmentMode ?? "Unknown",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const department = row.original
        return (
          <div className="flex items-center gap-2">
            <DepartmentDialog mode="edit" department={department} onDone={updateDepartmentList} />
            <DepartmentDialog mode="delete" department={department} onDone={updateDepartmentList} />
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
          placeholder="Filter departments..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DepartmentDialog mode="add" onDone={updateDepartmentList} />
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
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
