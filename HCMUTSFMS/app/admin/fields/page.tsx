"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, X, Eye } from "lucide-react"

const mockFields = [
  {
    id: 1,
    name: "Green Valley Soccer Field",
    owner: "Jane Smith",
    location: "District 1, HCMC",
    type: "Soccer",
    status: "approved",
    createdDate: "2024-06-15",
  },
  {
    id: 2,
    name: "Basketball Arena",
    owner: "Jane Smith",
    location: "District 7, HCMC",
    type: "Basketball",
    status: "approved",
    createdDate: "2024-06-20",
  },
  {
    id: 3,
    name: "New Tennis Court",
    owner: "Mike Johnson",
    location: "District 2, HCMC",
    type: "Tennis",
    status: "pending",
    createdDate: "2024-01-15",
  },
  {
    id: 4,
    name: "Volleyball Court",
    owner: "Sarah Williams",
    location: "District 4, HCMC",
    type: "Volleyball",
    status: "rejected",
    createdDate: "2024-01-10",
  },
]

export default function AdminFieldsPage() {
  const [fields, setFields] = useState(mockFields)
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredFields = fields.filter((f) => filterStatus === "all" || f.status === filterStatus)

  const handleApprove = (id: number) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, status: "approved" } : f)))
  }

  const handleReject = (id: number) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, status: "rejected" } : f)))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Manage Fields</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Fields List */}
        <div className="space-y-4">
          {filteredFields.map((field) => (
            <Card key={field.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">{field.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        field.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : field.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-medium text-foreground">{field.owner}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">{field.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{field.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium text-foreground">{field.createdDate}</p>
                    </div>
                  </div>
                </div>

                {field.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(field.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive bg-transparent"
                      onClick={() => handleReject(field.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {field.status !== "pending" && (
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredFields.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No fields found</p>
          </Card>
        )}
      </div>
    </main>
  )
}
