"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Loader2, Save, Edit, PlusCircle, Trash2, Info, CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Types
type ClassType = {
  _id: string
  facultyId: { _id: string; name: string }
  departmentId: { _id: string; name: string }
  semester: number
  classMode: string
  type: string
  status: string
}

type CourseType = {
  _id: string
  departmentId: { _id: string; name: string }
  courseName: string
  code: string
  semester: number
}

type StudentType = {
  _id: string
  classId: { _id: string } | string
  name: string
  studentId: number
}

type AttendanceType = {
  _id: string
  studentId: { _id: string; name: string; studentId: number }
  classId: { _id: string; semester: number; type: string }
  courseId: { _id: string; courseName: string }
  date: string
  isPresent: boolean
}

type TransformedAttendance = {
  id: string
  studentId: string
  studentName: string
  classId: string
  className: string
  courseId: string
  courseName: string
  date: string
  isPresent: boolean
}

// Form schema for CRUD operations
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
  attendance?: TransformedAttendance
  classes: ClassType[]
  courses: CourseType[]
  students: StudentType[]
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (data: AttendanceFormValues, id?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

function AttendanceDialog({
  mode,
  attendance,
  classes,
  courses,
  students,
  open,
  setOpen,
  onSubmit,
  onDelete
}: AttendanceDialogProps) {
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
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([])

  useEffect(() => {
    if (classId) {
      const selectedClass = classes.find(c => c._id === classId)
      if (selectedClass) {
        const departmentId = selectedClass.departmentId._id
        setFilteredCourses(courses.filter(course => course.departmentId._id === departmentId))
      }
    } else {
      setFilteredCourses([])
    }
  }, [classId, classes, courses])

  // Form submission handler
  const handleSubmit = async (data: AttendanceFormValues) => {
    await onSubmit(data, attendance?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Info className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the attendance record.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => onDelete && attendance && onDelete(attendance.id)}>
                Delete
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                        {classes.map(cls => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.departmentId?.name
                              ? `${cls.departmentId.name} - class ${cls.semester}`
                              : `Unknown Department - class ${cls.semester}`}
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
                        {filteredCourses.map(course => (
                          <SelectItem key={course._id} value={course._id}>
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
                        {students.map(student => (
                          <SelectItem key={student._id} value={student._id}>
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
                      <PopoverContent className="w-auto p-0" align="start" onClick={e => e.stopPropagation()}>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={date => {
                            field.onChange(date)
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

export function AttendanceDataTable() {
  const [classes, setClasses] = useState<ClassType[]>([])
  const [courses, setCourses] = useState<CourseType[]>([])
  const [students, setStudents] = useState<StudentType[]>([])
  const [attendances, setAttendances] = useState<AttendanceType[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [filteredStudents, setFilteredStudents] = useState<StudentType[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  // Date filter state for history table
  const [dateFilter, setDateFilter] = useState({ 
    from: format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"), 
    to: format(new Date(), "yyyy-MM-dd") 
  })
  
  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean
    mode: "add" | "edit" | "delete"
    attendance?: TransformedAttendance
  }>({
    open: false,
    mode: "add",
  })

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, coursesRes, studentsRes, attendancesRes] = await Promise.all([
          fetch('/api/classes/'),
          fetch('/api/courses/'),
          fetch('/api/student/'),
          fetch('/api/attendances/')
        ])
        
        setClasses(await classesRes.json())
        setCourses(await coursesRes.json())
        setStudents(await studentsRes.json())
        setAttendances(await attendancesRes.json())
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  // Transform attendance data for table
  const transformedAttendances = useMemo(() => {
    return attendances.map(att => {
      const classObj = classes.find(c => c._id === att.classId?._id)
      return {
        id: att._id ?? "",
        studentId: att.studentId?._id ?? "",
        studentName: att.studentId?.name ?? "Unknown Student",
        classId: att.classId?._id ?? "",
        className: classObj
          ? `${classObj.departmentId.name} - class ${classObj.semester}`
          : "Unknown Class",
        courseId: att.courseId?._id ?? "",
        courseName: att.courseId?.courseName ?? "Unknown Course",
        date: att.date ?? "",
        isPresent: typeof att.isPresent === "boolean" ? att.isPresent : false,
      }
    })
  }, [attendances, classes])

  // Filter attendance history by date range
  const filteredByDateAttendances = useMemo(() => {
    if (!dateFilter.from && !dateFilter.to) return transformedAttendances;
    
    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
    
    if (toDate) toDate.setHours(23, 59, 59, 999); // End of day
    
    return transformedAttendances.filter(att => {
      const attDate = new Date(att.date);
      const isAfterFrom = fromDate ? attDate >= fromDate : true;
      const isBeforeTo = toDate ? attDate <= toDate : true;
      return isAfterFrom && isBeforeTo;
    });
  }, [transformedAttendances, dateFilter])

  // Filter courses based on selected class
  useEffect(() => {
    if (selectedClass) {
      const selectedClassObj = classes.find(c => c._id === selectedClass)
      if (selectedClassObj) {
        const departmentId = selectedClassObj.departmentId._id
        setFilteredCourses(courses.filter(course => course.departmentId._id === departmentId))
      }
      setSelectedCourse(null)
    } else {
      setFilteredCourses([])
    }
  }, [selectedClass, classes, courses])

  // Filter students based on selected class
  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(student => {
        if (typeof student.classId === "string") {
          return student.classId === selectedClass
        }
        if (student.classId && typeof student.classId._id === "string") {
          return student.classId._id === selectedClass
        }
        return false
      })
      setFilteredStudents(filtered)
      const initialAttendance = filtered.reduce((acc, student) => ({
        ...acc,
        [student._id]: true
      }), {})
      setAttendanceData(initialAttendance)
    } else {
      setFilteredStudents([])
      setAttendanceData({})
    }
  }, [selectedClass, students])

  // Handle attendance change for a student
  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: isPresent }))
  }

  // Mark all students as present or absent
  const markAll = (present: boolean) => {
    setAttendanceData(filteredStudents.reduce((acc, student) => ({
      ...acc,
      [student._id]: present
    }), {}))
  }

  // Submit attendance for the whole class
  const submitAttendance = async () => {
    if (!selectedClass || !selectedCourse || !selectedDate) return

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      await Promise.all(filteredStudents.map(async student => {
        await fetch('/api/attendances/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student._id,
            classId: selectedClass,
            courseId: selectedCourse,
            date: new Date(selectedDate).toISOString(),
            isPresent: attendanceData[student._id] || false
          })
        })
      }))

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 1500)
      await fetchAttendances()
    } catch (error) {
      console.error("Error submitting attendance:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch attendances
  const fetchAttendances = async () => {
    try {
      const response = await fetch('/api/attendances/')
      const data = await response.json()
      setAttendances(data)
    } catch (error) {
      console.error("Error fetching attendances:", error)
    }
  }

  // Handle CRUD operations for individual records
  const handleCrudOperation = async (data: AttendanceFormValues, id?: string) => {
    const formattedData = {
      studentId: data.studentId,
      classId: data.classId,
      courseId: data.courseId,
      date: data.date.toISOString(),
      isPresent: data.isPresent === "true"
    }

    try {
      if (dialogState.mode === "add") {
        await fetch('/api/attendances/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        })
      } else if (dialogState.mode === "edit" && id) {
        await fetch(`/api/attendances/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        })
      }
      await fetchAttendances()
    } catch (error) {
      console.error("Error performing operation:", error)
    }
  }

  // Handle delete operation
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/attendances/${id}`, {
        method: 'DELETE'
      })
      await fetchAttendances()
    } catch (error) {
      console.error("Error deleting attendance:", error)
    }
  }

  // Open edit dialog
  const handleEditClick = useCallback((attendance: TransformedAttendance) => {
    setDialogState({
      open: true,
      mode: "edit",
      attendance
    })
  }, [])

  // Open delete dialog
  const handleDeleteClick = useCallback((attendance: TransformedAttendance) => {
    setDialogState({
      open: true,
      mode: "delete",
      attendance
    })
  }, [])

  // Open add dialog
  const handleAddClick = useCallback(() => {
    setDialogState({
      open: true,
      mode: "add"
    })
  }, [])

  // Define columns with action buttons
  const columns = useMemo<ColumnDef<TransformedAttendance>[]>(() => [
    {
      accessorKey: "studentName",
      header: "Student",
    },
    {
      accessorKey: "className",
      header: "Class",
    },
    {
      accessorKey: "courseName",
      header: "Course",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), "PPP"),
    },
    {
      accessorKey: "isPresent",
      header: "Status",
      cell: ({ row }) => row.getValue("isPresent") ? (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Present
        </Badge>
      ) : (
        <Badge variant="destructive" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Absent
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const attendance = row.original
        
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditClick(attendance)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteClick(attendance)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [handleEditClick, handleDeleteClick])

  // Initialize table
  const table = useReactTable({
    data: filteredByDateAttendances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Management
          </CardTitle>
          <CardDescription>Select a class and course to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.departmentId?.name
                      ? `${cls.departmentId.name} - Fasalka ${cls.semester}`
                      : `Xarun aan laga gran  - Fasalka ${cls.semester}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select
                value={selectedCourse || ""}
                onValueChange={setSelectedCourse}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {selectedClass && selectedCourse ? (
            <Card className="border mt-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Mark Attendance</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => markAll(true)}>
                      All Present
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => markAll(false)}>
                      All Absent
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>No students found in this class</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-0">
                        {filteredStudents.map(student => (
                          <div
                            key={student._id}
                            className="flex items-center justify-between py-3 border-b"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`student-${student._id}`}
                                checked={attendanceData[student._id] || false}
                                onCheckedChange={checked => 
                                  handleAttendanceChange(student._id, checked === true)
                                }
                              />
                              <div>
                                <Label htmlFor={`student-${student._id}`} className="cursor-pointer">
                                  {student.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  ID: {student.studentId}
                                </p>
                              </div>
                            </div>
                            <Badge variant={attendanceData[student._id] ? "success" : "destructive"}>
                              {attendanceData[student._id] ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={submitAttendance}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>Select a class and course to begin</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Attendance History</CardTitle>
            <Button variant="outline" onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Individual Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date filter for history table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Date Range (From)</Label>
              <Input
                type="date"
                value={dateFilter.from}
                onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Range (To)</Label>
              <Input
                type="date"
                value={dateFilter.to}
                onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setDateFilter({ from: '', to: '' })}
                className="w-full"
              >
                Clear Date Filter
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CRUD Dialog */}
      <AttendanceDialog
        mode={dialogState.mode}
        attendance={dialogState.attendance}
        classes={classes}
        courses={courses}
        students={students}
        open={dialogState.open}
        setOpen={(open) => setDialogState(prev => ({ ...prev, open }))}
        onSubmit={handleCrudOperation}
        onDelete={handleDelete}
      />
    </div>
  )
}