"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"

export default function OwnerSettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Owner Settings</h1>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Company Information */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Company Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
              <Input defaultValue="Green Valley Sports" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input type="email" defaultValue="contact@greenvalley.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <Input defaultValue="+84 123 456 789" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <Input defaultValue="123 Sports Street, District 1, HCMC" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tax ID</label>
              <Input defaultValue="0123456789" />
            </div>
          </div>
        </Card>

        {/* Bank Information */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Bank Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
              <Input defaultValue="Vietcombank" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
              <Input defaultValue="1234567890" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Holder</label>
              <Input defaultValue="Green Valley Sports" />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

          <div className="space-y-4">
            {[
              { label: "New Booking Notifications", description: "Get notified when a new booking is made" },
              { label: "Booking Cancellation Alerts", description: "Get notified when a booking is cancelled" },
              { label: "Payment Confirmations", description: "Receive payment confirmation emails" },
              { label: "Weekly Reports", description: "Receive weekly performance reports" },
            ].map((item, idx) => (
              <label
                key={idx}
                className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition"
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </main>
  )
}
