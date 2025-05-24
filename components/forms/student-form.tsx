import { useState, useEffect } from "react"
import axios from "axios"
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
import { Edit, PlusCircle, Trash2 } from "lucide-react"

const API_BASE = "/api/student"

const formSchema = z.object({
  classId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  parentPhone: z.string().min(10, "Phone must be at least 10 digits.").optional(),
  studentId: z.string().optional(), // handle conversion later
  status: z.enum(["active", "inactive"]).optional(),
})

type StudentFormValues = z.infer<typeof formSchema>

interface Student {
  _id: string
  classId: { _id: string; semester?: number; type?: string } | string
  name: string
  parentPhone: string
  studentId: number
  status: string
}

interface StudentDialogProps {
  mode: "add" | "edit" | "delete"
  student?: any
  onDone: () => void
}

export function StudentDialog({ mode, student, onDone }: StudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    axios.get("/api/classes").then(res => setClasses(res.data)).catch(console.error)
  }, [])

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId:
        typeof student?.classId === "object" && student?.classId?._id
          ? student.classId._id
          : (student?.classId as string) || "",
      name: student?.name || "",
      parentPhone: student?.parentPhone || "",
      studentId: student?.studentId !== undefined ? student.studentId.toString() : "",
      status: student?.status || "active",
    },
  })

  const onSubmit = async (data: StudentFormValues) => {
    try {
      // Prepare payload with only non-empty values
      const payload: Partial<StudentFormValues> = {}

      for (const key in data) {
        const value = data[key as keyof StudentFormValues]
        if (value !== undefined && value !== "") {
          if (key === "studentId") {
            payload.studentId = Number(value)
          } else {
            payload[key as keyof StudentFormValues] = value
          }
        }
      }

      if (mode === "add") {
        await axios.post(API_BASE, payload)
      } else if (mode === "edit" && student) {
        await axios.put(`${API_BASE}/${student.id}`, payload)
      }

      onDone()
      setOpen(false)
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const onDelete = async () => {
    try {
      if (student) await axios.delete(`${API_BASE}/${student.id}`)
      onDone()
      setOpen(false)
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Student
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
            {mode === "add"
              ? "Add Student"
              : mode === "edit"
              ? "Edit Student"
              : "Delete Student"}
          </DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? "Are you sure you want to delete this student?"
              : "Fill in the student details."}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Confirm Delete
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student Name" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls._id} value={cls._id}>
                            CMS-{cls.semester}-{cls.type}
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
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone Number" {...field} />
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
                      <Input
                        type="number"
                        placeholder="Student ID"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value)}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "active"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
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
                <Button type="submit">
                  {mode === "add" ? "Add Student" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}