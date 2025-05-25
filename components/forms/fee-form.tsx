"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Fee } from "@/components/data-tables/fee-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
  studentId: z.string({ required_error: "Please select a student." }),
  financeType: z.enum(
    ["admission", "registration", "tuition", "library", "examination", "transportation", "other"],
    { required_error: "Please select a finance type." }
  ),
  amount: z.coerce.number().min(0, { message: "Amount must be at least 0." }),
  amountPaid: z.coerce.number().min(0, { message: "Amount paid must be at least 0." }),
  dueDate: z.date({ required_error: "Please select a due date." }),
  lastPaymentDate: z.date().optional(),
})

type FeeFormValues = z.infer<typeof formSchema>
interface FeeDialogProps {
  mode: "add" | "edit" | "delete"
  fee?: Fee
  onDone:()=> void
}

export function FeeDialog({ mode, fee , onDone }: FeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<{ _id: string; name: string }[]>([])
  const [balance, setBalance] = useState<number>(fee?.balance || 0)
  const [status, setStatus] = useState<"paid" | "partial" | "unpaid">(fee?.status || "unpaid")
  const [loading, setLoading] = useState(false)

  const defaultValues: Partial<FeeFormValues> = {
    studentId: fee?.studentId || "",
    financeType: fee?.financeType || "tuition",
    amount: fee?.amount || 0,
    amountPaid: fee?.amountPaid || 0,
    dueDate: fee?.dueDate ? new Date(fee.dueDate) : new Date(),
    lastPaymentDate: fee?.lastPaymentDate ? new Date(fee.lastPaymentDate) : undefined,
  }

  const form = useForm<FeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const amount = form.watch("amount")
  const amountPaid = form.watch("amountPaid")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/student")
        const data = await res.json()
        setStudents(data)
      } catch (error) {
        console.error("Failed to fetch students:", error)
      }
    }

    fetchStudents()
  }, [])

  useEffect(() => {
    const calculatedBalance = amount - amountPaid
    setBalance(calculatedBalance)

    if (calculatedBalance <= 0) {
      setStatus("paid")
    } else if (amountPaid > 0) {
      setStatus("partial")
    } else {
      setStatus("unpaid")
    }
  }, [amount, amountPaid])

  async function onSubmit(data: FeeFormValues) {
    const payload = {
      ...data,
      balance,
      status,
      description: `${data.financeType} payment`, // You can make this editable later
      date: data.dueDate,
    }

    try {
      setLoading(true)
      const res = await fetch(
        mode === "edit" ? `/api/fees/${fee?.id}` : "/api/fees/",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      onDone?.()
      if (!res.ok) throw new Error("Failed to submit")

      setOpen(false)
    } catch (err) {
      console.error("Submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    try {
      setLoading(true)
      const res = await fetch(`/api/fees/${fee?.id}`, { method: "DELETE" })
      onDone?.()
      if (!res.ok) throw new Error("Failed to delete")
      setOpen(false)
    } catch (err) {
      console.error("Deletion error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Fee
          </Button>
        ) : mode === "edit" ? (
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Fee" : mode === "edit" ? "Edit Fee" : "Delete Fee"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new fee record."
              : mode === "edit"
                ? "Update the fee record."
                : "Are you sure you want to delete this fee?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>This action cannot be undone.</AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Dynamic student selector */}
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Finance type */}
              <FormField
                control={form.control}
                name="financeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finance Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a finance type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admission">Admission</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="tuition">Tuition</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="examination">Examination</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount and Paid */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Balance and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Balance</div>
                  <div className="h-10 px-3 py-2 border rounded-md flex items-center">
                    <span className={balance <= 0 ? "text-green-600" : "text-red-600"}>
                      ${balance.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Status</div>
                  <div className="h-10 px-3 py-2 border rounded-md flex items-center">
                    <span
                      className={
                        status === "paid"
                          ? "text-green-600"
                          : status === "partial"
                            ? "text-blue-600"
                            : "text-red-600"
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Due Date and Last Payment Date */}
              <div className="grid grid-cols-2 gap-4">
                {["dueDate", "lastPaymentDate"].map((name) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as "dueDate" | "lastPaymentDate"}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{name === "dueDate" ? "Due Date" : "Last Payment Date (Optional)"}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full text-left", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : mode === "add" ? "Add" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}