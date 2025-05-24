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

export function StudentFileUpload({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses)
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
    if (!file  || !selectedClass) {
      setError("Please select  class, and upload a file.")
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

      const students = json.map((student: any) => ({
        ...student,
        classId: selectedClass,
      }))
      const res = await fetch("/api/student/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      })

      if (!res.ok) throw new Error("Upload failed")

      // simulate progress UI
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
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Upload Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Student Data</DialogTitle>
          <DialogDescription>
            Select   class then upload Excel or CSV file with student data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <Select onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  CMS-{cls.semester}-{cls.type} 
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              id="student-file"
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
                <li><code>name</code></li>
                <li><code>gender</code> (e.g. "Male", "Female")</li>
                <li><code>parentPhone</code> (numeric, more than 10 digits)</li>
                <li><code>phone</code> (numeric, more than 10 digits)</li>
                <li><code>studentId</code> (numeric)</li>
                <li><code>status</code> (either "active" or "inactive")</li>
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
                Students uploaded successfully.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full sm:w-auto">
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
