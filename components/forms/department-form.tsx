"use client"

import { useState } from "react"
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
import { type Department, faculties } from "@/components/data-tables/department-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  facultyId: z.string({
    required_error: "Please select a faculty.",
  }),
  name: z.string().min(2, {
    message: "Department name must be at least 2 characters.",
  }),
  sCount: z.coerce.number().min(0, {
    message: "Student count must be a positive number.",
  }),
  departmentMode: z.string({
    required_error: "Please select a department mode.",
  }),
})

type DepartmentFormValues = z.infer<typeof formSchema>

interface DepartmentDialogProps {
  mode: "add" | "edit" | "delete"
  department?: Department
}

export function DepartmentDialog({ mode, department }: DepartmentDialogProps) {
  const [open, setOpen] = useState(false)

  // Default values for the form
  const defaultValues: Partial<DepartmentFormValues> = {
    facultyId: department?.facultyId || "",
    name: department?.name || "",
    sCount: department?.sCount || 0,
    departmentMode: department?.departmentMode || "",
  }

  // Initialize the form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Form submission handler
  function onSubmit(data: DepartmentFormValues) {
    // In a real app, you would send this data to your backend
    console.log(data)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting department:", department?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Department
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Department" : mode === "edit" ? "Edit Department" : "Delete Department"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new department to the system."
              : mode === "edit"
                ? "Make changes to the department information."
                : "Are you sure you want to delete this department?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the department and all associated classes and
                courses.
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
                name="facultyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a faculty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Student count" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CMS">CMS</SelectItem>
                        <SelectItem value="LMS">LMS</SelectItem>
                        <SelectItem value="ERP">ERP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
