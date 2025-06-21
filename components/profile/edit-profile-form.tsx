"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useAuth, type User } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface EditProfileFormProps {
  currentUser: User
}

export function EditProfileForm({ currentUser }: EditProfileFormProps) {
//   const { updateUserProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(currentUser.fullname)
  const [email, setEmail] = useState(currentUser.email)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password fields (optional, can be expanded later)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  useEffect(() => {
    setName(currentUser.fullName)
    setEmail(currentUser.email)
  }, [currentUser])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (newPassword && newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Basic validation
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
      // In a real app, you'd send this to a backend API
      // For this demo, we update AuthContext and localStorage
      const updatedUser = { ...currentUser, name, email }

      // Simulate API call for password change if newPassword is provided
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
        // Here you would typically verify currentPassword against a stored hash
        // For demo: assume currentPassword is correct if provided
        console.log("Simulating password change...")
        // updatedUser.password = newPassword; // Don't store plain text password
      }

    //   const success = await updateUserProfile(updatedUser, currentPassword, newPassword)

      if (true) { //success
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile. If changing password, ensure current password is correct.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      // Clear password fields after submission attempt
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
          <CardDescription>Update your name and passowrd .</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled // Email is often used as an identifier and might not be changeable
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
