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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Edit, PlusCircle, Trash2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Exam } from "@/components/data-tables/exam-data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  studentId: z.string({ required_error: "Please select a student." }),
  examTypeId: z.string({ required_error: "Please select an exam type." }),
  courseId: z.string({ required_error: "Please select a course." }),
  marksObtained: z.coerce.number().min(0, { message: "Marks obtained must be at least 0." }),
  date: z.date({ required_error: "Please select a date." }),
})

type ExamFormValues = z.infer<typeof formSchema>

interface ExamDialogProps {
  mode: "add" | "edit" | "delete"
  exam?: Exam
  onDone?: () => void
}

export function ExamDialog({ mode, exam, onDone }: ExamDialogProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<{ _id: string; name: string }[]>([])
  const [courses, setCourses] = useState<{ _id: string; courseName: string }[]>([])
  const [examTypes, setExamTypes] = useState<{ _id: string; name: string; marks: number; description?: string }[]>([])
  const [selectedExamType, setSelectedExamType] = useState<string | null>(exam?.examTypeId || null)
  const [maxMarks, setMaxMarks] = useState<number>(0)

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: exam?.studentId || "",
      examTypeId: exam?.examTypeId || "",
      courseId: exam?.courseId || "",
      marksObtained: exam?.marksObtained || 0,
      date: exam?.date ? new Date(exam.date) : undefined,
    },
  })

  const examTypeId = form.watch("examTypeId")
  const marksObtained = form.watch("marksObtained")

  useEffect(() => {
    fetch("/api/student")
      .then((res) => res.json())
      .then((data) => setStudents(data))

    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))

    fetch("/api/exam-types/")
      .then((res) => res.json())
      .then((data) => setExamTypes(data))
  }, [])

  useEffect(() => {
    if (examTypeId) {
      setSelectedExamType(examTypeId)
      const selectedType = examTypes.find((type) => type._id === examTypeId)
      if (selectedType) {
        setMaxMarks(selectedType.marks)
        if (marksObtained > selectedType.marks) {
          form.setValue("marksObtained", selectedType.marks)
        }
      }
    }
  }, [examTypeId, examTypes, form, marksObtained])

  const onSubmit = async (data: ExamFormValues) => {
    const payload = {
      ...data,
      date: data.date.toISOString().split("T")[0],
    }

    const res = await fetch(mode === "edit" ? `/api/exams/${exam?.id}` : "/api/exams", {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    onDone?.()
  }

  const onDelete = async () => {
    if (!exam?.id) return
    const res = await fetch(`/api/exams/${exam.id}`, { method: "DELETE" })
      setOpen(false)
      onDone?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button><PlusCircle className="mr-2 h-4 w-4" />Kudar Imtixaan</Button>
        ) : mode === "edit" ? (
          <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Kudar Imtixaan" : mode === "edit" ? "Wax kabadal imtixaan" : "Deletegareey Imtixaan"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Kudar natiijo imtixaan cusub." : mode === "edit" ? "Updategreey natiijada imtixaanka ." : "Xaqiiji deletegareynta."}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Diginiin</AlertTitle>
              <AlertDescription>Falkan dib loogama laaban karo Haddii uu dhaco.</AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Ka laabo</Button>
              <Button variant="destructive" onClick={onDelete}>Deletegarey</Button>
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
                    <FormLabel>Aedayga</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Dooro Ardayga" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
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
                    <FormLabel>Maadada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Dooro Maadada" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c._id} value={c._id}>{c.courseName}</SelectItem>
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
                    <FormLabel>Nuuca Imtixaanka</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Dooro nuuca imtixaanka" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {examTypes.map((t) => (
                          <SelectItem key={t._id} value={t._id}>{t.name} ({t.marks} marks)</SelectItem>
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
                    <FormLabel>Natiijada</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input type="number" {...field} min={0} max={maxMarks} />
                        {selectedExamType && <span className="text-muted-foreground text-sm">/ {maxMarks}</span>}
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
                    <FormLabel>Taariikhda</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full text-left pl-3 font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{mode === "add" ? "Kudar" : "Xareey is bedelka"}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
