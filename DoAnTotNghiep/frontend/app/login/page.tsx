// "use client"

// import type React from "react"

// import { useState } from "react"
// import Link from "next/link"
// import Image from "next/image"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { Mail, Lock, ArrowLeft } from "lucide-react"

// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [rememberMe, setRememberMe] = useState(false)

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault()
//     console.log("Login:", { email, password, rememberMe })

//     // In real app: authenticate and check user status from database

//     // Simulate different user types for testing
//     if (email.includes("owner")) {
//       // Mock: Check if owner status is pending
//       const mockStatus = "active" // Change to "pending_approval" or "rejected" to test

//       if (mockStatus === "pending_approval") {
//         window.location.href = "/owner/pending"
//       } else if (mockStatus === "rejected") {
//         window.location.href = "/owner/rejected"
//       } else {
//         window.location.href = "/owner/dashboard"
//       }
//     } else if (email.includes("admin")) {
//       window.location.href = "/admin/dashboard"
//     } else {
//       window.location.href = "/browse"
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
//           <ArrowLeft className="w-4 h-4" />
//           Về Trang Chủ
//         </Link>

//         <Card className="p-8">
//           <div className="text-center mb-8">
//             <div className="flex justify-center mb-4">
//               <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={64} height={64} className="object-contain" />
//             </div>
//             <h1 className="text-3xl font-bold text-foreground">Chào Mừng Trở Lại</h1>
//             <p className="text-muted-foreground mt-2">Đăng nhập vào Hệ Thống Quản Lý Sân Thể Thao HCMUT</p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
//                 <Input
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Mật Khẩu</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
//                 <Input
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="w-4 h-4 rounded border-border"
//                 />
//                 <span className="text-sm text-foreground">Ghi nhớ đăng nhập</span>
//               </label>
//               <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
//                 Quên mật khẩu?
//               </Link>
//             </div>

//             <Button type="submit" className="w-full">
//               Đăng Nhập
//             </Button>
//           </form>

//           <div className="mt-6 pt-6 border-t border-border text-center">
//             <p className="text-sm text-muted-foreground">
//               Chưa có tài khoản?{" "}
//               <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
//                 Đăng ký tại đây
//               </Link>
//             </p>
//           </div>
//         </Card>
//       </div>
//     </main>
//   )
// }
// "use client";

// import type React from "react";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import { Mail, Lock, ArrowLeft } from "lucide-react";
// import { login } from "@/lib/auth";          // <-- Thêm
// import { useRouter } from "next/navigation"; // <-- Thêm

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState("");

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {
//       // CALL API BACKEND
//       const data = await login(email, password); // { token, user }

//       // SAVE TOKEN & ROLE (localStorage + cookie cho middleware)
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.user.role);

//       document.cookie = `token=${data.token}; path=/;`;
//       document.cookie = `role=${data.user.role}; path=/;`;

//       // ROLE LOGIC ===========================================
//       const role = data.user.role;

//       // ADMIN
//       if (role === "ADMIN") {
//         router.push("/admin/dashboard");
//         return;
//       }

//       // CUSTOMER (USER)
//       if (role === "CUSTOMER" || role === "USER") {
//         router.push("/page.tsx");
//         return;
//       }

//       // OWNER → Must check approval status from backend
//       if (role === "OWNER") {
//         /**
//          * Backend trả thế này:
//          * {
//          *   token,
//          *   user: {...},
//          *   ownerProfile: {
//          *     status: "pending" | "approved" | "rejected",
//          *     reject_reason: "...",
//          *   }
//          * }
//          */
//         const status = data.ownerProfile?.status;

//         if (status === "pending") {
//           router.push("/owner/pending");
//           return;
//         }

//         if (status === "rejected") {
//           router.push(`/owner/rejected?reason=${data.ownerProfile.reject_reason}`);
//           return;
//         }

//         // APPROVED
//         router.push("/owner/dashboard");
//         return;
//       }

//       // DEFAULT
//       router.push("page.tsx");
//     } catch (err: any) {
//       console.log(err);
//       setError("Email hoặc mật khẩu không đúng");
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
//           <ArrowLeft className="w-4 h-4" />
//           Về Trang Chủ
//         </Link>

//         <Card className="p-8">
//           <div className="text-center mb-8">
//             <div className="flex justify-center mb-4">
//               <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={64} height={64} className="object-contain" />
//             </div>
//             <h1 className="text-3xl font-bold text-foreground">Chào Mừng Trở Lại</h1>
//             <p className="text-muted-foreground mt-2">Đăng nhập vào Hệ Thống Quản Lý Sân Thể Thao HCMUT</p>
//           </div>

//           {/* ERROR MESSAGE */}
//           {error && (
//             <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
//           )}

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
//                 <Input
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Mật Khẩu</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
//                 <Input
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="w-4 h-4 rounded border-border"
//                 />
//                 <span className="text-sm text-foreground">Ghi nhớ đăng nhập</span>
//               </label>
//               <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
//                 Quên mật khẩu?
//               </Link>
//             </div>

//             <Button type="submit" className="w-full">
//               Đăng Nhập
//             </Button>
//           </form>

//           <div className="mt-6 pt-6 border-t border-border text-center">
//             <p className="text-sm text-muted-foreground">
//               Chưa có tài khoản?{" "}
//               <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
//                 Đăng ký tại đây
//               </Link>
//             </p>
//           </div>
//         </Card>
//       </div>
//     </main>
//   );
// }
"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, ArrowLeft } from "lucide-react";

import { login, getOwnerProfile } from "@/lib/auth"; // <-- Thêm
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  // localStorage.removeItem("token");
  // localStorage.removeItem("role");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // ============================
      // 1) LOGIN BACKEND
      // ============================
      const data = await login(email, password);

      // Backend trả: { token, user: { id, role } }
      const token = data.token;
      const role = data.user.role;

      // Lưu token để FE dùng ở step tiếp theo
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      document.cookie = `token=${token}; path=/;`;
      document.cookie = `role=${role}; path=/;`;

      // ============================
      // 2) ROLE: ADMIN
      // ============================
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
        return;
      }

      // ============================
      // 3) ROLE: CUSTOMER / USER
      // ============================
      if (role === "CUSTOMER" || role === "USER") {
        router.push("/");
        return;
      }

      // ============================
      // 4) ROLE: OWNER → CALL PROFILE API
      // ============================
      if (role === "OWNER") {
        const profile = await getOwnerProfile(token);
        const status = profile.status;

        if (status === "pending") {
          router.push("/owner/pending");
          return;
        }

        if (status === "rejected") {
          router.push("/owner/rejected");
          return;
        }

        if (status === "approved") {
          router.push("/owner/dashboard");
          return;
        }

        // fallback
        router.push("/owner/pending");
        return;
      }

      // Nếu cố login vào role lạ
      router.push("/");
    } catch (err: any) {
      console.log(err);
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Về Trang Chủ
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={64} height={64} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Chào Mừng Trở Lại</h1>
            <p className="text-muted-foreground mt-2">Đăng nhập vào Hệ Thống Quản Lý Sân Thể Thao HCMUT</p>
          </div>

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mật Khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="w-full">
              Đăng Nhập
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                Đăng ký tại đây
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
