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
import { FeeDialog } from "@/components/forms/fee-form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// Define the Fee type
export type Fee = {
  id: string
  studentId: string
  studentName: string
  financeType: "admission" | "registration" | "tuition" | "library" | "examination" | "transportation" | "other"
  amount: number
  amountPaid: number
  balance: number
  status: "paid" | "partial" | "unpaid"
  dueDate: string
  lastPaymentDate?: string
}

// Sample data
const data: Fee[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Doe",
    financeType: "admission",
    amount: 5000,
    amountPaid: 5000,
    balance: 0,
    status: "paid",
    dueDate: "2023-08-15",
    lastPaymentDate: "2023-08-10",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Jane Smith",
    financeType: "tuition",
    amount: 12000,
    amountPaid: 6000,
    balance: 6000,
    status: "partial",
    dueDate: "2023-09-30",
    lastPaymentDate: "2023-09-15",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Bob Johnson",
    financeType: "registration",
    amount: 2500,
    amountPaid: 0,
    balance: 2500,
    status: "unpaid",
    dueDate: "2023-08-20",
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Alice Brown",
    financeType: "library",
    amount: 1000,
    amountPaid: 1000,
    balance: 0,
    status: "paid",
    dueDate: "2023-09-10",
    lastPaymentDate: "2023-09-05",
  },
  {
    id: "5",
    studentId: "5",
    studentName: "Charlie Wilson",
    financeType: "examination",
    amount: 3000,
    amountPaid: 1500,
    balance: 1500,
    status: "partial",
    dueDate: "2023-10-15",
    lastPaymentDate: "2023-09-20",
  },
  {
    id: "6",
    studentId: "1",
    studentName: "John Doe",
    financeType: "transportation",
    amount: 4000,
    amountPaid: 2000,
    balance: 2000,
    status: "partial",
    dueDate: "2023-10-30",
    lastPaymentDate: "2023-10-10",
  },
  {
    id: "7",
    studentId: "2",
    studentName: "Jane Smith",
    financeType: "other",
    amount: 1500,
    amountPaid: 0,
    balance: 1500,
    status: "unpaid",
    dueDate: "2023-11-15",
  },
]

// Define columns
const columns: ColumnDef<Fee>[] = [
  {
    accessorKey: "studentName",
    header: "Student",
  },
  {
    accessorKey: "financeType",
    header: "Finance Type",
    cell: ({ row }) => {
      const financeType = row.getValue("financeType") as string
      return <span className="capitalize">{financeType}</span>
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return formatted
    },
  },
  {
    accessorKey: "amountPaid",
    header: "Amount Paid",
    cell: ({ row }) => {
      const amountPaid = Number.parseFloat(row.getValue("amountPaid"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amountPaid)
      return formatted
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = Number.parseFloat(row.getValue("balance"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(balance)
      return formatted
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "paid" ? "success" : status === "partial" ? "default" : "destructive"}
          className="capitalize"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as string
      const today = new Date()
      const due = new Date(dueDate)
      const isPastDue = due < today && row.original.status !== "paid"

      return (
        <div className={`${isPastDue ? "text-destructive font-medium" : ""}`}>
          {format(new Date(dueDate), "PPP")}
          {isPastDue && <span className="ml-2">(Overdue)</span>}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fee = row.original

      return (
        <div className="flex items-center gap-2">
          <FeeDialog mode="edit" fee={fee} />
          <FeeDialog mode="delete" fee={fee} />
        </div>
      )
    },
  },
]

export function FeeDataTable() {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Filter by student name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("studentName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("status")?.setFilterValue(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <FeeDialog mode="add" />
        </div>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} fee record(s) found.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
