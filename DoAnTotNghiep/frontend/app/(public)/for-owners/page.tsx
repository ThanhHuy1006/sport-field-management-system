import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  TrendingUp,
  Shield,
  BarChart3,
  Clock,
  Smartphone,
  Check,
  ArrowRight,
  Building2,
  DollarSign,
  Star,
  MessageSquare,
  TicketPercent,
  ChevronRight,
  Home,
} from "lucide-react"

export default function ForOwnersPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-900/40 to-slate-900 text-white py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[url('/sports-field-background.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto mb-8">
            <nav className="flex items-center text-sm text-slate-400">
              <Link href="/" className="flex items-center hover:text-green-400 transition-colors">
                <Home className="w-4 h-4 mr-1" />
                Trang chủ
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-white">Dành cho chủ sân</span>
            </nav>
          </div>
          {/* </CHANGE> */}

          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 text-base px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              Dành cho Chủ Sân Thể Thao
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-balance leading-tight">
              Quản lý sân thể thao{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                chuyên nghiệp
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Hệ thống quản lý toàn diện từ booking, pricing, voucher đến đánh giá - tất cả trên một nền tảng duy nhất
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                asChild
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white h-14 text-lg px-10 shadow-lg shadow-green-500/20"
              >
                <Link href="/register/owner">
                  Đăng ký làm chủ sân
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800/50 h-14 text-lg px-10 bg-slate-800/30 backdrop-blur"
              >
                <Link href="/contact">Liên hệ tư vấn</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Không phí setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Xét duyệt trong 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Tính năng chính
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Những gì bạn nhận được</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hệ thống được thiết kế đặc biệt cho chủ sân thể thao tại Việt Nam
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature 1: Booking Management */}
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quản lý booking</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Duyệt/từ chối booking, kiểm tra xung đột lịch tự động, theo dõi trạng thái đơn đặt sân
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Phát hiện booking trùng lặp</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Xác nhận nhanh trong 1 click</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Gửi email thông báo tự động</span>
                </li>
              </ul>
            </Card>

            {/* Feature 2: Schedule Views */}
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lịch trình thông minh</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Xem lịch đặt sân theo ngày/tuần/danh sách, theo dõi sân nào đang hoạt động
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>3 chế độ xem: Day/Week/List</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Lọc theo location, owner, field</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Highlight booking hiện tại</span>
                </li>
              </ul>
            </Card>

            {/* Feature 3: Pricing Management */}
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Định giá linh hoạt</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Thiết lập giá ngày thường/cuối tuần, giờ mở/đóng cửa cho từng sân
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Giá theo ngày trong tuần</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Thiết lập giờ hoạt động</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Cập nhật giá realtime</span>
                </li>
              </ul>
            </Card>

            {/* Feature 4: Voucher System */}
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TicketPercent className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quản lý voucher</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Tạo mã giảm giá theo % hoặc số tiền, theo dõi số lần sử dụng
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Giảm giá theo % hoặc VND</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Thiết lập ngày hết hạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Theo dõi usage statistics</span>
                </li>
              </ul>
            </Card>

            {/* Feature 5: Review Management */}
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quản lý đánh giá</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Xem và phản hồi đánh giá từ khách hàng, lọc theo sân và trạng thái
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Reply trực tiếp trên platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Lọc chưa phản hồi/đã phản hồi</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Xem rating trung bình</span>
                </li>
              </ul>
            </Card>

            {/* Feature 6: Field Management */}
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quản lý sân</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Thêm/sửa/xóa sân, upload hình ảnh, thiết lập tiện ích và sức chứa
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Upload nhiều hình ảnh</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Thiết lập amenities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Tìm kiếm và lọc nhanh</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Quy trình đơn giản
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Cách thức hoạt động</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Chỉ 3 bước để bắt đầu quản lý sân của bạn</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
                1
              </div>
              <Card className="p-8 pt-12 hover:shadow-lg transition-all h-full">
                <h3 className="text-2xl font-bold mb-4">Đăng ký & xác minh</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Điền thông tin doanh nghiệp và upload giấy phép kinh doanh. Admin xét duyệt trong 24 giờ làm việc.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Form đăng ký đơn giản</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Upload documents online</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Nhận email thông báo kết quả</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
                2
              </div>
              <Card className="p-8 pt-12 hover:shadow-lg transition-all h-full">
                <h3 className="text-2xl font-bold mb-4">Thiết lập sân</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Thêm thông tin sân, upload hình ảnh chất lượng cao, thiết lập giá và giờ hoạt động.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Upload nhiều hình ảnh</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Thiết lập pricing linh hoạt</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Thêm amenities và mô tả</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
                3
              </div>
              <Card className="p-8 pt-12 hover:shadow-lg transition-all h-full">
                <h3 className="text-2xl font-bold mb-4">Nhận booking</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Khách hàng đặt sân online, bạn duyệt từ dashboard. Hệ thống tự động gửi email xác nhận.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Duyệt booking 1 click</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Phát hiện xung đột tự động</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Email notification realtime</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Overview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Giao diện quản lý
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Dashboard chuyên nghiệp</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tất cả tính năng quản lý trong một nơi, dễ sử dụng và trực quan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <Card className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Thống kê realtime</h4>
                  <p className="text-sm text-muted-foreground">
                    Xem doanh thu, booking và khách hàng trong thời gian thực
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Lịch hôm nay</h4>
                  <p className="text-sm text-muted-foreground">Timeline booking với highlight booking hiện tại</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Charts & analytics</h4>
                  <p className="text-sm text-muted-foreground">Revenue trend và booking chart theo tuần/tháng</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Thông báo realtime</h4>
                  <p className="text-sm text-muted-foreground">Alert cho booking pending, review mới và messages</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Mobile responsive</h4>
                  <p className="text-sm text-muted-foreground">Quản lý mọi lúc mọi nơi trên điện thoại và tablet</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Bảo mật cao</h4>
                  <p className="text-sm text-muted-foreground">Dữ liệu được mã hóa và backup tự động hàng ngày</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Minh bạch chi phí
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Không phí ẩn</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi cam kết minh bạch 100% về chi phí sử dụng platform
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-12 border-2 border-primary shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2">Miễn phí Setup</h3>
                <p className="text-muted-foreground">Không tốn chi phí ban đầu</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Không phí đăng ký</p>
                    <p className="text-sm text-muted-foreground">Tạo tài khoản và bắt đầu hoàn toàn miễn phí</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Không phí hàng tháng</p>
                    <p className="text-sm text-muted-foreground">Không subscription, không recurring charges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Không giới hạn tính năng</p>
                    <p className="text-sm text-muted-foreground">Truy cập đầy đủ mọi tính năng của hệ thống</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Hỗ trợ 24/7</p>
                    <p className="text-sm text-muted-foreground">Đội ngũ support sẵn sàng hỗ trợ bạn mọi lúc</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/register/owner">
                  Bắt đầu ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Sẵn sàng quản lý sân chuyên nghiệp?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay và bắt đầu nhận booking từ hàng ngàn khách hàng trong hệ sinh thái HCMUT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="h-14 text-lg px-10">
                <Link href="/register/owner">
                  Đăng ký làm chủ sân
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 text-lg px-10 border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/contact">Liên hệ tư vấn</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
