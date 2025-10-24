"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Bell, Lock, Eye, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    bookingConfirmation: true,
    bookingReminder: true,
    promotions: false,
    reviews: true,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Notification Settings */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "bookingConfirmation",
                label: "Booking Confirmation",
                description: "Get notified when your booking is confirmed",
              },
              {
                key: "bookingReminder",
                label: "Booking Reminder",
                description: "Receive reminders before your booking",
              },
              {
                key: "promotions",
                label: "Promotions & Offers",
                description: "Receive promotional emails and special offers",
              },
              { key: "reviews", label: "Review Requests", description: "Get asked to review fields you've booked" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition"
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                  className="w-5 h-5"
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
              </div>
              <Button variant="outline">View</Button>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Privacy</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
              <div>
                <p className="font-medium text-foreground">Public Profile</p>
                <p className="text-sm text-muted-foreground">Allow others to see your profile and reviews</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>

            <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
              <div>
                <p className="font-medium text-foreground">Show Booking History</p>
                <p className="text-sm text-muted-foreground">Display your booking history on your profile</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
