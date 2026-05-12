"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiGet } from "@/lib/api-client"
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type OwnerRegistrationStatus = {
  user_id: number
  business_name: string | null
  tax_code: string | null
  address: string | null
  license_url: string | null
  id_front_url: string | null
  id_back_url: string | null
  status: "pending" | "approved" | "rejected"
  approved_by: number | null
  approved_at: string | null
  reject_reason: string | null
  created_at: string | null
  updated_at?: string | null
}

export default function OwnerRegistrationStatusPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] =
    useState<OwnerRegistrationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
      router.replace("/login?redirect=/register/owner/status")
      return
    }

    const fetchStatus = async () => {
      try {
        const res = await apiGet<ApiResponse<OwnerRegistrationStatus | null>>(
          "/owner/registration/me",
        )

        setRegistration(res.data)
      } catch (err) {
        console.error(err)
        setError("Không thể tải trạng thái hồ sơ")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-green-600" />
          <p className="text-muted-foreground">
            Đang kiểm tra trạng thái hồ sơ...
          </p>
        </Card>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-xl w-full p-8 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Không thể tải hồ sơ</h1>
          <p className="text-muted-foreground mb-6">{error}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/register/owner">Quay lại đăng ký</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  const ownerProfile = registration

  if (!ownerProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-xl w-full p-8 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h1 className="text-2xl font-bold mb-2">
            Bạn chưa gửi hồ sơ chủ sân
          </h1>
          <p className="text-muted-foreground mb-6">
            Vui lòng gửi hồ sơ đăng ký để admin xét duyệt.
          </p>

          <Button asChild>
            <Link href="/register/owner">Đăng ký làm chủ sân</Link>
          </Button>
        </Card>
      </main>
    )
  }

  if (ownerProfile.status === "approved") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-xl w-full p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <Badge className="mb-4 bg-green-600 hover:bg-green-600">
            Đã duyệt
          </Badge>

          <h1 className="text-2xl font-bold mb-2">
            Hồ sơ của bạn đã được duyệt
          </h1>
          <p className="text-muted-foreground mb-6">
            Bạn đã có thể truy cập khu vực quản lý dành cho chủ sân.
          </p>

          <div className="text-left border rounded-lg p-4 mb-6 space-y-2">
            <p>
              <span className="text-muted-foreground">Tên cơ sở: </span>
              <span className="font-medium">
                {ownerProfile.business_name || "Chưa cập nhật"}
              </span>
            </p>

            <p>
              <span className="text-muted-foreground">Mã số thuế: </span>
              <span className="font-medium">
                {ownerProfile.tax_code || "Không có"}
              </span>
            </p>

            <p>
              <span className="text-muted-foreground">Địa chỉ: </span>
              <span className="font-medium">
                {ownerProfile.address || "Chưa cập nhật"}
              </span>
            </p>

            {ownerProfile.approved_at && (
              <p>
                <span className="text-muted-foreground">Ngày duyệt: </span>
                <span className="font-medium">
                  {new Date(ownerProfile.approved_at).toLocaleDateString(
                    "vi-VN",
                  )}
                </span>
              </p>
            )}
          </div>

          <Button asChild>
            <Link href="/owner/dashboard">Vào Dashboard Chủ Sân</Link>
          </Button>
        </Card>
      </main>
    )
  }

  if (ownerProfile.status === "rejected") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-xl w-full p-8 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <Badge variant="destructive" className="mb-4">
            Bị từ chối
          </Badge>

          <h1 className="text-2xl font-bold mb-2">
            Hồ sơ của bạn chưa được chấp thuận
          </h1>

          <p className="text-muted-foreground mb-4">
            Lý do:{" "}
            {ownerProfile.reject_reason ||
              "Admin chưa cung cấp lý do cụ thể."}
          </p>

          <div className="text-left border rounded-lg p-4 mb-6 space-y-2">
            <p>
              <span className="text-muted-foreground">Tên cơ sở: </span>
              <span className="font-medium">
                {ownerProfile.business_name || "Chưa cập nhật"}
              </span>
            </p>

            <p>
              <span className="text-muted-foreground">Mã số thuế: </span>
              <span className="font-medium">
                {ownerProfile.tax_code || "Không có"}
              </span>
            </p>

            <p>
              <span className="text-muted-foreground">Địa chỉ: </span>
              <span className="font-medium">
                {ownerProfile.address || "Chưa cập nhật"}
              </span>
            </p>
          </div>

          <Button asChild>
            <Link href="/register/owner">Cập nhật và gửi lại hồ sơ</Link>
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-xl w-full p-8 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
        <Badge variant="outline" className="mb-4">
          Đang chờ duyệt
        </Badge>

        <h1 className="text-2xl font-bold mb-2">
          Hồ sơ đang chờ admin xét duyệt
        </h1>

        <p className="text-muted-foreground mb-6">
          Hồ sơ đăng ký chủ sân của bạn đã được gửi thành công. Vui lòng chờ
          admin kiểm tra thông tin và giấy tờ xác minh.
        </p>

        <div className="text-left border rounded-lg p-4 mb-6 space-y-2">
          <p>
            <span className="text-muted-foreground">Tên cơ sở: </span>
            <span className="font-medium">
              {ownerProfile.business_name || "Chưa cập nhật"}
            </span>
          </p>

          <p>
            <span className="text-muted-foreground">Mã số thuế: </span>
            <span className="font-medium">
              {ownerProfile.tax_code || "Không có"}
            </span>
          </p>

          <p>
            <span className="text-muted-foreground">Địa chỉ: </span>
            <span className="font-medium">
              {ownerProfile.address || "Chưa cập nhật"}
            </span>
          </p>

          {ownerProfile.created_at && (
            <p>
              <span className="text-muted-foreground">Ngày gửi: </span>
              <span className="font-medium">
                {new Date(ownerProfile.created_at).toLocaleDateString("vi-VN")}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
{/* 
          <Button variant="outline" asChild>
            <Link href="/register/owner">Xem lại trang đăng ký</Link>
          </Button> */}
        </div>
      </Card>
    </main>
  )
}