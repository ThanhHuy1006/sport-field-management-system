import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <h1 className="text-4xl font-bold mb-2">Câu Hỏi Thường Gặp</h1>
        <p className="text-muted-foreground mb-8">Tổng hợp các câu hỏi phổ biến nhất từ người dùng</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Chung</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="general-1">
                <AccordionTrigger>Hệ thống này dành cho ai?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Hệ thống dành cho sinh viên, giảng viên HCMUT và cộng đồng muốn đặt sân thể thao một cách dễ dàng và
                    nhanh chóng. Chúng tôi cung cấp nhiều loại sân: bóng đá, cầu lông, bóng rổ, tennis, v.v.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-2">
                <AccordionTrigger>Có cần đăng ký tài khoản không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Có, bạn cần đăng ký tài khoản để đặt sân. Điều này giúp bạn quản lý lịch đặt sân, xem lịch sử và
                    nhận thông báo về đặt sân của mình.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-3">
                <AccordionTrigger>Có mất phí sử dụng hệ thống không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Không, việc đăng ký và sử dụng hệ thống hoàn toàn miễn phí. Bạn chỉ cần thanh toán tiền thuê sân
                    theo giá niêm yết của từng sân.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Đặt Sân</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="booking-1">
                <AccordionTrigger>Tôi có thể đặt nhiều sân cùng lúc không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Có, bạn có thể đặt nhiều sân khác nhau hoặc cùng một sân ở nhiều khung giờ khác nhau. Mỗi đặt sân sẽ
                    được xử lý riêng biệt.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-2">
                <AccordionTrigger>Tôi có thể đặt sân định kỳ không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Hiện tại chưa hỗ trợ đặt sân định kỳ tự động. Tuy nhiên, bạn có thể đặt nhiều lần cho các ngày khác
                    nhau hoặc liên hệ trực tiếp với chủ sân để thỏa thuận.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-3">
                <AccordionTrigger>Điều gì xảy ra nếu sân bị hủy?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Nếu chủ sân hủy đặt sân của bạn (do sự cố bất khả kháng), bạn sẽ được hoàn tiền 100% và nhận thông
                    báo qua email/SMS. Chúng tôi cũng sẽ hỗ trợ bạn tìm sân thay thế nếu cần.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-4">
                <AccordionTrigger>Tôi có thể thay đổi giờ đặt sân không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Bạn có thể hủy đặt sân hiện tại (theo chính sách hoàn tiền) và đặt lại khung giờ mới. Hoặc liên hệ
                    trực tiếp với chủ sân để thỏa thuận thay đổi.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Thanh Toán & Hoàn Tiền</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-1">
                <AccordionTrigger>Tôi có thể thanh toán bằng tiền mặt không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Một số sân cho phép thanh toán tiền mặt tại chỗ. Thông tin này sẽ được hiển thị trên trang chi tiết
                    sân. Tuy nhiên, chúng tôi khuyến khích thanh toán online để đảm bảo đặt sân được xác nhận ngay lập
                    tức.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-2">
                <AccordionTrigger>Có được hoàn tiền nếu trời mưa không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Chính sách hoàn tiền do thời tiết phụ thuộc vào từng sân. Đối với sân ngoài trời, một số chủ sân có
                    chính sách hoàn tiền hoặc đổi lịch nếu trời mưa to. Vui lòng kiểm tra chính sách cụ thể của sân
                    trước khi đặt.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-3">
                <AccordionTrigger>Tôi có nhận được hóa đơn không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Có, sau khi thanh toán thành công, bạn sẽ nhận được hóa đơn điện tử qua email. Bạn cũng có thể tải
                    hóa đơn từ trang Lịch sử đặt sân trong tài khoản của mình.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Tài Khoản & Bảo Mật</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account-1">
                <AccordionTrigger>Thông tin của tôi có được bảo mật không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Có, chúng tôi sử dụng mã hóa SSL và tuân thủ các tiêu chuẩn bảo mật cao nhất để bảo vệ thông tin cá
                    nhân và thanh toán của bạn. Xem thêm tại{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </Link>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-2">
                <AccordionTrigger>Tôi có thể thay đổi email đăng ký không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Có, bạn có thể thay đổi email trong phần Cài đặt tài khoản. Bạn sẽ cần xác nhận email mới trước khi
                    thay đổi có hiệu lực.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-3">
                <AccordionTrigger>Làm thế nào để bảo vệ tài khoản của tôi?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80 mb-2">Để bảo vệ tài khoản, bạn nên:</p>
                  <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                    <li>Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt)</li>
                    <li>Không chia sẻ mật khẩu với người khác</li>
                    <li>Đăng xuất sau khi sử dụng trên thiết bị chung</li>
                    <li>Thay đổi mật khẩu định kỳ</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Dành Cho Chủ Sân</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="owner-1">
                <AccordionTrigger>Làm thế nào để đăng ký sân của tôi?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Đăng ký tài khoản và chọn vai trò "Chủ sân". Sau đó, điền thông tin sân của bạn, upload hình ảnh,
                    thiết lập giá và giờ hoạt động. Đội ngũ của chúng tôi sẽ xem xét và phê duyệt trong vòng 24-48 giờ.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="owner-2">
                <AccordionTrigger>Có mất phí khi đăng ký sân không?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Chúng tôi thu phí hoa hồng 10% trên mỗi đặt sân thành công. Không có phí đăng ký hay phí hàng tháng.
                    Bạn chỉ trả phí khi có khách đặt sân.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="owner-3">
                <AccordionTrigger>Khi nào tôi nhận được tiền?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/80">
                    Tiền sẽ được chuyển vào tài khoản của bạn sau khi khách hàng hoàn thành buổi chơi (sau 24 giờ kể từ
                    giờ kết thúc đặt sân). Bạn có thể rút tiền về tài khoản ngân hàng bất kỳ lúc nào.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Still have questions */}
        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">Vẫn còn thắc mắc?</h3>
          <p className="text-muted-foreground mb-4">Liên hệ với đội ngũ hỗ trợ của chúng tôi để được giải đáp</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition"
            >
              Liên hệ hỗ trợ
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 hover:bg-accent hover:text-accent-foreground transition"
            >
              Trung tâm trợ giúp
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
