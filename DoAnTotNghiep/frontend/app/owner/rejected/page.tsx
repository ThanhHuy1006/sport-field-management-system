// "use client"

// import Link from "next/link"
// import Image from "next/image"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { XCircle, AlertTriangle, Mail } from "lucide-react"

// export default function OwnerRejectedPage() {
//   // Mock data - in real app, fetch from database
//   const rejectionData = {
//     rejectedDate: "18/12/2024",
//     businessName: "Sân Thể Thao ABC",
//     reasons: [
//       "Giấy phép kinh doanh không rõ ràng hoặc hết hạn",
//       "Thông tin CMND/CCCD không khớp với tên đăng ký",
//       "Địa chỉ kinh doanh chưa được xác minh",
//     ],
//     adminNote:
//       "Vui lòng kiểm tra lại các giấy tờ và đảm bảo thông tin chính xác. Bạn có thể đăng ký lại sau khi chuẩn bị đầy đủ hồ sơ.",
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
//       <Card className="max-w-2xl w-full p-8 md:p-12">
//         {/* Logo */}
//         <div className="flex justify-center mb-6">
//           <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={80} height={80} className="object-contain" />
//         </div>

//         {/* Status Icon */}
//         <div className="flex justify-center mb-6">
//           <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
//             <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
//           </div>
//         </div>

//         {/* Title */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-3">Đơn Đăng Ký Chưa Được Chấp Nhận</h1>
//           <p className="text-muted-foreground text-lg">
//             Rất tiếc, đơn đăng ký chủ sân của bạn chưa đáp ứng các yêu cầu cần thiết.
//           </p>
//         </div>

//         {/* Rejection Info */}
//         <Card className="bg-muted/50 p-6 mb-6">
//           <div className="flex items-start gap-3 mb-4">
//             <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
//             <div className="flex-1">
//               <h3 className="font-semibold text-foreground mb-2">Lý Do Từ Chối</h3>
//               <ul className="space-y-2">
//                 {rejectionData.reasons.map((reason, index) => (
//                   <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
//                     <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
//                     <span>{reason}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           <div className="pt-4 border-t border-border">
//             <h3 className="font-semibold text-foreground mb-2">Ghi Chú Từ Admin</h3>
//             <p className="text-sm text-muted-foreground">{rejectionData.adminNote}</p>
//           </div>
//         </Card>

//         {/* What's Next */}
//         <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 mb-8">
//           <h3 className="font-semibold text-foreground mb-3">Bạn Có Thể Làm Gì Tiếp Theo?</h3>
//           <ol className="space-y-2 text-sm text-muted-foreground">
//             <li className="flex items-start gap-2">
//               <span className="font-semibold text-foreground">1.</span>
//               <span>Kiểm tra và chuẩn bị lại các giấy tờ theo yêu cầu</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="font-semibold text-foreground">2.</span>
//               <span>Đảm bảo thông tin chính xác và đầy đủ</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="font-semibold text-foreground">3.</span>
//               <span>Đăng ký lại với hồ sơ đã được cập nhật</span>
//             </li>
//           </ol>
//         </Card>

//         {/* Contact Support */}
//         <Card className="bg-muted/50 p-4 mb-8">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
//               <Mail className="w-5 h-5 text-primary-foreground" />
//             </div>
//             <div className="flex-1">
//               <p className="text-sm font-medium text-foreground">Cần hỗ trợ thêm?</p>
//               <p className="text-xs text-muted-foreground">Liên hệ với chúng tôi để được tư vấn chi tiết</p>
//             </div>
//           </div>
//         </Card>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-3">
//           <Button asChild className="flex-1">
//             <Link href="/register">Đăng Ký Lại</Link>
//           </Button>
//           <Button asChild variant="outline" className="flex-1 bg-transparent">
//             <Link href="/contact">Liên Hệ Hỗ Trợ</Link>
//           </Button>
//         </div>

//         <div className="mt-6 text-center">
//           <Link href="/" className="text-sm text-primary hover:text-primary/80">
//             Về Trang Chủ
//           </Link>
//         </div>
//       </Card>
//     </main>
//   )
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { XCircle, AlertTriangle, Mail } from "lucide-react";

import { getOwnerProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function OwnerRejectedPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);

  // ============================
  // LOAD OWNER PROFILE REAL DATA
  // ============================
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      // Nếu không có token → bắt login
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getOwnerProfile(token);

        // Nếu không phải rejected → redirect đúng trang
        if (data.status === "pending") {
          router.push("/owner/pending");
          return;
        }
        if (data.status === "approved") {
          router.push("/owner/dashboard");
          return;
        }

        // Nếu đúng rejected → giữ lại
        setProfile(data);
      } catch (err) {
        console.error(err);
        router.push("/login");
      }
    }

    load();
  }, []);

  // Loading UI
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Đang tải dữ liệu...
      </div>
    );
  }

  // ============================
  // PREPARE DATA
  // ============================
  const rejectedDate = new Date(profile.rejected_at || "").toLocaleDateString("vi-VN");

  // Backend reject_reason có thể là string hoặc array
  const reasons = Array.isArray(profile.reject_reason)
    ? profile.reject_reason
    : typeof profile.reject_reason === "string"
    ? profile.reject_reason.split(";")
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={80} height={80} className="object-contain" />
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">Đơn Đăng Ký Chưa Được Chấp Nhận</h1>
          <p className="text-muted-foreground text-lg">
            Rất tiếc, đơn đăng ký chủ sân của bạn chưa đáp ứng các yêu cầu cần thiết.
          </p>
        </div>

        {/* Rejection Info */}
        <Card className="bg-muted/50 p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Lý Do Từ Chối</h3>
              <ul className="space-y-2">
                {reasons.map((reason: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-2">Ghi Chú Từ Admin</h3>
            <p className="text-sm text-muted-foreground">
              {profile.admin_note || "Không có ghi chú thêm từ admin."}
            </p>
          </div>
        </Card>

        {/* What's Next */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-3">Bạn Có Thể Làm Gì Tiếp Theo?</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>Kiểm tra và chuẩn bị lại các giấy tờ theo yêu cầu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>Đảm bảo thông tin chính xác và đầy đủ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>Đăng ký lại với hồ sơ đã được cập nhật</span>
            </li>
          </ol>
        </Card>

        {/* Contact Support */}
        <Card className="bg-muted/50 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Cần hỗ trợ thêm?</p>
              <p className="text-xs text-muted-foreground">Liên hệ với chúng tôi để được tư vấn chi tiết</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/register">Đăng Ký Lại</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/contact">Liên Hệ Hỗ Trợ</Link>
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:text-primary/80">
            Về Trang Chủ
          </Link>
        </div>
      </Card>
    </main>
  );
}
