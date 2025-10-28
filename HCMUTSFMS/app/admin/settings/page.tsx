"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Admin Settings</h1>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Platform Settings */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Platform Name</label>
              <Input defaultValue="HCMUT Sport Field Management System" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Platform Commission (%)</label>
              <Input type="number" defaultValue="10" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Support Email</label>
              <Input type="email" defaultValue="support@hcmut.edu.vn" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Support Phone</label>
              <Input defaultValue="+84 123 456 789" />
            </div>
          </div>
        </Card>

        {/* Policies */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Policies</h2>

          <div className="space-y-4">
            {[
              { label: "Cancellation Policy", description: "Allow cancellations up to 24 hours before booking" },
              { label: "Refund Policy", description: "Full refund for cancelled bookings" },
              { label: "Dispute Resolution", description: "Enable dispute resolution system" },
            ].map((policy, idx) => (
              <label
                key={idx}
                className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition"
              >
                <div>
                  <p className="font-medium text-foreground">{policy.label}</p>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
            ))}
          </div>
        </Card>

        {/* Maintenance */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Maintenance</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
              <div>
                <p className="font-medium text-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </label>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Maintenance Message</label>
              <textarea
                defaultValue="We are currently performing maintenance. Please check back soon."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={4}
              />
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
