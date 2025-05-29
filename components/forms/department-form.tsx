"use client"

import { useEffect, useState } from "react"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, PlusCircle, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"

const formSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
})

type DepartmentFormValues = z.infer<typeof formSchema>

interface DepartmentDialogProps {
  mode: "add" | "edit" | "delete"
  department?: any
  onDone?: () => void
}
 
export function DepartmentDialog({ mode, department, onDone }: DepartmentDialogProps) {
  const [open, setOpen] = useState(false)

  const defaultValues: Partial<DepartmentFormValues> = {
    name: department?.name || "",
  }

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (data: DepartmentFormValues) => {
    const payload = {
      name: data.name,
    }

    try {
      const res = await axios({
        method: mode === "edit" ? "PUT" : "POST",
        url: `/api/department/${department?._id || ""}`,
        data: mode === "edit" ? { ...payload, _id: department?._id } : payload,
      })

      setOpen(false)
      onDone?.()
    } catch (err) {
      console.error("Error submitting department:", err)
    }
  }

  const onDelete = async () => {
    try {
      const res = await axios.delete(`/api/department/${department?._id}`)
      if (res.status !== 200) throw new Error("Failed to delete")
      setOpen(false)
      onDone?.()
    } catch (err) {
      console.error("Error deleting department:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Kudara Xarun Cusub
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
            {mode === "add" ? "Kudar Xarun" : mode === "edit" ? "Waxka badal xarun" : "Deletegareey Xarun"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Kudar xarun cusub systemka."
              : mode === "edit"
              ? "Kusameey is badel xogta xarunta."
              : "Ma hubtaa Inaa xaruntan Tirtirayso?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Digniin</AlertTitle>
              <AlertDescription>
                Haddi aad falkan sameyso dib looma soocelin karo , xaruntana si toos ubaxaysaa.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Ka laabo
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Deletegareey
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
                    <FormLabel>Magaca Xarunta</FormLabel>
                    <FormControl>
                      <Input placeholder="Magaca Xarunta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              

              <DialogFooter>
                <Button type="submit">{mode === "add" ? "Add" : "Save changes"}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}