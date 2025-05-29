"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Edit, PlusCircle, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  teacherId: z.string().min(1, "Teacher is required"), // Added teacherId field
  courseName: z.string().min(2, "Course name must be at least 2 characters"),
  code: z.string().min(2, "Course code must be at least 2 characters"),
  semester: z.coerce.number().min(1).max(8),
})

type CoursesFormValues = z.infer<typeof formSchema>

interface CoursesDialogProps {
  mode: "add" | "edit" | "delete"
  course?: {
    _id: string
    departmentId: string
    teacherId: string // Added teacherId
    courseName: string
    code: string
    semester: number
  }
  onSuccess?: () => void
}

export function CoursesDialog({ mode, course, onSuccess }: CoursesDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([]) // Added teachers state

  const form = useForm<CoursesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: "",
      teacherId: "", // Added default value
      courseName: "",
      code: "",
      semester: 1,
    },
  })

  // Reset form values when editing and dialog opens
  useEffect(() => {
    if (open && (mode === "edit" || mode === "delete") && course) {
      form.reset({
        departmentId: course.departmentId,
        teacherId: course.teacherId, // Added teacherId
        courseName: course.courseName,
        code: course.code,
        semester: course.semester,
      })
    } else if (open && mode === "add") {
      form.reset({
        departmentId: "",
        teacherId: "", // Added teacherId
        courseName: "",
        code: "",
        semester: 1,
      })
    }
  }, [open, mode, course, form])

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [depRes, teachersRes] = await Promise.all([
          fetch("/api/department"),
          fetch("/api/users/?title=teacher") // Fetch teachers only
        ])
        const [depData, teachersData] = await Promise.all([
          depRes.json(),
          teachersRes.json()
        ])
        setDepartments(depData)
        setTeachers(teachersData.filter(teacher => teacher.Title == "teacher"))
      } catch (err) {
        console.error("Failed to fetch departments or teachers", err)
      }
    }

    fetchOptions()
  }, [])

  const handleSubmit = async (values: CoursesFormValues) => {
    setLoading(true)
    try {
      const method = mode === "edit" ? "PUT" : "POST"
      const url = mode === "edit" ? `/api/courses/${course?.id}` : `/api/courses`

      // Include teacherId in the request body
      const body = JSON.stringify({
        ...values,
        teacherId: values.teacherId
      })

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body
      })

      if (!res.ok) throw new Error("Request failed")

      onSuccess?.()
      setOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    console.log(course)
    if (!course?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      onSuccess?.()
      setOpen(false)
    } catch (err) {
      console.error(err)
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
            Add Course
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Course" : mode === "edit" ? "Edit Course" : "Delete Course"}
          </DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? "This action is permanent and cannot be undone."
              : "Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Are you sure you want to delete this course?
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Added Teacher Selection Field */}
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher._id} value={teacher._id}>
                            {teacher.FullName}
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
                name="courseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Course name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Course code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {mode === "edit" ? "Save Changes" : "Add Course"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}