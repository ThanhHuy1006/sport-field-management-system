"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"

export default function AdminReportsPage() {
  const reports = [
    {
      title: "Monthly Revenue Report",
      description: "Detailed revenue breakdown by month",
      lastGenerated: "2025-01-15",
    },
    {
      title: "User Activity Report",
      description: "User registration and activity trends",
      lastGenerated: "2025-01-14",
    },
    {
      title: "Field Performance Report",
      description: "Performance metrics for all fields",
      lastGenerated: "2025-01-13",
    },
    {
      title: "Booking Analytics",
      description: "Booking patterns and trends",
      lastGenerated: "2025-01-12",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Reports & Analytics</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, idx) => (
            <Card key={idx} className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">{report.title}</h3>
              <p className="text-muted-foreground mb-4">{report.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Last generated: {report.lastGenerated}</p>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
