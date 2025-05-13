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
import { type Classes, faculties, departments } from "@/components/data-tables/classes-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  facultyId: z.string({
    required_error: "Please select a faculty.",
  }),
  departmentId: z.string({
    required_error: "Please select a department.",
  }),
  semesterName: z.coerce
    .number()
    .min(1, {
      message: "Semester must be at least 1.",
    })
    .max(8, {
      message: "Semester cannot be more than 8.",
    }),
  classMode: z.enum(["full time", "part time"], {
    required_error: "Please select a class mode.",
  }),
  type: z.enum(["A", "B", "C", "D"], {
    required_error: "Please select a type.",
  }),
  status: z.enum(["active", "inactive"], {
    required_error: "Please select a status.",
  }),
})

type ClassesFormValues = z.infer<typeof formSchema>

interface ClassesDialogProps {
  mode: "add" | "edit" | "delete"
  classes?: Classes
}

export function ClassesDialog({ mode, classes }: ClassesDialogProps) {
  const [open, setOpen] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState(departments)

  // Default values for the form
  const defaultValues: Partial<ClassesFormValues> = {
    facultyId: classes?.facultyId || "",
    departmentId: classes?.departmentId || "",
    semesterName: classes?.semesterName || 1,
    classMode: classes?.classMode || "full time",
    type: classes?.type || "A",
    status: classes?.status || "active",
  }

  // Initialize the form
  const form = useForm<ClassesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Watch for faculty changes to filter departments
  const facultyId = form.watch("facultyId")

  useEffect(() => {
    if (facultyId) {
      setFilteredDepartments(departments.filter((dept) => dept.facultyId === facultyId))
    } else {
      setFilteredDepartments(departments)
    }
  }, [facultyId])

  // Form submission handler
  function onSubmit(data: ClassesFormValues) {
    // In a real app, you would send this data to your backend
    console.log(data)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting class:", classes?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Class
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
          <DialogTitle>{mode === "add" ? "Add Class" : mode === "edit" ? "Edit Class" : "Delete Class"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new class to the system."
              : mode === "edit"
                ? "Make changes to the class information."
                : "Are you sure you want to delete this class?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the class and all associated students.
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
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!facultyId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDepartments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
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
                name="semesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Semester" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full time">Full Time</SelectItem>
                        <SelectItem value="part time">Part Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
