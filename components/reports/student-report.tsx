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
import * as XLSX from "xlsx" // Import Excel library

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
    const reportContent = document.getElementById("student-report-content");
    if (reportContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Student Report - ${reportData?.student.name || 'Report'}</title>
              <style>
                body { font-family: sans-serif; margin: 20px; }
                .print-container { max-width: 1000px; margin: 0 auto; }
                .print-header { text-align: center; margin-bottom: 20px; }
                .print-title { font-size: 24px; margin-bottom: 5px; }
                .print-subtitle { color: #666; margin-bottom: 15px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
                .grid-item { margin-bottom: 10px; }
                .grid-label { font-weight: 600; color: #444; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; }
                .badge-present { background-color: #dcfce7; color: #166534; }
                .badge-absent { background-color: #fee2e2; color: #b91c1c; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; margin-bottom: 20px; }
                .stat-value { font-size: 24px; font-weight: bold; }
                .stat-label { font-size: 14px; color: #666; }
                .no-data { text-align: center; padding: 20px; color: #666; }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="print-header">
                  <h1 class="print-title">Student Report</h1>
                  <p class="print-subtitle">Generated on ${new Date().toLocaleDateString()}</p>
                  <p class="print-subtitle">Student: ${reportData?.student.name || 'N/A'} (ID: ${reportData?.student.studentId || 'N/A'})</p>
                </div>
                ${reportContent.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  }

  const handleDownload = () => {
    if (!reportData) {
      alert("No report data to download");
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create student details sheet
      const studentDetails = [
        ["Student Report", reportData.student.name],
        ["Generated On", new Date().toLocaleDateString()],
        [],
        ["Field", "Value"],
        ["Name", reportData.student.name],
        ["Roll Number", reportData.student.studentId],
        ["Parent Phone", reportData.student.parentPhone],
        ["Student Phone", reportData.student.phone],
        ["Class", getClassName(reportData.student.classId._id)],
        ["Gender", reportData.student.gender],
        ["Status", reportData.student.status],
        ["Enrollment Date", new Date(reportData.student.createdAt).toLocaleDateString()]
      ];
      
      const wsStudent = XLSX.utils.aoa_to_sheet(studentDetails);
      XLSX.utils.book_append_sheet(wb, wsStudent, "Student Details");
      
      // Create attendance sheet
      const attendanceData = [
        ["Attendance Summary", "", "", ""],
        ["Total Days", reportData.attendanceStats.totalDays],
        ["Present Days", reportData.attendanceStats.presentDays],
        ["Absent Days", reportData.attendanceStats.absentDays],
        ["Percentage", `${reportData.attendanceStats.percentage}%`],
        [],
        ["Attendance History"],
        ["Date", "Course", "Status"]
      ];

      reportData.attendanceHistory.forEach(att => {
        attendanceData.push([
          new Date(att.date).toLocaleDateString(),
          getCourseName(att.courseId),
          att.isPresent ? "Present" : "Absent"
        ]);
      });

      const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance");
      
      // Create exam history sheet
      const examData = [
        ["Exam History"],
        ["Date", "Course", "Exam Type", "Marks Obtained", "Total Marks", "Percentage", "Grade"]
      ];

      reportData.examHistory.forEach(exam => {
        const examType = examTypes.find(et => et.id === exam.examTypeId);
        const totalMarks = examType?.marks || 100;
        const percentage = Math.round((exam.marksObtained / totalMarks) * 100);
        const grade = percentage >= 90
          ? "A+"
          : percentage >= 80
            ? "A"
            : percentage >= 70
              ? "B"
              : percentage >= 60
                ? "C"
                : percentage >= 50
                  ? "D"
                  : "F";

        examData.push([
          new Date(exam.createdAt).toLocaleDateString(),
          getCourseName(exam.courseId),
          getExamTypeName(exam.examTypeId),
          exam.marksObtained,
          totalMarks,
          percentage,
          grade
        ]);
      });

      const wsExams = XLSX.utils.aoa_to_sheet(examData);
      XLSX.utils.book_append_sheet(wb, wsExams, "Exams");
      
      // Create fee history sheet
      const feeData = [
        ["Fee History"],
        ["Finance Type", "Amount", "Amount Paid", "Balance", "Status", "Due Date"]
      ];

      reportData.feeHistory.forEach(fee => {
        feeData.push([
          fee.financeType,
          fee.amount,
          fee.amountPaid,
          fee.balance,
          fee.status,
          new Date(fee.dueDate).toLocaleDateString()
        ]);
      });

      const wsFees = XLSX.utils.aoa_to_sheet(feeData);
      XLSX.utils.book_append_sheet(wb, wsFees, "Fees");
      
      // Generate file and download
      const fileName = `student-report-${reportData.student.name.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
      alert("Failed to generate Excel file. Please try again.");
    }
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
        <div className="space-y-6" id="student-report-content">
          {/* Report Header with Actions */}
          <div className="flex justify-between items-start print:hidden">
            <div>
              <h2 className="text-xl font-semibold">Student Report - {reportData.student.name}</h2>
              <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>

          {/* Student Details */}
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle className="flex items-center gap-2 print:text-lg">
                <User className="h-5 w-5 print:hidden" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="print:pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Name</Label>
                  <p className="font-medium">{reportData.student.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Roll Number</Label>
                  <p className="font-medium">{reportData.student.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Parent Phone</Label>
                  <p className="font-medium">{reportData.student.parentPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Student Phone</Label>
                  <p className="font-medium">{reportData.student.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Class</Label>
                  <p className="font-medium">{getClassName(reportData.student.classId._id)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Gender</Label>
                  <p className="font-medium">{reportData.student.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Status</Label>
                  <p className="font-medium capitalize">{reportData.student.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground print:text-xs">Enrollment Date</Label>
                  <p className="font-medium">{new Date(reportData.student.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle className="flex items-center gap-2 print:text-lg">
                <Calendar className="h-5 w-5 print:hidden" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="print:pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 print:grid-cols-4">
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

              {reportData.attendanceHistory.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-2">Recent Attendance History</h4>
                  <Table className="print:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.attendanceHistory.slice(0, 10).map((attendance) => (
                        <TableRow key={attendance._id} className="print:text-xs">
                          <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getCourseName(attendance.courseId)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={attendance.isPresent ? "default" : "destructive"}
                              className="print:bg-transparent print:border print:border-gray-300 print:text-gray-800"
                            >
                              {attendance.isPresent ? "Present" : "Absent"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No attendance records found</p>
              )}
            </CardContent>
          </Card>

          {/* Exam History */}
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle className="flex items-center gap-2 print:text-lg">
                <FileText className="h-5 w-5 print:hidden" />
                Exam History
              </CardTitle>
            </CardHeader>
            <CardContent className="print:pt-0">
              {reportData.examHistory.length > 0 ? (
                <Table className="print:text-sm">
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
                        <TableRow key={exam._id} className="print:text-xs">
                          <TableCell>{new Date(exam.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getCourseName(exam.courseId)}</TableCell>
                          <TableCell>{getExamTypeName(exam.examTypeId)}</TableCell>
                          <TableCell>{exam.marksObtained}</TableCell>
                          <TableCell>{examType?.marks || 100}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                          <TableCell>
                            <Badge 
                              variant={percentage >= 60 ? "default" : "destructive"}
                              className="print:bg-transparent print:border print:border-gray-300 print:text-gray-800"
                            >
                              {grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No exam records found</p>
              )}
            </CardContent>
          </Card>

          {/* Fee History */}
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle className="flex items-center gap-2 print:text-lg">
                <DollarSign className="h-5 w-5 print:hidden" />
                Fee History
              </CardTitle>
            </CardHeader>
            <CardContent className="print:pt-0">
              {reportData.feeHistory.length > 0 ? (
                <Table className="print:text-sm">
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
                      <TableRow key={fee._id} className="print:text-xs">
                        <TableCell className="capitalize">{fee.financeType}</TableCell>
                        <TableCell>${fee.amount}</TableCell>
                        <TableCell>${fee.amountPaid}</TableCell>
                        <TableCell>${fee.balance}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              fee.status === "paid" ? "default" : fee.status === "partial" ? "secondary" : "destructive"
                            }
                            className="print:bg-transparent print:border print:border-gray-300 print:text-gray-800"
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
                <p className="text-muted-foreground text-center py-4">No fee records found</p>
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