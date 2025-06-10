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
import { Skeleton } from "@/components/ui/skeleton"

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
    classId: { _id: string; name?: string }
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
  const { user, logout } = useAuth();
  const [reportData, setReportData] = useState<StudentReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.studentId) {
      fetchReport()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/student-report/${user?.studentId}`)
      if (!response.ok) throw new Error("Failed to fetch report")
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
    classes.find(c => c.id === classId)?.name || classId

  const getCourseName = (courseId: string) => 
    courses.find(c => c.id === courseId)?.name || courseId

  const getExamTypeName = (examTypeId: string) => 
    examTypes.find(et => et.id === examTypeId)?.name || examTypeId

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Student Report Dashboard</h1>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Student Report
          </CardTitle>
          <CardDescription>
            {user?.studentId 
              ? "View your academic and attendance report" 
              : "No student associated with your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4 w-full">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-40 mt-4 md:mt-0" />
            </div>
          ) : user?.studentId ? (
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              {reportData?.student ? (
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{reportData.student.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">ID: {reportData.student.studentId}</Badge>
                      <Badge variant={reportData.student.status === "active" ? "default" : "destructive"}>
                        {reportData.student.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Your Student Profile</h3>
                    <p className="text-sm text-muted-foreground">Generate report to view details</p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={fetchReport}
                disabled={loading}
                className="w-full md:w-auto mt-4 md:mt-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-t-white rounded-full animate-spin"></div>
                    {reportData ? "Refreshing..." : "Generating..."}
                  </span>
                ) : reportData ? "Refresh Report" : "Generate Report"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Your account is not associated with any student record.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact administration for assistance
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && !reportData ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : reportData ? (
        <div className="space-y-6 print:space-y-4">
          <div className="flex justify-between items-start print:hidden">
            <div>
              <h2 className="text-xl font-semibold">Student Report</h2>
              <p className="text-muted-foreground">
                Generated on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Print className="h-4 w-4" />
              </Button>
            </div>
          </div>

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
                  <p className="font-medium">{reportData.student.parentPhone || 'N/A'}</p>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {reportData.attendanceStats.totalDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {reportData.attendanceStats.presentDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Present</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                    {reportData.attendanceStats.absentDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Absent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    {reportData.attendanceStats.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
              </div>

              {reportData.attendanceHistory.length > 0 ? (
                <>
                  <h4 className="font-medium mb-3">Recent Attendance Records</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800">
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
                                className="justify-end min-w-[70px]"
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
                <div className="text-center py-8 border rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium">No Attendance Records</h4>
                  <p className="text-muted-foreground mt-2">
                    No attendance data available for this student
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exam Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.examHistory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
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
                <div className="text-center py-8 border rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium">No Exam Records</h4>
                  <p className="text-muted-foreground mt-2">
                    No exam data available for this student
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.feeHistory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
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
                          <TableCell className="text-right">${fee.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${fee.amountPaid.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${fee.balance.toFixed(2)}</TableCell>
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
                <div className="text-center py-8 border rounded-lg">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium">No Fee Records</h4>
                  <p className="text-muted-foreground mt-2">
                    No fee data available for this student
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : user?.studentId && !loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground flex flex-col items-center">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Report Data Available</h3>
              <p className="mt-2 max-w-md">
                We couldn't find any report data for your account. 
                Try generating the report or contact support.
              </p>
              <Button 
                onClick={fetchReport}
                className="mt-4"
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}