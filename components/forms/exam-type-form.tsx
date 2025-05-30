"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ExamType } from "@/components/data-tables/exam-type-data-table"
import { Edit, PlusCircle, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.enum(["mid term", "final", "quiz"], {
    required_error: "Please select an exam type.",
  }),
  marks: z.coerce
    .number()
    .min(1, { message: "Marks must be at least 1." })
    .max(100, { message: "Marks cannot exceed 100." }),
  description: z.string().optional(),
})

type ExamTypeFormValues = z.infer<typeof formSchema>

interface ExamTypeDialogProps {
  mode: "add" | "edit" | "delete"
  examType?: ExamType
  onDone: ()=> void
}

export function ExamTypeDialog({ mode, examType , onDone }: ExamTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const defaultValues: Partial<ExamTypeFormValues> = {
    name: examType?.name || "mid term",
    marks: examType?.marks || 0,
    description: examType?.description || "",
  }

  const form = useForm<ExamTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(data: ExamTypeFormValues) {
    setLoading(true)
    try {
      const res = await fetch(
        mode === "add"
          ? "/api/exam-types"
          : `/api/exam-types/${examType?._id}`,
        {
          method: mode === "add" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )
      onDone?.()
      if (!res.ok) throw new Error("Failed to save exam type")

      toast.success(`Exam type ${mode === "add" ? "added" : "updated"} successfully`)
      setOpen(false)
    } catch (err) {
      toast.error("Something went wrong. Try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!examType?._id) return
    setLoading(true)

    try {
      const res = await fetch(`/api/exam-types/${examType._id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete exam type")
      onDone?.()
      toast.success("Exam type deleted")
      setOpen(false)
    } catch (err) {
      toast.error("Delete failed")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ku dar Nooca Imtixaanka
            </Button>
        ) : mode === "edit" ? (
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Ku dar Nooca Imtixaanka"
              : mode === "edit"
              ? "Tafatir Nooca Imtixaanka"
              : "Tirtir Nooca Imtixaanka"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Ku dar nooc cusub oo imtixaan nidaamka."
              : mode === "edit"
              ? "Wax ka beddel nooca imtixaanka."
              : "Ma hubtaa inaad rabto inaad tirtirto noocan imtixaanka?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
                <AlertTitle>Digniin</AlertTitle>
                <AlertDescription>
                Ficilkan lama beddeli karo. Waxay si joogto ah u tirtiri doontaa nooca imtixaanka.
                </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Kalaabo
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuuca Imtixaanka</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Dooro Nuuca imtixaanka" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mid term">Midterm</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Natiijada Guud</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total marks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faahfaahin (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Geli faahfaahin ku saabsan noocan imtixaanka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading
                    ? "Kaydinaya..."
                    : mode === "add"
                    ? "Ku dar"
                    : "Kaydi isbeddelka"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
