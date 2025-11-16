"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CheckCircle2, XCircle, FileText, Building2, Phone, Mail, MapPin, Users } from "lucide-react"

const mockPendingOwners = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 123 456 789",
    submittedDate: "15/12/2024",
    businessName: "Sân Thể Thao ABC",
    taxCode: "0123456789",
    businessAddress: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM",
    businessPhone: "+84 987 654 321",
    documents: {
      businessLicense: "/business-license.jpg",
      idCardFront: "/generic-id-card-front.png",
      idCardBack: "/id-card-back.jpg",
    },
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "+84 234 567 890",
    submittedDate: "16/12/2024",
    businessName: "Sân Bóng XYZ",
    taxCode: "0987654321",
    businessAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    businessPhone: "+84 876 543 210",
    documents: {
      businessLicense: "/business-license.jpg",
      idCardFront: "/generic-id-card-front.png",
      idCardBack: "/id-card-back.jpg",
    },
  },
]

export default function AdminApprovalsPage() {
  const [pendingOwners, setPendingOwners] = useState(mockPendingOwners)
  const [selectedOwner, setSelectedOwner] = useState<(typeof mockPendingOwners)[0] | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const { toast } = useToast()

  const handleApprove = (id: number) => {
    console.log("Approved owner:", id)
    const approvedOwner = pendingOwners.find((o) => o.id === id)
    setPendingOwners(pendingOwners.filter((o) => o.id !== id))
    setSelectedOwner(null)
    toast({
      title: "Đã Phê Duyệt",
      description: `${approvedOwner?.fullName} đã được phê duyệt thành công.`,
    })
  }

  const handleReject = () => {
    if (selectedOwner && rejectReason.trim()) {
      console.log("Rejected owner:", selectedOwner.id, "Reason:", rejectReason)
      const rejectedName = selectedOwner.fullName
      setPendingOwners(pendingOwners.filter((o) => o.id !== selectedOwner.id))
      setShowRejectDialog(false)
      setSelectedOwner(null)
      setRejectReason("")
      toast({
        title: "Đã Từ Chối",
        description: `Đơn của ${rejectedName} đã bị từ chối.`,
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Phê Duyệt Chủ Sân</h1>
            <Badge variant="secondary">{pendingOwners.length} Chờ Duyệt</Badge>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {pendingOwners.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Tất Cả Đã Được Xử Lý</h2>
            <p className="text-muted-foreground mb-6">Không có đơn đăng ký chủ sân nào đang chờ phê duyệt</p>
            <div className="flex gap-3 justify-center">
              <Link href="/admin/users">
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Xem Tất Cả Chủ Sân
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline">Về Dashboard</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingOwners.map((owner) => (
              <Card key={owner.id} className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Personal Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{owner.fullName}</h2>
                        <p className="text-sm text-muted-foreground">Đăng ký ngày {owner.submittedDate}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Chờ Duyệt
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{owner.phone}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Thông Tin Doanh Nghiệp
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tên:</span>{" "}
                          <span className="font-medium text-foreground">{owner.businessName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MST:</span>{" "}
                          <span className="font-medium text-foreground">{owner.taxCode}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{owner.businessAddress}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">SĐT:</span>{" "}
                          <span className="font-medium text-foreground">{owner.businessPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Documents */}
                  <div className="lg:w-96">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Giấy Tờ Đính Kèm
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Giấy Phép Kinh Doanh</p>
                        <img
                          src={owner.documents.businessLicense || "/placeholder.svg"}
                          alt="Business License"
                          className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                          onClick={() => window.open(owner.documents.businessLicense, "_blank")}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">CMND/CCCD (Trước)</p>
                          <img
                            src={owner.documents.idCardFront || "/placeholder.svg"}
                            alt="ID Card Front"
                            className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                            onClick={() => window.open(owner.documents.idCardFront, "_blank")}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">CMND/CCCD (Sau)</p>
                          <img
                            src={owner.documents.idCardBack || "/placeholder.svg"}
                            alt="ID Card Back"
                            className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                            onClick={() => window.open(owner.documents.idCardBack, "_blank")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(owner.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Phê Duyệt
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => {
                      setSelectedOwner(owner)
                      setShowRejectDialog(true)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ Chối
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ Chối Đơn Đăng Ký</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để gửi cho {selectedOwner?.fullName}. Họ sẽ có thể đăng ký lại sau khi khắc
              phục.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ví dụ: Giấy phép kinh doanh không rõ ràng, thông tin CMND không khớp..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-32"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
