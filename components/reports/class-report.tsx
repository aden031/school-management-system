"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, PrinterIcon as Print, Users, Calendar, FileText, DollarSign } from "lucide-react"
import { classes, students, attendanceData, examData, feeData } from "@/data"

interface ClassReportData {
  class: any
  students: any[]
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

export function ClassReport() {
  const [selectedClass, setSelectedClass] = useState("")
  const [reportData, setReportData] = useState<ClassReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = () => {
    if (!selectedClass) return

    setLoading(true)

    setTimeout(() => {
      const classData = classes.find((c) => c.id === selectedClass)
      if (!classData) {
        setReportData(null)
        setLoading(false)
        return
      }

      const classStudents = students.filter((s) => s.classId === selectedClass)
      const studentIds = classStudents.map((s) => s.id)

      // Attendance stats
      const classAttendance = attendanceData.filter((a) => studentIds.includes(a.studentId))
      const today = new Date().toISOString().split("T")[0]
      const todayAttendance = classAttendance.filter((a) => a.date === today)
      const presentToday = todayAttendance.filter((a) => a.isPresent).length
      const absentToday = todayAttendance.length - presentToday

      const totalAttendanceRecords = classAttendance.length
      const totalPresentRecords = classAttendance.filter((a) => a.isPresent).length
      const averageAttendance =
        totalAttendanceRecords > 0 ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100) : 0

      // Exam stats
      const classExams = examData.filter((e) => studentIds.includes(e.studentId))
      const examMarks = classExams.map((e) => e.marksObtained)
      const averageMarks =
        examMarks.length > 0 ? Math.round(examMarks.reduce((a, b) => a + b, 0) / examMarks.length) : 0
      const highestMarks = examMarks.length > 0 ? Math.max(...examMarks) : 0
      const lowestMarks = examMarks.length > 0 ? Math.min(...examMarks) : 0
      const passedExams = classExams.filter((e) => e.marksObtained >= 50).length
      const passRate = classExams.length > 0 ? Math.round((passedExams / classExams.length) * 100) : 0

      // Fee stats
      const classFees = feeData.filter((f) => studentIds.includes(f.studentId))
      const totalFees = classFees.reduce((sum, f) => sum + f.amount, 0)
      const collectedFees = classFees.reduce((sum, f) => sum + f.amountPaid, 0)
      const pendingFees = totalFees - collectedFees
      const defaulters = classFees.filter((f) => f.status === "unpaid").length

      setReportData({
        class: classData,
        students: classStudents,
        attendanceStats: {
          totalStudents: classStudents.length,
          averageAttendance,
          presentToday,
          absentToday,
        },
        examStats: {
          averageMarks,
          highestMarks,
          lowestMarks,
          passRate,
        },
        feeStats: {
          totalFees,
          collectedFees,
          pendingFees,
          defaulters,
        },
      })
      setLoading(false)
    }, 1000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    console.log("Download report")
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
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
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
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="flex justify-between items-start print:hidden">
            <div>
              <h2 className="text-xl font-semibold">Class Report - {reportData.class.name}</h2>
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
              <CardTitle>Students in {reportData.class.name}</CardTitle>
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
                  {reportData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.parentPhone}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
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
