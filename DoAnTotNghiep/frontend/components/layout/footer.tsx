import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 border-t border-slate-800 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/hcmut-logo.png" alt="HCMUT" width={40} height={40} className="rounded" />
              <span className="font-bold text-lg">HCMUT SFMS</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Hệ thống quản lý sân thể thao Đại học Bách Khoa TP.HCM
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <li>
                <Link href="/" className="hover:text-green-400 dark:hover:text-green-500 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-green-400 dark:hover:text-green-500 transition-colors">
                  Danh sách sân
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-green-400 dark:hover:text-green-500 transition-colors">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <li>
                <Link href="/help" className="hover:text-green-400 dark:hover:text-green-500 transition-colors">
                  Trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-green-400 dark:hover:text-green-500 transition-colors">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-green-400 dark:hover:text-green-500 transition-colors">
                  Bảo mật
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                (028) 3869 4242
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@hcmut.edu.vn
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                268 Lý Thường Kiệt, Q.10
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-900 pt-6 text-center text-sm text-gray-500 dark:text-gray-600">
          <p>&copy; 2025 HCMUT Sport Field Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
