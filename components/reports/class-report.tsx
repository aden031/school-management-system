"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, PrinterIcon as Print, Users, Calendar, FileText, DollarSign } from "lucide-react"
import * as XLSX from "xlsx" // Import Excel library

interface ClassReportData {
  class: {
    _id: string
    departmentId: string
    semester: number
    classMode: string
    type: string
    status: string
    createdAt: string
    updatedAt: string
  }
  students: Array<{
    _id: string
    name: string
    phone: string
    parentPhone: string
    status: string
    studentId: number
  }>
  attendanceStats: {
    totalStudents: number
    averageAttendance: number
    presentToday: number
    absentToday: number
  }
  examStats: {
    averageMarks: number
    highestMarks: number
    lowestMarks: number
    passRate: number
  }
  feeStats: {
    totalFees: number
    collectedFees: number
    pendingFees: number
    defaulters: number
  }
}

interface ClassType {
  _id: string
  departmentId: {
    _id: string
    name: string
  }
  semester: number
  classMode: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
}

export function ClassReport() {
  const [selectedClass, setSelectedClass] = useState("")
  const [classList, setClassList] = useState<ClassType[]>([])
  const [reportData, setReportData] = useState<ClassReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes")
        const data = await response.json()
        setClassList(data)
      } catch (error) {
        console.error("Error fetching classes:", error)
      }
    }
    fetchClasses()
  }, [])

  const generateReport = async () => {
    if (!selectedClass) return

    setLoading(true)

    try {
      const response = await fetch(`/api/reports/class-report/${selectedClass}`)
      if (!response.ok) throw new Error("Report not found")
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error generating report:", error)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printContent = document.getElementById("report-content")?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    } else {
      window.print();
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
      
      // Create overview sheet
      const overviewData = [
        ["Class Report", getClassName(selectedClass)],
        ["Generated On", new Date().toLocaleDateString()],
        [],
        ["Statistics", "Value"],
        ["Total Students", reportData.attendanceStats.totalStudents],
        ["Average Attendance", `${reportData.attendanceStats.averageAttendance}%`],
        ["Present Today", reportData.attendanceStats.presentToday],
        ["Absent Today", reportData.attendanceStats.absentToday],
        ["Average Marks", reportData.examStats.averageMarks],
        ["Highest Marks", reportData.examStats.highestMarks],
        ["Lowest Marks", reportData.examStats.lowestMarks],
        ["Pass Rate", `${reportData.examStats.passRate}%`],
        ["Total Fees", `$${reportData.feeStats.totalFees}`],
        ["Collected Fees", `$${reportData.feeStats.collectedFees}`],
        ["Pending Fees", `$${reportData.feeStats.pendingFees}`],
        ["Defaulters", reportData.feeStats.defaulters]
      ];
      
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");
      
      // Create students sheet
      const studentsData = [
        ["Student ID", "Name", "Phone", "Parent Phone", "Status"],
        ...reportData.students.map(student => [
          student.studentId,
          student.name,
          student.phone,
          student.parentPhone,
          student.status
        ])
      ];
      
      const wsStudents = XLSX.utils.aoa_to_sheet(studentsData);
      XLSX.utils.book_append_sheet(wb, wsStudents, "Students");
      
      // Create detailed stats sheet
      const statsData = [
        ["Category", "Statistic", "Value"],
        ["Attendance", "Total Students", reportData.attendanceStats.totalStudents],
        ["Attendance", "Average Attendance", `${reportData.attendanceStats.averageAttendance}%`],
        ["Attendance", "Present Today", reportData.attendanceStats.presentToday],
        ["Attendance", "Absent Today", reportData.attendanceStats.absentToday],
        ["Exams", "Average Marks", reportData.examStats.averageMarks],
        ["Exams", "Highest Marks", reportData.examStats.highestMarks],
        ["Exams", "Lowest Marks", reportData.examStats.lowestMarks],
        ["Exams", "Pass Rate", `${reportData.examStats.passRate}%`],
        ["Fees", "Total Fees", `$${reportData.feeStats.totalFees}`],
        ["Fees", "Collected Fees", `$${reportData.feeStats.collectedFees}`],
        ["Fees", "Pending Fees", `$${reportData.feeStats.pendingFees}`],
        ["Fees", "Defaulters", reportData.feeStats.defaulters]
      ];
      
      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, "Detailed Stats");
      
      // Generate file and download
      const fileName = `class-report-${getClassName(selectedClass).replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
      alert("Failed to generate Excel file. Please try again.");
    }
  }

  const getClassName = (classId: string) => {
    const cls = classList.find(c => c._id === classId)
    return cls ? `${cls.departmentId.name} - Semester ${cls.semester} (${cls.classMode})` : "Unknown Class"
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Generate Class Report
          </CardTitle>
          <CardDescription>Select a class to generate a comprehensive class report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="class">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map(cls => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {`${cls.departmentId.name} - Semester ${cls.semester} (${cls.classMode})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading || !selectedClass}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div id="report-content" className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="flex justify-between items-start print:hidden">
            <div>
              <h2 className="text-xl font-semibold">Class Report - {getClassName(selectedClass)}</h2>
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

          {/* Class Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{reportData.attendanceStats.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{reportData.attendanceStats.averageAttendance}%</div>
                    <div className="text-sm text-muted-foreground">Avg Attendance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{reportData.examStats.averageMarks}</div>
                    <div className="text-sm text-muted-foreground">Avg Marks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">${reportData.feeStats.collectedFees}</div>
                    <div className="text-sm text-muted-foreground">Fees Collected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Students in {getClassName(selectedClass)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Parent Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.students.map(student => (
                    <TableRow key={student._id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.parentPhone}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Present Today:</span>
                  <span className="font-medium">{reportData.attendanceStats.presentToday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absent Today:</span>
                  <span className="font-medium">{reportData.attendanceStats.absentToday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Attendance:</span>
                  <span className="font-medium">{reportData.attendanceStats.averageAttendance}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exam Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Marks:</span>
                  <span className="font-medium">{reportData.examStats.averageMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Highest Marks:</span>
                  <span className="font-medium">{reportData.examStats.highestMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lowest Marks:</span>
                  <span className="font-medium">{reportData.examStats.lowestMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pass Rate:</span>
                  <span className="font-medium">{reportData.examStats.passRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fee Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Fees:</span>
                  <span className="font-medium">${reportData.feeStats.totalFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Collected:</span>
                  <span className="font-medium">${reportData.feeStats.collectedFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium">${reportData.feeStats.pendingFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Defaulters:</span>
                  <span className="font-medium">{reportData.feeStats.defaulters}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}