"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
import { FileUp, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as XLSX from "xlsx"

export function ExamFileUpload({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [examTypes, setExamTypes] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedExamType, setSelectedExamType] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  useEffect(() => {
    // Fetch exam types
    fetch("/api/exam-types")
      .then((res) => res.json())
      .then(setExamTypes)
    
    // Fetch courses
    fetch("/api/courses")
      .then((res) => res.json())
      .then(setCourses)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    const fileType = selectedFile.type
    if (
      fileType !== "application/vnd.ms-excel" &&
      fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "text/csv"
    ) {
      setError("Please upload an Excel or CSV file.")
      setFile(null)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.")
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || !selectedExamType || !selectedCourse) {
      setError("Please select exam type, course, and upload a file.")
      return
    }

    setUploading(true)
    setProgress(0)
    setSuccess(false)
    setError(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(worksheet)

      const exams = json.map((exam: any) => ({
        studentId: exam.studentId,
        marksObtained: exam.marksObtained,
        examTypeId: selectedExamType,
        courseId: selectedCourse
      }))

      const res = await fetch("/api/exams/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exams),
      })

      if (!res.ok) throw new Error("Upload failed")

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProgress(i)
      }

      setSuccess(true)
      onDone?.()
      setTimeout(() => {
        setOpen(false)
        setFile(null)
        setProgress(0)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      console.error(err)
      setError("An error occurred while uploading the file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex">
        <DialogTrigger asChild>
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Exams
          </Button>
        </DialogTrigger>
        <Button
          variant="ghost"
          className="ml-2"
          asChild
        >
          <a href="/exams-sample.xlsx" download>
            <Download className="mr-2 h-4 w-4" />
            Download Sample
          </a>
        </Button>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Exam Data</DialogTitle>
          <DialogDescription>
            Select exam type and course, then upload Excel or CSV file with exam results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Select onValueChange={setSelectedExamType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((examType) => (
                  <SelectItem key={examType._id} value={examType._id}>
                    {examType.name} ({examType.marks} marks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.courseName} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              id="exam-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="border-blue-400 cursor-pointer hover:border-blue-700"
            />
            {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}

            <div className="text-xs text-muted-foreground">
              <p className="font-semibold">Required file structure:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code>studentId</code> (numeric student ID)</li>
                <li><code>marksObtained</code> (numeric value)</li>
              </ul>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uploading...</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                Exams uploaded successfully.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || uploading || !selectedExamType || !selectedCourse} className="w-full sm:w-auto">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}