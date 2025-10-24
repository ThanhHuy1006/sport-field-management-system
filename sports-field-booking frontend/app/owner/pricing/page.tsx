"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"

export default function OwnerPricingPage() {
  const [pricing, setPricing] = useState({
    field1: {
      name: "Green Valley Soccer Field",
      weekdayPrice: 500000,
      weekendPrice: 600000,
      openTime: "06:00",
      closeTime: "22:00",
    },
    field2: {
      name: "Basketball Arena",
      weekdayPrice: 400000,
      weekendPrice: 500000,
      openTime: "07:00",
      closeTime: "21:00",
    },
  })

  const handleChange = (field: string, key: string, value: string | number) => {
    setPricing((prev) => ({
      ...prev,
      [field]: { ...prev[field as keyof typeof prev], [key]: value },
    }))
  }

  const handleSave = () => {
    console.log("Pricing saved:", pricing)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Pricing & Hours</h1>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {Object.entries(pricing).map(([key, field]) => (
            <Card key={key} className="p-8">
              <h2 className="text-2xl font-bold mb-6">{field.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Weekday Price (Mon-Fri)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={field.weekdayPrice}
                      onChange={(e) => handleChange(key, "weekdayPrice", Number.parseInt(e.target.value))}
                    />
                    <span className="text-muted-foreground">VND/hour</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Weekend Price (Sat-Sun)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={field.weekendPrice}
                      onChange={(e) => handleChange(key, "weekendPrice", Number.parseInt(e.target.value))}
                    />
                    <span className="text-muted-foreground">VND/hour</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Opening Time</label>
                  <Input
                    type="time"
                    value={field.openTime}
                    onChange={(e) => handleChange(key, "openTime", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Closing Time</label>
                  <Input
                    type="time"
                    value={field.closeTime}
                    onChange={(e) => handleChange(key, "closeTime", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
