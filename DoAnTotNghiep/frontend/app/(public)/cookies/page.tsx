import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <h1 className="text-4xl font-bold mb-2">Chính Sách Cookie</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: Tháng 1, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Cookie Là Gì?</h2>
            <p className="text-foreground/80 mb-4">
              Cookie là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập website. Chúng giúp
              website ghi nhớ thông tin về lượt truy cập của bạn, giúp trải nghiệm của bạn dễ dàng và hữu ích hơn.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Các Loại Cookie Chúng Tôi Sử Dụng</h2>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Cookie Cần Thiết</h3>
              <p className="text-foreground/80 mb-2">
                Những cookie này cần thiết để website hoạt động và không thể tắt trong hệ thống của chúng tôi.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Xác thực đăng nhập</li>
                <li>Bảo mật phiên làm việc</li>
                <li>Ghi nhớ giỏ hàng</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Cookie Chức Năng</h3>
              <p className="text-foreground/80 mb-2">
                Những cookie này cho phép website cung cấp chức năng nâng cao và cá nhân hóa.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Ghi nhớ ngôn ngữ ưa thích</li>
                <li>Ghi nhớ chế độ dark/light mode</li>
                <li>Lưu tùy chọn bộ lọc tìm kiếm</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Cookie Phân Tích</h3>
              <p className="text-foreground/80 mb-2">
                Những cookie này giúp chúng tôi hiểu cách người dùng tương tác với website.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Số lượng người truy cập</li>
                <li>Trang được xem nhiều nhất</li>
                <li>Thời gian sử dụng trung bình</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Cookie Marketing</h3>
              <p className="text-foreground/80 mb-2">
                Những cookie này được sử dụng để hiển thị quảng cáo phù hợp với bạn.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Theo dõi hoạt động trên nhiều website</li>
                <li>Hiển thị quảng cáo được nhắm mục tiêu</li>
                <li>Đo lường hiệu quả chiến dịch</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Quản Lý Cookie</h2>
            <p className="text-foreground/80 mb-4">
              Bạn có thể kiểm soát và/hoặc xóa cookie theo ý muốn. Bạn có thể xóa tất cả cookie đã có trên máy tính của
              bạn và bạn có thể thiết lập hầu hết các trình duyệt để ngăn chặn việc lưu cookie.
            </p>
            <p className="text-foreground/80 mb-4">
              <strong>Lưu ý:</strong> Nếu bạn chọn tắt cookie, một số tính năng của website có thể không hoạt động đúng
              cách.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Cách Xóa Cookie</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>
                <strong>Chrome:</strong> Settings → Privacy and security → Clear browsing data
              </li>
              <li>
                <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data → Clear Data
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Manage Website Data → Remove All
              </li>
              <li>
                <strong>Edge:</strong> Settings → Privacy, search, and services → Clear browsing data
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Cookie Của Bên Thứ Ba</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi có thể sử dụng cookie của bên thứ ba từ các đối tác như Google Analytics để phân tích lưu lượng
              truy cập. Những cookie này tuân theo chính sách riêng tư của bên thứ ba đó.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Cập Nhật Chính Sách</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi có thể cập nhật chính sách cookie này theo thời gian. Mọi thay đổi sẽ được đăng trên trang này
              với ngày cập nhật mới.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Liên Hệ</h2>
            <p className="text-foreground/80 mb-4">Nếu bạn có câu hỏi về chính sách cookie, vui lòng liên hệ:</p>
            <ul className="list-none space-y-2 text-foreground/80">
              <li>Email: privacy@hcmut-sportfield.edu.vn</li>
              <li>Điện thoại: (028) 3869 2003</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
