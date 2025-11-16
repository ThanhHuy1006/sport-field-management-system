import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">⚽</span>
              </div>
              <span className="font-bold text-lg">Đặt Sân Thể Thao</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">Đặt sân thể thao mọi lúc, mọi nơi</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Duyệt Sân</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/browse" className="hover:text-primary-foreground transition">
                  Tất cả sân
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-primary-foreground transition">
                  Theo môn thể thao
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-primary-foreground transition">
                  Theo địa điểm
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/help" className="hover:text-primary-foreground transition">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-foreground transition">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Chính Sách</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/privacy" className="hover:text-primary-foreground transition">
                  Bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-foreground transition">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary-foreground transition">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; 2025 Hệ Thống Đặt Sân Thể Thao HCMUT. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  )
}
