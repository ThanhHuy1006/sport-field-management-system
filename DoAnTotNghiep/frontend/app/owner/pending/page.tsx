"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Clock, CheckCircle2, FileText, Mail, Phone } from "lucide-react";
import { getOwnerProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function OwnerPendingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      // 🔥 1. KHÔNG có token → luôn buộc login
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getOwnerProfile(token);

        // 🔥 2. Redirect đúng theo status
        if (data.status === "approved") {
          router.push("/owner/dashboard");
          return;
        }

        if (data.status === "rejected") {
          router.push("/owner/rejected");
          return;
        }

        // 🔥 3. Trạng thái hợp lệ: pending → render
        setProfile(data);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // 🔥 4. Hiển thị loading trong lúc chờ fetch
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Đang tải dữ liệu...
      </div>
    );
  }

  // 🔥 5. Nếu không có profile → bắt buộc login lại
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Không tìm thấy dữ liệu, vui lòng đăng nhập lại...
      </div>
    );
  }

  const submittedDate = new Date(profile.created_at || "").toLocaleDateString("vi-VN");

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={80} height={80} className="object-contain" />
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">Đơn Đăng Ký Đang Được Xem Xét</h1>
          <p className="text-muted-foreground text-lg">
            Chúng tôi đã nhận được đơn đăng ký chủ sân của bạn và đang trong quá trình xác minh thông tin.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Đơn Đã Được Gửi</h3>
              <p className="text-sm text-muted-foreground">Ngày {submittedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Đang Xác Minh</h3>
              <p className="text-sm text-muted-foreground">Admin đang kiểm tra giấy tờ và thông tin doanh nghiệp</p>
            </div>
          </div>

          <div className="flex items-start gap-4 opacity-50">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Phê Duyệt</h3>
              <p className="text-sm text-muted-foreground">Tài khoản được kích hoạt sau khi xác minh thành công</p>
            </div>
          </div>
        </div>

        {/* Submission Info */}
        <Card className="bg-muted/50 p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">Thông Tin Đã Gửi</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tên Doanh Nghiệp</p>
                <p className="font-medium text-foreground">{profile.business_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Số Điện Thoại</p>
                <p className="font-medium text-foreground">{profile.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Thời gian xử lý:</strong> Thông thường từ 1-3 ngày làm việc. Chúng tôi sẽ gửi email thông báo khi
            đơn của bạn được phê duyệt hoặc nếu cần thêm thông tin.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/">Về Trang Chủ</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/contact">Liên Hệ Hỗ Trợ</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
