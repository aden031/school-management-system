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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Exam } from "@/components/data-tables/exam-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { students, courses, examTypes } from "@/data"

// Define the form schema
const formSchema = z.object({
  studentId: z.string({
    required_error: "Please select a student.",
  }),
  examTypeId: z.string({
    required_error: "Please select an exam type.",
  }),
  courseId: z.string({
    required_error: "Please select a course.",
  }),
  marksObtained: z.coerce.number().min(0, {
    message: "Marks obtained must be at least 0.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
})

type ExamFormValues = z.infer<typeof formSchema>

interface ExamDialogProps {
  mode: "add" | "edit" | "delete"
  exam?: Exam
}

export function ExamDialog({ mode, exam }: ExamDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedExamType, setSelectedExamType] = useState<string | null>(exam?.examTypeId || null)
  const [maxMarks, setMaxMarks] = useState<number>(0)

  // Default values for the form
  const defaultValues: Partial<ExamFormValues> = {
    studentId: exam?.studentId || "",
    examTypeId: exam?.examTypeId || "",
    courseId: exam?.courseId || "",
    marksObtained: exam?.marksObtained || 0,
    date: exam?.date ? new Date(exam.date) : undefined,
  }

  // Initialize the form
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Watch for exam type changes to update max marks
  const examTypeId = form.watch("examTypeId")
  const marksObtained = form.watch("marksObtained")

  useEffect(() => {
    if (examTypeId) {
      setSelectedExamType(examTypeId)
      const selectedType = examTypes.find((type) => type.id === examTypeId)
      if (selectedType) {
        setMaxMarks(selectedType.marks)

        // If marks obtained is greater than max marks, reset it
        if (marksObtained > selectedType.marks) {
          form.setValue("marksObtained", selectedType.marks)
        }
      }
    }
  }, [examTypeId, form, marksObtained])

  // Form submission handler
  function onSubmit(data: ExamFormValues) {
    // In a real app, you would send this data to your backend
    console.log(data)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting exam:", exam?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Exam
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
          <DialogTitle>{mode === "add" ? "Add Exam" : mode === "edit" ? "Edit Exam" : "Delete Exam"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new exam record to the system."
              : mode === "edit"
                ? "Make changes to the exam record."
                : "Are you sure you want to delete this exam record?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the exam record.
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
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.courseName} ({course.code})
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
                name="examTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an exam type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {examTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name.charAt(0).toUpperCase() + type.name.slice(1)} ({type.marks} marks)
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
                name="marksObtained"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks Obtained</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="number" placeholder="Enter marks obtained" {...field} min={0} max={maxMarks} />
                        {selectedExamType && (
                          <span className="text-sm text-muted-foreground whitespace-nowrap">/ {maxMarks}</span>
                        )}
                      </div>
                    </FormControl>
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
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
