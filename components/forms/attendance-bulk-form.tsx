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
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ClipboardList, Info, Loader2 } from "lucide-react"
import { students } from "@/data"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  courseId: z.string({
    required_error: "Please select a course.",
  }),
  date: z.string({
    required_error: "Please select a date.",
  }),
  attendanceRecords: z.array(
    z.object({
      studentId: z.string(),
      isPresent: z.boolean().default(true),
    }),
  ),
})

type BulkAttendanceFormValues = z.infer<typeof formSchema>

interface AttendanceBulkFormProps {
  classId: string | null
  date: string
}

export function AttendanceBulkForm({ classId, date }: AttendanceBulkFormProps) {
  const [open, setOpen] = useState(false)
  const [filteredCourses, setFilteredCourses] = useState(courses)
  const [filteredStudents, setFilteredStudents] = useState(students)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Default values for the form
  const defaultValues: Partial<BulkAttendanceFormValues> = {
    courseId: "",
    date: date,
    attendanceRecords: students
      .filter((student) => student.classId === classId)
      .map((student) => ({
        studentId: student.id,
        isPresent: true,
      })),
  }

  // Initialize the form
  const form = useForm<BulkAttendanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Update form when classId or date changes
  useEffect(() => {
    if (classId) {
      // Filter courses by class
      setFilteredCourses(courses.filter((course) => course.classId === classId))

      // Filter students by class
      const classStudents = students.filter((student) => student.classId === classId)
      setFilteredStudents(classStudents)

      // Update form values
      form.setValue("date", date)
      form.setValue(
        "attendanceRecords",
        classStudents.map((student) => ({
          studentId: student.id,
          isPresent: true,
        })),
      )
    }
  }, [classId, date, form])

  // Form submission handler
  async function onSubmit(data: BulkAttendanceFormValues) {
    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      // In a real app, you would send this data to your backend
      console.log(data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setIsSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Error submitting attendance:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle all students present/absent
  const toggleAll = (present: boolean) => {
    const currentRecords = form.getValues("attendanceRecords")
    const updatedRecords = currentRecords.map((record) => ({
      ...record,
      isPresent: present,
    }))
    form.setValue("attendanceRecords", updatedRecords)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!classId} variant="default">
          <ClipboardList className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Attendance</DialogTitle>
          <DialogDescription>Mark attendance for all students in the selected class and course.</DialogDescription>
        </DialogHeader>

        {!classId ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>Please select a class first to mark attendance.</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="h-10 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                          {format(new Date(field.value), "PPP")}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Students</FormLabel>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(true)}>
                      Mark All Present
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(false)}>
                      Mark All Absent
                    </Button>
                  </div>
                </div>

                <Card className="border">
                  <ScrollArea className="h-[300px] p-4">
                    <div className="space-y-4">
                      {filteredStudents.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No students found in this class.</p>
                      ) : (
                        filteredStudents.map((student, index) => (
                          <div key={student.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                            <FormField
                              control={form.control}
                              name={`attendanceRecords.${index}.isPresent`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">{student.name}</FormLabel>
                                    <p className="text-xs text-muted-foreground">ID: {student.studentId}</p>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <input
                              type="hidden"
                              {...form.register(`attendanceRecords.${index}.studentId`)}
                              value={student.id}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || filteredStudents.length === 0}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    "Save Attendance"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
