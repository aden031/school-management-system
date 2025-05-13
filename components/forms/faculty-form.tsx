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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Faculty } from "@/components/data-tables/faculty-data-table"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Faculty name must be at least 2 characters.",
  }),
})

type FacultyFormValues = z.infer<typeof formSchema>

interface FacultyDialogProps {
  mode: "add" | "edit" | "delete"
  faculty?: Faculty
}

export function FacultyDialog({ mode, faculty }: FacultyDialogProps) {
  const [open, setOpen] = useState(false)

  // Default values for the form
  const defaultValues: Partial<FacultyFormValues> = {
    name: faculty?.name || "",
  }

  // Initialize the form
  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Form submission handler
  function onSubmit(data: FacultyFormValues) {
    // In a real app, you would send this data to your backend
    console.log(data)
    setOpen(false)
  }

  // Delete handler
  function onDelete() {
    // In a real app, you would send a delete request to your backend
    console.log("Deleting faculty:", faculty?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Faculty
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
            {mode === "add" ? "Add Faculty" : mode === "edit" ? "Edit Faculty" : "Delete Faculty"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new faculty to the system."
              : mode === "edit"
                ? "Make changes to the faculty information."
                : "Are you sure you want to delete this faculty?"}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete the faculty and all associated departments,
                classes, and courses.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Delete
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Faculty name" {...field} />
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
