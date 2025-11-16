import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <h1 className="text-4xl font-bold mb-2">Chính Sách Bảo Mật</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: Tháng 1, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Giới Thiệu</h2>
            <p className="text-foreground/80 mb-4">
              Chào mừng bạn đến với Hệ Thống Quản Lý Sân Thể Thao HCMUT. Chúng tôi cam kết bảo vệ quyền riêng tư và
              thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu
              của bạn.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Thông Tin Chúng Tôi Thu Thập</h2>
            <p className="text-foreground/80 mb-4">Chúng tôi thu thập các loại thông tin sau:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Thông tin cá nhân: Họ tên, email, số điện thoại</li>
              <li>Thông tin đặt sân: Lịch sử đặt sân, sở thích thể thao</li>
              <li>Thông tin thanh toán: Phương thức thanh toán (được mã hóa)</li>
              <li>Dữ liệu sử dụng: Cách bạn tương tác với nền tảng</li>
              <li>Thông tin thiết bị: Địa chỉ IP, loại trình duyệt, hệ điều hành</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
            <p className="text-foreground/80 mb-4">Thông tin của bạn được sử dụng để:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Xử lý và quản lý đặt sân của bạn</li>
              <li>Gửi xác nhận và thông báo về đặt sân</li>
              <li>Cải thiện dịch vụ và trải nghiệm người dùng</li>
              <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
              <li>Phân tích và báo cáo nội bộ</li>
              <li>Tuân thủ các yêu cầu pháp lý</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Bảo Mật Thông Tin</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin của bạn khỏi truy
              cập trái phép, mất mát hoặc tiết lộ. Dữ liệu được mã hóa trong quá trình truyền tải và lưu trữ.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Chia Sẻ Thông Tin</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ với:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Chủ sân để xử lý đặt sân của bạn</li>
              <li>Nhà cung cấp dịch vụ thanh toán</li>
              <li>Cơ quan pháp luật khi có yêu cầu hợp pháp</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Quyền Của Bạn</h2>
            <p className="text-foreground/80 mb-4">Bạn có quyền:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Truy cập và xem thông tin cá nhân của bạn</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu</li>
              <li>Từ chối nhận email marketing</li>
              <li>Rút lại sự đồng ý xử lý dữ liệu</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn. Xem{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Chính Sách Cookie
              </Link>{" "}
              để biết thêm chi tiết.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Liên Hệ</h2>
            <p className="text-foreground/80 mb-4">Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:</p>
            <ul className="list-none space-y-2 text-foreground/80">
              <li>Email: privacy@hcmut-sportfield.edu.vn</li>
              <li>Điện thoại: (028) 3869 2003</li>
              <li>Địa chỉ: Đại học Bách Khoa TP.HCM, 268 Lý Thường Kiệt, Quận 10, TP.HCM</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
