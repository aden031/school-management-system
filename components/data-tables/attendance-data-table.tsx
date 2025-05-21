"use client"

import { useState, useEffect, useMemo } from "react"
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
  classId: { _id: string }
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

const columns: ColumnDef<TransformedAttendance>[] = [
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
]

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

  const transformedAttendances = useMemo(() => {
    return attendances.map(att => {
      const classObj = classes.find(c => c._id === att.classId._id)
      return {
        id: att._id,
        studentId: att.studentId._id,
        studentName: att.studentId.name,
        classId: att.classId._id,
        className: classObj 
          ? `${classObj.departmentId.name} - Semester ${classObj.semester}` 
          : 'Unknown Class',
        courseId: att.courseId._id,
        courseName: att.courseId.courseName,
        date: att.date,
        isPresent: att.isPresent,
      }
    })
  }, [attendances, classes])

  const table = useReactTable({
    data: transformedAttendances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  })

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

  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(student => student.classId._id === selectedClass)
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

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: isPresent }))
  }

  const markAll = (present: boolean) => {
    setAttendanceData(filteredStudents.reduce((acc, student) => ({
      ...acc,
      [student._id]: present
    }), {}))
  }

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
      const response = await fetch('/api/attendances/')
      setAttendances(await response.json())
    } catch (error) {
      console.error("Error submitting attendance:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                      {cls.departmentId.name} - Semester {cls.semester}
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
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  )
}