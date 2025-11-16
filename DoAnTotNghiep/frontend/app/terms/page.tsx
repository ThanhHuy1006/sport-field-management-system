import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <h1 className="text-4xl font-bold mb-2">Điều Khoản Dịch Vụ</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: Tháng 1, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Chấp Nhận Điều Khoản</h2>
            <p className="text-foreground/80 mb-4">
              Bằng việc truy cập và sử dụng Hệ Thống Quản Lý Sân Thể Thao HCMUT, bạn đồng ý tuân thủ các điều khoản và
              điều kiện này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Đăng Ký Tài Khoản</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản</li>
              <li>Thông tin đăng ký phải chính xác và đầy đủ</li>
              <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập</li>
              <li>Mỗi người chỉ được tạo một tài khoản</li>
              <li>Không được chia sẻ tài khoản cho người khác</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Đặt Sân</h2>
            <p className="text-foreground/80 mb-4">Khi đặt sân, bạn đồng ý:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Cung cấp thông tin chính xác về đặt sân</li>
              <li>Thanh toán đầy đủ theo giá niêm yết</li>
              <li>Tuân thủ quy định của từng sân</li>
              <li>Đến đúng giờ đã đặt</li>
              <li>Chịu trách nhiệm về hành vi của nhóm của bạn</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Thanh Toán và Hoàn Tiền</h2>
            <p className="text-foreground/80 mb-4">
              <strong>Thanh toán:</strong> Tất cả các khoản thanh toán phải được thực hiện qua hệ thống của chúng tôi.
            </p>
            <p className="text-foreground/80 mb-4">
              <strong>Hoàn tiền:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Hủy trước 24 giờ: Hoàn 100%</li>
              <li>Hủy trước 12 giờ: Hoàn 50%</li>
              <li>Hủy trong vòng 12 giờ: Không hoàn tiền</li>
              <li>Không đến mà không báo: Không hoàn tiền</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Hành Vi Cấm</h2>
            <p className="text-foreground/80 mb-4">Bạn không được:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
              <li>Đặt sân giả hoặc spam hệ thống</li>
              <li>Gây rối, phá hoại tài sản sân</li>
              <li>Sử dụng ngôn ngữ thô tục, xúc phạm</li>
              <li>Cố gắng hack hoặc phá hoại hệ thống</li>
              <li>Đăng nội dung vi phạm pháp luật</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Trách Nhiệm</h2>
            <p className="text-foreground/80 mb-4">Chúng tôi không chịu trách nhiệm về:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Chấn thương xảy ra trong quá trình chơi thể thao</li>
              <li>Mất mát hoặc hư hỏng tài sản cá nhân</li>
              <li>Tranh chấp giữa người dùng và chủ sân</li>
              <li>Thay đổi giá hoặc tình trạng sân từ phía chủ sân</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Chấm Dứt Tài Khoản</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi có quyền đình chỉ hoặc xóa tài khoản của bạn nếu vi phạm điều khoản này mà không cần thông báo
              trước.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Thay Đổi Điều Khoản</h2>
            <p className="text-foreground/80 mb-4">
              Chúng tôi có quyền thay đổi điều khoản này bất kỳ lúc nào. Thay đổi sẽ có hiệu lực ngay khi được đăng tải.
              Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có nghĩa là bạn chấp nhận điều khoản mới.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Liên Hệ</h2>
            <p className="text-foreground/80 mb-4">Nếu bạn có câu hỏi về điều khoản dịch vụ, vui lòng liên hệ:</p>
            <ul className="list-none space-y-2 text-foreground/80">
              <li>Email: support@hcmut-sportfield.edu.vn</li>
              <li>Điện thoại: (028) 3869 2003</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
