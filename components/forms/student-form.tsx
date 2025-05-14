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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const API_BASE = "/api/student"

const formSchema = z.object({
  facultyId: z.string().nonempty("Please select a faculty."),
  classId: z.string().nonempty("Please select a class."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  parentPhone: z.string().min(10, "Parent phone must be at least 10 characters."),
  studentId: z.string().nonempty("Student ID is required."),
})

type StudentFormValues = z.infer<typeof formSchema>

interface StudentDialogProps {
  mode: "add" | "edit" | "delete"
  student?: Student
}

export function StudentDialog({ mode, student }: StudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [faculties, setFaculties] = useState([])
  const [classes, setClasses] = useState([])

  useEffect(() => {
    axios.get("/api/faculty").then((res) => setFaculties(res.data)).catch(console.error)
    axios.get("/api/classes").then((res) => setClasses(res.data)).catch(console.error)
  }, [])

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facultyId: student?.facultyId || "",
      classId: student?.classId || "",
      name: student?.name || "",
      parentPhone: student?.parentPhone || "",
      studentId: student?.studentId || "",
    },
  })

  const onSubmit = async (data: StudentFormValues) => {
    try {
      const payload = data
      if (mode === "add") await axios.post(API_BASE, payload)
      if (mode === "edit" && student) await axios.put(`${API_BASE}/${student.id}`, payload)
      setOpen(false)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const onDelete = async () => {
    try {
      if (student) await axios.delete(`${API_BASE}/${student.id}`)
      setOpen(false)
    } catch (error) {
      console.error("Error deleting student:", error)
    }
  }

  useEffect(()=>{
        console.log(classes)
  } , [classes])

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
          <DialogTitle>{mode === "add" ? "Add Student" : mode === "edit" ? "Edit Student" : "Delete Student"}</DialogTitle>
          <DialogDescription>{mode === "delete" ? "Are you sure you want to delete this student?" : "Fill in the student details."}</DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>This action cannot be undone.</AlertDescription>
            <Button variant="destructive" onClick={onDelete}>Confirm Delete</Button>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Student Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="facultyId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty._id} value={faculty._id}>{faculty.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="classId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>CMS-{cls.semester}-{cls.type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="parentPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Phone</FormLabel>
                  <FormControl><Input placeholder="Parent Phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="studentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl><Input placeholder="Student ID" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit">{mode === "add" ? "Add" : "Save"}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
