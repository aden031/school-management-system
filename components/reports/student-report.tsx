"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, PrinterIcon as Print, User, Calendar, FileText, DollarSign } from "lucide-react"
import { classes, courses, examTypes } from "@/data"

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

export function StudentReport() {
  const [studentId, setStudentId] = useState("")
  const [reportData, setReportData] = useState<StudentReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    if (!studentId.trim()) return

    setLoading(true)

    try {
      const response = await fetch(`/api/reports/student-report/${studentId}`)
      if (!response.ok) {
        throw new Error("Student not found")
      }
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error fetching report:", error)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Implement download functionality
    console.log("Download report")
  }

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id === classId)?.name || "Unknown"
  }

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || "Unknown"
  }

  const getExamTypeName = (examTypeId: string) => {
    return examTypes.find((et) => et.id === examTypeId)?.name || "Unknown"
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Generate Student Report
          </CardTitle>
          <CardDescription>Enter a student ID or roll number to generate a comprehensive report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="studentId">Student ID / Roll Number</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID or roll number"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && generateReport()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="flex justify-between items-start print:hidden">
            <div>
              <h2 className="text-xl font-semibold">Student Report</h2>
              <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="font-medium">{reportData.student.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Roll Number</Label>
                  <p className="font-medium">{reportData.student.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Parent Phone</Label>
                  <p className="font-medium">{reportData.student.parentPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student Phone</Label>
                  <p className="font-medium">{reportData.student.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Class</Label>
                  <p className="font-medium">{getClassName(reportData.student.classId._id)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  <p className="font-medium">{reportData.student.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{reportData.student.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Enrollment Date</Label>
                  <p className="font-medium">{new Date(reportData.student.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reportData.attendanceStats.totalDays}</div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reportData.attendanceStats.presentDays}</div>
                  <div className="text-sm text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{reportData.attendanceStats.absentDays}</div>
                  <div className="text-sm text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{reportData.attendanceStats.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Attendance</div>
                </div>
              </div>

              {reportData.attendanceHistory.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recent Attendance History</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.attendanceHistory.slice(0, 10).map((attendance) => (
                        <TableRow key={attendance._id}>
                          <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getCourseName(attendance.courseId)}</TableCell>
                          <TableCell>
                            <Badge variant={attendance.isPresent ? "default" : "destructive"}>
                              {attendance.isPresent ? "Present" : "Absent"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exam History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.examHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Exam Type</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.examHistory.map((exam) => {
                      const examType = examTypes.find((et) => et.id === exam.examTypeId)
                      const percentage = Math.round((exam.marksObtained / (examType?.marks || 100)) * 100)
                      const grade =
                        percentage >= 90
                          ? "A+"
                          : percentage >= 80
                            ? "A"
                            : percentage >= 70
                              ? "B"
                              : percentage >= 60
                                ? "C"
                                : percentage >= 50
                                  ? "D"
                                  : "F"

                      return (
                        <TableRow key={exam._id}>
                          <TableCell>{new Date(exam.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getCourseName(exam.courseId)}</TableCell>
                          <TableCell>{getExamTypeName(exam.examTypeId)}</TableCell>
                          <TableCell>{exam.marksObtained}</TableCell>
                          <TableCell>{examType?.marks || 100}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                          <TableCell>
                            <Badge variant={percentage >= 60 ? "default" : "destructive"}>{grade}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No exam records found.</p>
              )}
            </CardContent>
          </Card>

          {/* Fee History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.feeHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finance Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.feeHistory.map((fee) => (
                      <TableRow key={fee._id}>
                        <TableCell className="capitalize">{fee.financeType}</TableCell>
                        <TableCell>${fee.amount}</TableCell>
                        <TableCell>${fee.amountPaid}</TableCell>
                        <TableCell>${fee.balance}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              fee.status === "paid" ? "default" : fee.status === "partial" ? "secondary" : "destructive"
                            }
                          >
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No fee records found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportData === null && studentId && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No student found with ID: {studentId}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}