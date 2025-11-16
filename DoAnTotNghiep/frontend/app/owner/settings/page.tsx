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
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Cài Đặt Chủ Sân</h1>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Lưu
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Company Information */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Thông Tin Công Ty</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tên Công Ty</label>
              <Input defaultValue="Green Valley Sports" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input type="email" defaultValue="contact@greenvalley.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Số Điện Thoại</label>
              <Input defaultValue="+84 123 456 789" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ</label>
              <Input defaultValue="123 Đường Thể Thao, Quận 1, TP.HCM" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mã Số Thuế</label>
              <Input defaultValue="0123456789" />
            </div>
          </div>
        </Card>

        {/* Bank Information */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Thông Tin Ngân Hàng</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tên Ngân Hàng</label>
              <Input defaultValue="Vietcombank" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Số Tài Khoản</label>
              <Input defaultValue="1234567890" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Chủ Tài Khoản</label>
              <Input defaultValue="Green Valley Sports" />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Cài Đặt Thông Báo</h2>

          <div className="space-y-4">
            {[
              { label: "Thông Báo Đặt Sân Mới", description: "Nhận thông báo khi có đơn đặt sân mới" },
              { label: "Cảnh Báo Hủy Đặt Sân", description: "Nhận thông báo khi có đơn đặt sân bị hủy" },
              { label: "Xác Nhận Thanh Toán", description: "Nhận email xác nhận thanh toán" },
              { label: "Báo Cáo Hàng Tuần", description: "Nhận báo cáo hiệu suất hàng tuần" },
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
