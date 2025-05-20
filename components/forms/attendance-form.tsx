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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Attendance } from "@/components/data-tables/attendance-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { students } from "@/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Sample classes for the form
const classes = [
  { id: "1", name: "Computer Science - Semester 1" },
  { id: "2", name: "Electrical Engineering - Semester 2" },
  { id: "3", name: "Marketing - Semester 3" },
  { id: "4", name: "Finance - Semester 4" },
  { id: "5", name: "Nursing - Semester 1" },
]

// Sample courses for the form
const courses = [
  { id: "1", name: "Introduction to Programming", classId: "1" },
  { id: "2", name: "Data Structures", classId: "1" },
  { id: "3", name: "Circuit Analysis", classId: "2" },
  { id: "4", name: "Marketing Principles", classId: "3" },
  { id: "5", name: "Financial Accounting", classId: "4" },
]

// Define the form schema
const formSchema = z.object({
  studentId: z.string({
    required_error: "Please select a student.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  isPresent: z.enum(["true", "false"], {
    required_error: "Please select attendance status.",
  }),
  classId: z.string({
    required_error: "Please select a class.",
  }),
  courseId: z.string({
    required_error: "Please select a course.",
  }),
})

type AttendanceFormValues = z.infer<typeof formSchema>

interface AttendanceDialogProps {
  mode: "add" | "edit" | "delete"
  attendance?: Attendance
}

export function AttendanceDialog({ mode, attendance }: AttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [filteredCourses, setFilteredCourses] = useState(courses)

  // Default values for the form
  const defaultValues: Partial<AttendanceFormValues> = {
    studentId: attendance?.studentId || "",
    date: attendance?.date ? new Date(attendance.date) : new Date(),
    isPresent: attendance?.isPresent ? "true" : "false",
    classId: attendance?.classId || "",
    courseId: attendance?.courseId || "",
  }

  // Initialize the form
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Watch for class changes to filter courses
  const classId = form.watch("classId")

  useEffect(() => {
    if (classId) {
      setFilteredCourses(courses.filter((course) => course.classId === classId))
    } else {
      setFilteredCourses(courses)
    }
  }, [classId])

  // Form submission handler
  function onSubmit(data: AttendanceFormValues) {
    // Convert string to boolean
    const formattedData = {
      ...data,
      isPresent: data.isPresent === "true",
    }

    // In a real app, you would send this data to your backend
    console.log(formattedData)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting attendance record:", attendance?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Individual Record
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
            {mode === "add" ? "Add Attendance" : mode === "edit" ? "Edit Attendance" : "Delete Attendance"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new attendance record to the system."
              : mode === "edit"
                ? "Make changes to the attendance record."
                : "Are you sure you want to delete this attendance record?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the attendance record.
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
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
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
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!classId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
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
                            {student.name}
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            // Close the popover but not the dialog
                            document.body.click()
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPresent"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Attendance Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="present" />
                          <Label htmlFor="present" className="font-normal">
                            Present
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="absent" />
                          <Label htmlFor="absent" className="font-normal">
                            Absent
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
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
