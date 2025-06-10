"use client"

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
import type { User } from "@/components/data-tables/users-data-table"
import { Edit, PlusCircle, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Password validation regex and error message
const strongPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const passwordErrorMsg = "Password must be at least 8 characters long and include at least one letter, one number, and one symbol.";

// Phone validation regex and error message
const phoneRegex = /^\?[1-9]\d{1,14}$/; // E.164 format (supports international numbers)
const phoneErrorMsg = "Please enter a valid phone number including country code (e.g., +12345678901)";

// Separate schemas
const baseUserSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]+$/, "Phone number must contain only digits."),
  title: z.string(),
  status: z.string(),
  studentId: z.string().optional(), // Added studentId field
});

const addUserSchema = baseUserSchema.extend({
  password: z.string().regex(strongPasswordRegex, passwordErrorMsg),
}).refine(data => data.title !== 'student' || data.studentId, {
  message: "Student selection is required",
  path: ["studentId"],
});

const editUserSchema = baseUserSchema.extend({
  password: z.string().optional().or(z.literal('')).refine(
    password => !password || strongPasswordRegex.test(password),
    { message: passwordErrorMsg }
  ),
}).refine(data => data.title !== 'student' || data.studentId, {
  message: "Student selection is required",
  path: ["studentId"],
});

type UsersFormValues = z.infer<typeof addUserSchema> | z.infer<typeof editUserSchema>;

interface UsersDialogProps {
  mode: "add" | "edit" | "delete"
  user?: User
  onDone?: () => void
}

interface Student {
  _id: string;
  name: string;
  studentId: number;
}

export function UsersDialog({ mode, user, onDone }: UsersDialogProps) {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])

  const defaultValues: Partial<UsersFormValues> = {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    title: user?.title || "teacher",
    status: user?.status || "active",
    studentId: user?.studentId?.toString() || "", // Added studentId default value
  }

  const form = useForm<UsersFormValues>({
    resolver: zodResolver(mode === "add" ? addUserSchema : editUserSchema),
    defaultValues,
  })

  const titleValue = form.watch("title")

  // Fetch students when dialog opens and title is student
  useEffect(() => {
    const fetchStudents = async () => {
      if (open && titleValue === "student") {
        try {
          const response = await axios.get("/api/student")
          setStudents(response.data)
        } catch (error) {
          console.error("Failed to fetch students:", error)
          setStudents([])
        }
      }
    }

    fetchStudents()
  }, [open, titleValue])

  const handleClose = () => {
    setOpen(false)
    form.reset()
    setStudents([])
  }

  const onSubmit = async (data: UsersFormValues) => {
    setLoading(true)
    try {
      const payload: any = {
        FullName: data.fullName,
        Email: data.email,
        phone: data.phone,
        Title: data.title,
        status: data.status,
      }

      // Add studentId if title is student
      if (data.title === "student" && data.studentId) {
        payload.studentId = parseInt(data.studentId)
      }

      // Only send password if it exists or in add mode
      if (mode === "add" || data.password) {
        payload.password = data.password
      }

      if (mode === "add") {
        await axios.post("/api/users/user", payload)
      } else if (mode === "edit" && user?.id) {
        await axios.put(`/api/users/user`, { id: user.id, ...payload })
      }

      onDone?.()
      handleClose()
    } catch (error) {
      console.error("User operation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      await axios.delete(`/api/users/user?id=${user.id}`)
      onDone?.()
      handleClose()
    } catch (error) {
      console.error("Failed to delete user:", error)
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
            Add User
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
            {mode === "add" ? "Add User" : mode === "edit" ? "Edit User" : "Delete User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new user to the system."
              : mode === "edit"
              ? "Make changes to the user information."
              : "Are you sure you want to delete this user?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the user from the system.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={loading}>
                Delete
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
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
                      <Input 
                        placeholder="+12345678901" 
                        type="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password{" "}
                      {mode === "edit" && (
                        <span className="text-muted-foreground text-xs">(Leave blank to keep current)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="officer">Officer</SelectItem>
                        <SelectItem value="student">Student</SelectItem> {/* Added student option */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Student selection field - only shown when title is student */}
              {titleValue === "student" && (
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Student</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={students.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={students.length ? "Select a student" : "Loading students..."} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem 
                              key={student._id} 
                              value={student.studentId.toString()}
                            >
                              {student.name} (ID: {student.studentId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {students.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No active students found
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="submit" disabled={loading}>
                  {mode === "add" ? "Add" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}