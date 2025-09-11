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
// import { AcademicYearDialog } from "@/components/forms/academic-year-form" // Uncomment if you create a form
import { Badge } from "@/components/ui/badge"

import { AcademicYearEditDialog } from "@/components/forms/academic-year-edit-form"


export type AcademicYear = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function AcademicYearDataTable() {



  const [data, setData] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/academicyear")
      setData(res.data)
    } catch (err) {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this academic year?")) return;
    setDeletingId(id)
    try {
      await axios.delete(`/api/academicyear/${id}`)
      fetchData()
    } catch (err) {
      // handle error
    } finally {
      setDeletingId(null)
    }
  }

  const columns: ColumnDef<AcademicYear>[] = [
    {
      accessorKey: "name",
      header: "Academic Year",
      cell: info => info.getValue(),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: info => info.getValue() ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <AcademicYearEditDialog academicYear={row.original} onSuccess={fetchData} />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original._id)}
            disabled={deletingId === row.original._id}
          >
            {deletingId === row.original._id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })

  return (
    <div>
      {/* <AcademicYearDialog onSuccess={fetchData} /> */}
      <div className="py-2">
        <Input
          placeholder="Search academic year..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={e => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
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
                <TableCell colSpan={columns.length} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">No academic years found.</TableCell>
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
