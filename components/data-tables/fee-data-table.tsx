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
import { FeeDialog } from "@/components/forms/fee-form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type Fee = {
  id: string
  studentId: string
  studentName: string
  financeType:
    | "admission"
    | "registration"
    | "tuition"
    | "library"
    | "examination"
    | "transportation"
    | "other"
    | "unknown"
  amount: number
  amountPaid: number
  balance: number
  status: "paid" | "partial" | "unpaid" | "unknown"
  dueDate: string
  lastPaymentDate?: string
}

export function FeeDataTable() {
  const [data, setData] = useState<Fee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/fees")
      const json = await res.json()

      const mapped = json.map((fee: any): Fee => ({
        id: fee?._id ?? "unknown",
        studentId: fee?.studentId?._id ?? "unknown",
        studentName: fee?.studentId?.name ?? "Unknown",
        financeType: fee?.financeType ?? "unknown",
        amount: typeof fee?.amount === "number" ? fee.amount : 0,
        amountPaid: typeof fee?.amountPaid === "number" ? fee.amountPaid : 0,
        balance: typeof fee?.balance === "number" ? fee.balance : 0,
        status:
          fee?.status === "paid" || fee?.status === "partial" || fee?.status === "unpaid"
            ? fee.status
            : "unknown",
        dueDate: fee?.date ?? new Date().toISOString(),
        lastPaymentDate: fee?.updatedAt ?? undefined,
      }))

      setData(mapped)
    } catch (err) {
      console.error("Failed to fetch fees:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns: ColumnDef<Fee>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
    },
    {
      accessorKey: "financeType",
      header: "Finance Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("financeType") || "Unknown"}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("amount") ?? 0),
    },
    {
      accessorKey: "amountPaid",
      header: "Amount Paid",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("amountPaid") ?? 0),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("balance") ?? 0),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variant =
          status === "paid"
            ? "success"
            : status === "partial"
            ? "default"
            : status === "unpaid"
            ? "destructive"
            : "outline"

        return (
          <Badge variant={variant} className="capitalize">
            {status || "Unknown"}
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
          <div className={isPastDue ? "text-destructive font-medium" : ""}>
            {dueDate ? format(new Date(dueDate), "PPP") : "Unknown"}
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
            <FeeDialog mode="edit" fee={fee} onDone={fetchData} />
            <FeeDialog mode="delete" fee={fee} onDone={fetchData} />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Filter by student name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("status")?.setFilterValue(event.target.value)
            }
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <FeeDialog mode="add" onDone={fetchData} />
        </div>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
    </div>
  )
}
