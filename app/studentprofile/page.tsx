"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, PrinterIcon as Print, User, Calendar, FileText, DollarSign } from "lucide-react"
import { classes, courses, examTypes } from "@/data"
import { useAuth } from "@/components/auth/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Student {
  _id: string
  classId: string
  name: string
  parentPhone: string
  studentId: number
  status: string
  createdAt: string
  updatedAt: string
}

interface StudentReportData {
  student: {
    _id: string
    classId: { _id: string }
    name: string
    gender: string
    parentPhone: string
    phone: string
    studentId: number
    status: string
    createdAt: string
    updatedAt: string
  }
  attendanceHistory: Array<{
    _id: string
    date: string
    courseId: string
    isPresent: boolean
  }>
  examHistory: Array<{
    _id: string
    examTypeId: string
    courseId: string
    marksObtained: number
    createdAt: string
  }>
  feeHistory: any[]
  attendanceStats: {
    totalDays: number
    presentDays: number
    absentDays: number
    percentage: number
  }
}

export default function StudentReportPage() {
  const { user , logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [reportData, setReportData] = useState<StudentReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(true)

  // Fetch students based on parent's phone number
  useEffect(() => {
    if (user?.phone) {
      setLoadingStudents(true)
      fetch(`/api/student/parent/${user.phone}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch students")
          return res.json()
        })
        .then(data => {
          setStudents(data)
          setLoadingStudents(false)
        })
        .catch(error => {
          console.error("Error fetching students:", error)
          setLoadingStudents(false)
        })
    }
  }, [user])

  const generateReport = async () => {
    if (!selectedStudentId) return

    setLoading(true)

    try {
      const response = await fetch(`/api/reports/student-report/${selectedStudentId}`)
      if (!response.ok) throw new Error("Failed to generate report")
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error fetching report:", error)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const getClassName = (classId: string) => 
    classes.find(c => c.id === classId)?.name || "Unknown Class"

  const getCourseName = (courseId: string) => 
    courses.find(c => c.id === courseId)?.name || "Unknown Course"

  const getExamTypeName = (examTypeId: string) => 
    examTypes.find(et => et.id === examTypeId)?.name || "Unknown Exam"

  // Clear report when student selection changes
  useEffect(() => {
    if (selectedStudentId) {
      setReportData(null)
    }
  }, [selectedStudentId])

  return (
    <div className="space-y-6 p-6">
                <div className="titHead flex flex-wrap justify-between">
                <p>Welcome Mr/Ms, {user?.fullname}</p>
              <Button 
                onClick={logout}
                className="w-full md:w-auto"
              >
                Logout
              </Button>
            </div>

      {/* Student Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Student Report
          </CardTitle>
          <CardDescription>
            {students.length > 0 
              ? "Select a student to generate their report" 
              : "No students found for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="student-select">Select Student</Label>
              
              {loadingStudents ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-t-primary rounded-full animate-spin"></div>
                  Loading students...
                </div>
              ) : students.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No students associated with your phone number
                </p>
              ) : (
                <Select 
                  value={selectedStudentId} 
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student._id} value={student._id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.name}</span>
                          <Badge variant="secondary">ID: {student.studentId}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateReport}
                disabled={loading || !selectedStudentId || students.length === 0}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </span>
                ) : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="flex justify-between items-start print:hidden">
            <div>
              <h2 className="text-xl font-semibold">Student Report</h2>
              <p className="text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => console.log("Download report")}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button> */}
            </div>
          </div>

          {/* Student Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{reportData.student.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Student ID</Label>
                  <p className="font-medium">{reportData.student.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Parent Phone</Label>
                  <p className="font-medium">{reportData.student.parentPhone}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Class</Label>
                  <p className="font-medium">{getClassName(reportData.student.classId._id)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Enrollment Date</Label>
                  <p className="font-medium">
                    {new Date(reportData.student.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge variant={reportData.student.status === "active" ? "default" : "destructive"}>
                    {reportData.student.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.attendanceStats.totalDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.attendanceStats.presentDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Present</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.attendanceStats.absentDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Absent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {reportData.attendanceStats.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
              </div>

              {reportData.attendanceHistory.length > 0 ? (
                <>
                  <h4 className="font-medium mb-3">Recent Attendance Records</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.attendanceHistory.slice(0, 7).map(record => (
                          <TableRow key={record._id}>
                            <TableCell>
                              {new Date(record.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getCourseName(record.courseId)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={record.isPresent ? "default" : "destructive"}
                                className="justify-end"
                              >
                                {record.isPresent ? "Present" : "Absent"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No attendance records available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Exam History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exam Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.examHistory.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Exam Type</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.examHistory.map(exam => {
                        const examType = examTypes.find(et => et.id === exam.examTypeId)
                        const percentage = Math.round(
                          (exam.marksObtained / (examType?.marks || 100)) * 100
                        )
                        const grade = percentage >= 90 ? "A+" :
                          percentage >= 80 ? "A" :
                          percentage >= 70 ? "B" :
                          percentage >= 60 ? "C" :
                          percentage >= 50 ? "D" : "F"

                        return (
                          <TableRow key={exam._id}>
                            <TableCell>
                              {new Date(exam.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getCourseName(exam.courseId)}</TableCell>
                            <TableCell>{getExamTypeName(exam.examTypeId)}</TableCell>
                            <TableCell className="text-right">
                              {exam.marksObtained} / {examType?.marks || 100}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={grade > "D" ? "default" : "destructive"}>
                                {grade} ({percentage}%)
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No exam records available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Fee History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.feeHistory.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.feeHistory.map(fee => (
                        <TableRow key={fee._id}>
                          <TableCell className="capitalize">{fee.financeType}</TableCell>
                          <TableCell className="text-right">${fee.amount}</TableCell>
                          <TableCell className="text-right">${fee.amountPaid}</TableCell>
                          <TableCell className="text-right">${fee.balance}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                fee.status === "paid" ? "default" : 
                                fee.status === "partial" ? "secondary" : 
                                "destructive"
                              }
                            >
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No fee records available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty States */}
      {!reportData && selectedStudentId && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground flex flex-col items-center">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Report Data Available</h3>
              <p className="mt-2 max-w-md">
                We couldn't find any report data for the selected student. 
                Try generating the report again or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {students.length === 0 && !loadingStudents && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground flex flex-col items-center">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Students Found</h3>
              <p className="mt-2 max-w-md">
                Your account ({user?.phone}) is not associated with any students.
                Please contact the school administration if this is incorrect.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}