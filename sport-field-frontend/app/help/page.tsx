import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <h1 className="text-4xl font-bold mb-2">Trung Tâm Trợ Giúp</h1>
        <p className="text-muted-foreground mb-8">Tìm câu trả lời cho các câu hỏi thường gặp và hướng dẫn sử dụng</p>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Tìm kiếm câu hỏi..." className="pl-10" />
        </div>

        {/* Help Categories */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-primary transition">
            <CardHeader>
              <CardTitle className="text-lg">Đặt Sân</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Hướng dẫn tìm kiếm và đặt sân thể thao</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition">
            <CardHeader>
              <CardTitle className="text-lg">Thanh Toán</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Phương thức thanh toán và hoàn tiền</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition">
            <CardHeader>
              <CardTitle className="text-lg">Tài Khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Quản lý tài khoản và cài đặt</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Đặt Sân</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Làm thế nào để đặt sân?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2 text-foreground/80">
                    <li>Tìm kiếm sân phù hợp trên trang Duyệt Sân</li>
                    <li>Chọn sân và xem chi tiết</li>
                    <li>Chọn ngày và giờ muốn đặt</li>
                    <li>Điền thông tin và xác nhận đặt sân</li>
                    <li>Thanh toán để hoàn tất</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Tôi có thể đặt sân trước bao lâu?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Bạn có thể đặt sân trước tối đa 30 ngày. Một số sân có thể cho phép đặt trước lâu hơn tùy theo chính
                    sách của chủ sân.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Tôi có thể hủy đặt sân không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80 mb-2">Có, bạn có thể hủy đặt sân theo chính sách hoàn tiền:</p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                    <li>Hủy trước 24 giờ: Hoàn 100%</li>
                    <li>Hủy trước 12 giờ: Hoàn 50%</li>
                    <li>Hủy trong vòng 12 giờ: Không hoàn tiền</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Thanh Toán</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-1">
                <AccordionTrigger>Có những phương thức thanh toán nào?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80 mb-2">Chúng tôi chấp nhận các phương thức sau:</p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                    <li>Thẻ tín dụng/ghi nợ (Visa, Mastercard)</li>
                    <li>Chuyển khoản ngân hàng</li>
                    <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
                    <li>Thanh toán tại sân (nếu chủ sân cho phép)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-2">
                <AccordionTrigger>Khi nào tôi được hoàn tiền?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Tiền hoàn sẽ được xử lý trong vòng 5-7 ngày làm việc kể từ khi yêu cầu hủy được chấp nhận. Thời gian
                    tiền về tài khoản phụ thuộc vào ngân hàng của bạn.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-3">
                <AccordionTrigger>Thanh toán có an toàn không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Có, tất cả giao dịch thanh toán đều được mã hóa SSL và tuân thủ tiêu chuẩn bảo mật PCI DSS. Chúng
                    tôi không lưu trữ thông tin thẻ của bạn.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Tài Khoản</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account-1">
                <AccordionTrigger>Làm thế nào để đăng ký tài khoản?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Click vào nút "Đăng nhập" ở góc trên phải, sau đó chọn "Đăng ký". Điền thông tin cá nhân và email
                    của bạn. Bạn sẽ nhận được email xác nhận để kích hoạt tài khoản.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-2">
                <AccordionTrigger>Tôi quên mật khẩu, phải làm sao?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Click vào "Quên mật khẩu" ở trang đăng nhập. Nhập email đã đăng ký, bạn sẽ nhận được link đặt lại
                    mật khẩu qua email.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-3">
                <AccordionTrigger>Làm thế nào để xóa tài khoản?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Vào Cài đặt → Tài khoản → Xóa tài khoản. Lưu ý rằng việc xóa tài khoản là vĩnh viễn và không thể
                    khôi phục. Tất cả dữ liệu của bạn sẽ bị xóa.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Contact Support */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Không tìm thấy câu trả lời?</h3>
            <p className="text-muted-foreground mb-4">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition"
            >
              Liên hệ hỗ trợ
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
