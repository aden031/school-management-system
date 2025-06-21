"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface EditProfileFormProps {
  currentUser: any;
}

export function EditProfileForm({ currentUser }: EditProfileFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState(currentUser.fullname)
  const [email, setEmail] = useState(currentUser.email)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  useEffect(() => {
    setName(currentUser.fullname)
    setEmail(currentUser.email)
  }, [currentUser])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Password validation
    if (newPassword && newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Name validation
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare update payload
      const payload: Record<string, any> = { id: currentUser.id }
      
      if (name !== currentUser.fullname) {
        payload.FullName = name
      }
      
      if (newPassword) {
        if (!currentPassword) {
          toast({
            title: "Error",
            description: "Current password is required to change password.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
        payload.password = newPassword
        payload.currentPassword = currentPassword
      }

      // Skip API call if nothing changed
      if (Object.keys(payload).length === 1) {
        toast({
          title: "No changes",
          description: "No changes to update.",
        })
        setIsSubmitting(false)
        return
      }

      // API call to update user
      const response = await fetch("/api/users/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      // Update client state
      const updatedUser = { ...currentUser, fullname: name }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
            />
            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Leave these fields blank if you do not want to change your password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}