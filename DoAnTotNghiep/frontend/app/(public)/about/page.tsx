import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Target,
  Lightbulb,
  ChevronRight,
  Home,
  Mail,
  Phone,
  Clock,
  Users,
  Zap,
  Shield,
  Check,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image src="/sports-stadium-panorama.png" alt="Sports Stadium" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-slate-900/60 to-slate-900/80" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center text-sm text-white/70 mb-8">
            <Link href="/" className="flex items-center hover:text-white transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white">Về chúng tôi</span>
          </nav>

          <div className="max-w-4xl mb-8">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 text-base px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              Về HCMUT Sport
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
              Nền tảng quản lý sân thể thao{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                hiện đại
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed">
              Hệ thống quản lý và đặt sân thể thao toàn diện phục vụ cộng đồng Đại học Bách Khoa TP.HCM
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/80 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Được tin tưởng bởi HCMUT</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Quản lý chuyên nghiệp</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Tầm nhìn & Sứ mệnh
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Những gì chúng tôi theo đuổi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Xây dựng hệ thống quản lý sân thể thao hàng đầu tại các trường đại học Việt Nam
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Sứ mệnh</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tạo môi trường thuận lợi cho sinh viên, giảng viên và cộng đồng HCMUT tham gia hoạt động thể thao, rèn
                luyện sức khỏe thông qua nền tảng quản lý sân hiệu quả và dễ sử dụng.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Tầm nhìn</h3>
              <p className="text-muted-foreground leading-relaxed">
                Trở thành hệ thống quản lý sân thể thao hàng đầu trong các trường đại học Việt Nam, đóng góp vào sự phát
                triển hoạt động thể thao học đường.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Giá trị cốt lõi
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Những gì chúng tôi đại diện</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Các nguyên tắc hướng dẫn tất cả những gì chúng tôi làm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Người dùng trước tiên</h3>
              <p className="text-sm text-muted-foreground">
                Luôn đặt nhu cầu của người dùng lên hàng đầu trong mọi quyết định thiết kế
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Đơn giản & Hiệu quả</h3>
              <p className="text-sm text-muted-foreground">
                Tạo ra các giải pháp dễ sử dụng nhưng mạnh mẽ để giải quyết vấn đề thực tế
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Tin cậy & Bảo mật</h3>
              <p className="text-sm text-muted-foreground">
                Bảo vệ dữ liệu người dùng và duy trì độ tin cậy cao trong mọi hoạt động
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Quy trình
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Cách thức hoạt động</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              3 bước đơn giản để bắt đầu sử dụng nền tảng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
                1
              </div>
              <Card className="p-8 pt-12 hover:shadow-lg transition-all h-full">
                <h3 className="text-xl font-bold mb-3 text-foreground">Tìm sân</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Duyệt danh sách sân thể thao theo loại sân, vị trí, giá cả và thời gian có sẵn
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Tìm kiếm nâng cao</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Lọc theo khoảng giá</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Xem đánh giá realtime</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
                2
              </div>
              <Card className="p-8 pt-12 hover:shadow-lg transition-all h-full">
                <h3 className="text-xl font-bold mb-3 text-foreground">Đặt sân</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Chọn khung giờ phù hợp, thêm thông tin cần thiết và thanh toán online an toàn
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Xem lịch live</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Thanh toán linh hoạt</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Áp dụng mã giảm giá</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
                3
              </div>
              <Card className="p-8 pt-12 hover:shadow-lg transition-all h-full">
                <h3 className="text-xl font-bold mb-3 text-foreground">Xác nhận & Sử dụng</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Nhận xác nhận email với QR code, mã đặt sân và hướng dẫn để sử dụng sân
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Xác nhận tức thì</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>QR code check-in</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Hỗ trợ 24/7</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Liên hệ chúng tôi</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                HCMUT Sport được phát triển bởi Khoa Khoa học và Kỹ thuật Máy tính. Chúng tôi sẵn sàng hỗ trợ bạn bất kỳ
                lúc nào.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Building2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Địa chỉ</p>
                    <p className="text-muted-foreground">268 Lý Thường Kiệt, Quận 10, TP.HCM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Email</p>
                    <p className="text-muted-foreground">sport@hcmut.edu.vn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Điện thoại</p>
                    <p className="text-muted-foreground">(028) 3864 4390</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Giờ hoạt động</p>
                    <p className="text-muted-foreground">T2-T6: 7:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 border-green-600/30 bg-green-50 dark:bg-green-900/30 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">Sẵn sàng bắt đầu?</h3>
              <p className="text-green-800 dark:text-green-200 mb-8 leading-relaxed">
                Tham gia cộng đồng và đặt sân thể thao ngay hôm nay. Hoàn toàn miễn phí!
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base">
                  <Link href="/browse">
                    Tìm sân ngay
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-green-600 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 bg-transparent h-12"
                >
                  <Link href="/register">Đăng ký tài khoản</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
