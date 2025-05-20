"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Loader2, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
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

// Sample students
const students = [
  { id: "1", name: "John Doe", studentId: "STU001", classId: "1" },
  { id: "2", name: "Jane Smith", studentId: "STU002", classId: "1" },
  { id: "3", name: "Bob Johnson", studentId: "STU003", classId: "1" },
  { id: "4", name: "Alice Brown", studentId: "STU004", classId: "2" },
  { id: "5", name: "Charlie Wilson", studentId: "STU005", classId: "2" },
  { id: "6", name: "David Lee", studentId: "STU006", classId: "3" },
  { id: "7", name: "Eva Garcia", studentId: "STU007", classId: "3" },
  { id: "8", name: "Frank Miller", studentId: "STU008", classId: "4" },
  { id: "9", name: "Grace Taylor", studentId: "STU009", classId: "4" },
  { id: "10", name: "Henry Davis", studentId: "STU010", classId: "5" },
  { id: "11", name: "Ivy Robinson", studentId: "STU011", classId: "1" },
  { id: "12", name: "Jack White", studentId: "STU012", classId: "1" },
  { id: "13", name: "Karen Martin", studentId: "STU013", classId: "2" },
  { id: "14", name: "Leo Thompson", studentId: "STU014", classId: "3" },
  { id: "15", name: "Mia Anderson", studentId: "STU015", classId: "4" },
]

// Define the Attendance type
export type Attendance = {
  id: string
  studentId: string
  studentName: string
  date: string
  isPresent: boolean
  classId: string
  className: string
  courseId: string
  courseName: string
  userId: string
  userName: string
}

// Sample attendance records
const attendanceRecords: Attendance[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Doe",
    date: "2023-10-15",
    isPresent: true,
    classId: "1",
    className: "Computer Science - Semester 1",
    courseId: "1",
    courseName: "Introduction to Programming",
    userId: "1",
    userName: "Admin User",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Jane Smith",
    date: "2023-10-15",
    isPresent: false,
    classId: "1",
    className: "Computer Science - Semester 1",
    courseId: "1",
    courseName: "Introduction to Programming",
    userId: "1",
    userName: "Admin User",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Bob Johnson",
    date: "2023-10-15",
    isPresent: true,
    classId: "1",
    className: "Computer Science - Semester 1",
    courseId: "1",
    courseName: "Introduction to Programming",
    userId: "1",
    userName: "Admin User",
  },
]

// Define columns for the attendance history table
const columns: ColumnDef<Attendance>[] = [
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
    cell: ({ row }) => {
      const date = row.getValue("date") as string
      return format(new Date(date), "PPP")
    },
  },
  {
    accessorKey: "isPresent",
    header: "Status",
    cell: ({ row }) => {
      const isPresent = row.getValue("isPresent") as boolean
      return isPresent ? (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Present
        </Badge>
      ) : (
        <Badge variant="destructive" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Absent
        </Badge>
      )
    },
  },
]

export function AttendanceDataTable() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [filteredStudents, setFilteredStudents] = useState<typeof students>([])
  const [filteredCourses, setFilteredCourses] = useState<typeof courses>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Table state for attendance history
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Initialize the table
  const table = useReactTable({
    data: attendanceRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // Update filtered courses when class changes
  useEffect(() => {
    if (selectedClass) {
      const classSpecificCourses = courses.filter((course) => course.classId === selectedClass)
      setFilteredCourses(classSpecificCourses)
      setSelectedCourse(null) // Reset selected course
    } else {
      setFilteredCourses([])
    }
  }, [selectedClass])

  // Update filtered students when class changes
  useEffect(() => {
    if (selectedClass) {
      const classStudents = students.filter((student) => student.classId === selectedClass)
      setFilteredStudents(classStudents)

      // Initialize attendance data with all students present
      const initialAttendance: Record<string, boolean> = {}
      classStudents.forEach((student) => {
        initialAttendance[student.id] = true
      })
      setAttendanceData(initialAttendance)
    } else {
      setFilteredStudents([])
      setAttendanceData({})
    }
  }, [selectedClass])

  // Handle checkbox change
  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }))
  }

  // Mark all students as present or absent
  const markAll = (present: boolean) => {
    const updatedAttendance: Record<string, boolean> = {}
    filteredStudents.forEach((student) => {
      updatedAttendance[student.id] = present
    })
    setAttendanceData(updatedAttendance)
  }

  // Submit attendance data
  const submitAttendance = async () => {
    if (!selectedClass || !selectedCourse) return

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      // Format data for submission
      const formattedData = {
        classId: selectedClass,
        courseId: selectedCourse,
        date: selectedDate,
        records: Object.entries(attendanceData).map(([studentId, isPresent]) => ({
          studentId,
          isPresent,
        })),
      }

      // In a real app, you would send this data to your backend
      console.log("Submitting attendance data:", formattedData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Error submitting attendance:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Class Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Management
          </CardTitle>
          <CardDescription>Select a class and course to mark attendance for all students.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select onValueChange={(value) => setSelectedClass(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select
                onValueChange={(value) => setSelectedCourse(value)}
                disabled={!selectedClass || filteredCourses.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
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
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {selectedClass && selectedCourse ? (
            <Card className="border mt-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Mark Attendance</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => markAll(true)}>
                      All Present
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => markAll(false)}>
                      All Absent
                    </Button>
                  </div>
                </div>
                <CardDescription>Check the box for present students, leave unchecked for absent.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>No students found in this class.</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-0">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between py-3 border-b last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={attendanceData[student.id] || false}
                                onCheckedChange={(checked) => handleAttendanceChange(student.id, checked === true)}
                              />
                              <div>
                                <Label htmlFor={`student-${student.id}`} className="text-sm font-medium cursor-pointer">
                                  {student.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">ID: {student.studentId}</p>
                              </div>
                            </div>
                            <Badge variant={attendanceData[student.id] ? "success" : "destructive"}>
                              {attendanceData[student.id] ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={submitAttendance}
                        disabled={isSubmitting || filteredStudents.length === 0}
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
                            Attendance Saved!
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Submit Attendance
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
              <AlertDescription>Please select both a class and course to mark attendance.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance History</CardTitle>
          <CardDescription>View and filter past attendance records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} attendance record(s) found.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
