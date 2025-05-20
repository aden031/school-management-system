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
import { students } from "@/data"

// Define the form schema
const formSchema = z.object({
  studentId: z.string({
    required_error: "Please select a student.",
  }),
  financeType: z.enum(["admission", "registration", "tuition", "library", "examination", "transportation", "other"], {
    required_error: "Please select a finance type.",
  }),
  amount: z.coerce.number().min(0, {
    message: "Amount must be at least 0.",
  }),
  amountPaid: z.coerce.number().min(0, {
    message: "Amount paid must be at least 0.",
  }),
  dueDate: z.date({
    required_error: "Please select a due date.",
  }),
  lastPaymentDate: z.date().optional(),
})

type FeeFormValues = z.infer<typeof formSchema>

interface FeeDialogProps {
  mode: "add" | "edit" | "delete"
  fee?: Fee
}

export function FeeDialog({ mode, fee }: FeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState<number>(fee?.balance || 0)
  const [status, setStatus] = useState<"paid" | "partial" | "unpaid">(fee?.status || "unpaid")

  // Default values for the form
  const defaultValues: Partial<FeeFormValues> = {
    studentId: fee?.studentId || "",
    financeType: fee?.financeType || "tuition",
    amount: fee?.amount || 0,
    amountPaid: fee?.amountPaid || 0,
    dueDate: fee?.dueDate ? new Date(fee.dueDate) : new Date(),
    lastPaymentDate: fee?.lastPaymentDate ? new Date(fee.lastPaymentDate) : undefined,
  }

  // Initialize the form
  const form = useForm<FeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Watch for amount and amountPaid changes to update balance and status
  const amount = form.watch("amount")
  const amountPaid = form.watch("amountPaid")

  useEffect(() => {
    // Calculate balance
    const calculatedBalance = amount - amountPaid
    setBalance(calculatedBalance)

    // Determine status
    if (calculatedBalance <= 0) {
      setStatus("paid")
    } else if (amountPaid > 0) {
      setStatus("partial")
    } else {
      setStatus("unpaid")
    }
  }, [amount, amountPaid])

  // Form submission handler
  function onSubmit(data: FeeFormValues) {
    // Add calculated fields
    const submissionData = {
      ...data,
      balance,
      status,
    }

    // In a real app, you would send this data to your backend
    console.log(submissionData)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting fee:", fee?.id)
    setOpen(false)
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
              ? "Add a new fee record to the system."
              : mode === "edit"
                ? "Make changes to the fee record."
                : "Are you sure you want to delete this fee record?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the fee record.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.studentId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter total amount" {...field} min={0} step="0.01" />
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
                        <Input type="number" placeholder="Enter amount paid" {...field} min={0} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Balance</div>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                    <span className={balance === 0 ? "text-green-600" : balance > 0 ? "text-red-600" : "text-blue-600"}>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(balance)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Status</div>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                    <span
                      className={
                        status === "paid"
                          ? "text-green-600 font-medium"
                          : status === "partial"
                            ? "text-blue-600 font-medium"
                            : "text-red-600 font-medium"
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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

                <FormField
                  control={form.control}
                  name="lastPaymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Last Payment Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
              </div>

              <DialogFooter>
                <Button type="submit">{mode === "add" ? "Add" : "Save changes"}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
