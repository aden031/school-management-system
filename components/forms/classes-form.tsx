"use client"

import { useEffect, useState } from "react"
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, PlusCircle, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  facultyId: z.string().min(1, { message: "Please select a faculty." }),
  departmentId: z.string().min(1, { message: "Please select a department." }),
  semester: z.coerce.number().min(1).max(8),
  classMode: z.enum(["full time", "part time"]),
  type: z.enum(["A", "B", "C", "D"]),
  status: z.enum(["active", "inactive"]),
})

type ClassesFormValues = z.infer<typeof formSchema>

interface Classes {
  id?: string
  facultyId: string
  departmentId: string
  semester: number
  classMode: "full time" | "part time"
  type: "A" | "B" | "C" | "D"
  status: "active" | "inactive"
}

interface ClassesDialogProps {
  mode: "add" | "edit" | "delete"
  classes?: Classes
  onDone?: () => void
}

export function ClassesDialog({ mode, classes, onDone }: ClassesDialogProps) {
  const [open, setOpen] = useState(false)
  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([])

  const form = useForm<ClassesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facultyId: "",
      departmentId: "",
      semester: 1,
      classMode: "full time",
      type: "A",
      status: "active",
    },
  })

  useEffect(() => {
    fetch("/api/faculty")
      .then(res => res.json())
      .then(data => setFaculties(data))

    fetch("/api/department")
      .then(res => res.json())
      .then(data => setDepartments(data))
  }, [])

  // Update form values when editing
  useEffect(() => {
    if (mode === "edit" && classes) {
      form.reset({
        facultyId: classes.facultyId,
        departmentId: classes.departmentId,
        semester: classes.semester,
        classMode: classes.classMode,
        type: classes.type,
        status: classes.status,
      })
    }
  }, [classes, form, mode])

  const onSubmit = async (data: ClassesFormValues) => {
    try {
      const payload = { ...data }

      if (mode === "add") {
        await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        onDone?.()
      } else if (mode === "edit" && classes?.id) {
        await fetch(`/api/classes/${classes.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        onDone?.()
      }

      setOpen(false)
    } catch (err) {
      console.error("Error submitting form", err)
    }
  }

  const onDelete = async () => {
    try {
      if (classes?.id) {
        await fetch(`/api/classes/${classes.id}`, {
          method: "DELETE",
        })
        onDone?.()
        setOpen(false)
      }
    } catch (err) {
      console.error("Error deleting class", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Class</Button>
        ) : mode === "edit" ? (
          <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
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
              <AlertDescription>This action cannot be undone.</AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={onDelete}>Delete</Button>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a faculty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {faculties.map((f) => (
                          <SelectItem key={f._id} value={f._id}>
                            {f.name}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="classMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Mode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
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
