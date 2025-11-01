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
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Cài Đặt Admin</h1>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Lưu
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Platform Settings */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Cài Đặt Nền Tảng</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tên Nền Tảng</label>
              <Input defaultValue="HCMUT Sport Field Management System" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hoa Hồng Nền Tảng (%)</label>
              <Input type="number" defaultValue="10" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Hỗ Trợ</label>
              <Input type="email" defaultValue="support@hcmut.edu.vn" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Số Điện Thoại Hỗ Trợ</label>
              <Input defaultValue="+84 123 456 789" />
            </div>
          </div>
        </Card>

        {/* Policies */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Chính Sách</h2>

          <div className="space-y-4">
            {[
              { label: "Chính Sách Hủy", description: "Cho phép hủy đặt sân trước 24 giờ" },
              { label: "Chính Sách Hoàn Tiền", description: "Hoàn tiền đầy đủ cho đơn đặt sân bị hủy" },
              { label: "Giải Quyết Tranh Chấp", description: "Bật hệ thống giải quyết tranh chấp" },
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
          <h2 className="text-2xl font-bold mb-6">Bảo Trì</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
              <div>
                <p className="font-medium text-foreground">Chế Độ Bảo Trì</p>
                <p className="text-sm text-muted-foreground">Tạm thời vô hiệu hóa nền tảng</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </label>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Thông Báo Bảo Trì</label>
              <textarea
                defaultValue="Chúng tôi đang thực hiện bảo trì. Vui lòng quay lại sau."
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
