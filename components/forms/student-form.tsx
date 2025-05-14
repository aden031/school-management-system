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
import { type Student, faculties, classes } from "@/components/data-tables/student-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  facultyId: z.string({
    required_error: "Please select a faculty.",
  }),
  classId: z.string({
    required_error: "Please select a class.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  gender: z.enum(["Male", "Female"], {
    required_error: "Please select a gender.",
  }),
  parentPhone: z.string().min(10, {
    message: "Parent phone must be at least 10 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone must be at least 10 characters.",
  }),
  studentId: z.string().min(1, {
    message: "Student ID is required.",
  }),
  passcode: z.string().default("1234"),
  status: z.enum(["active", "inactive"], {
    required_error: "Please select a status.",
  }),
})

type StudentFormValues = z.infer<typeof formSchema>

interface StudentDialogProps {
  mode: "add" | "edit" | "delete"
  student?: Student
}

export function StudentDialog({ mode, student }: StudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [filteredClasses, setFilteredClasses] = useState(classes)

  // Default values for the form
  const defaultValues: Partial<StudentFormValues> = {
    facultyId: student?.facultyId || "",
    classId: student?.classId || "",
    name: student?.name || "",
    gender: student?.gender || "Male",
    parentPhone: student?.parentPhone || "",
    phone: student?.phone || "",
    studentId: student?.studentId || "",
    passcode: student?.passcode || "1234",
    status: student?.status || "active",
  }

  // Initialize the form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Watch for faculty changes to filter classes
  const facultyId = form.watch("facultyId")

  useEffect(() => {
    if (facultyId) {
      setFilteredClasses(classes.filter((cls) => cls.facultyId === facultyId))
    } else {
      setFilteredClasses(classes)
    }
  }, [facultyId])

  // Form submission handler
  function onSubmit(data: StudentFormValues) {
    // In a real app, you would send this data to your backend
    console.log(data)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting student:", student?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
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
            {mode === "add" ? "Add Student" : mode === "edit" ? "Edit Student" : "Delete Student"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new student to the system."
              : mode === "edit"
                ? "Make changes to the student information."
                : "Are you sure you want to delete this student?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the student record from the system.
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
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!facultyId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.departmentName} - Semester {cls.semesterName}
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Student phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Student ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Passcode" {...field} />
                    </FormControl>
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
