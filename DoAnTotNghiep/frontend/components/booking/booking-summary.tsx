import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Field } from "@/types"

interface BookingSummaryProps {
  field: Pick<Field, "name" | "address" | "price">
  date: string
  timeSlots: string[]
  className?: string
}

export function BookingSummary({ field, date, timeSlots, className }: BookingSummaryProps) {
  const hours = timeSlots.length
  const subtotal = field.price * hours
  const serviceFee = 50000
  const total = subtotal + serviceFee

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">Chi tiết đặt sân</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sân</span>
            <span className="font-medium">{field.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Giờ</span>
            <span className="font-medium">{timeSlots.join(", ")}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {field.price.toLocaleString()}đ x {hours} giờ
            </span>
            <span>{subtotal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí dịch vụ</span>
            <span>{serviceFee.toLocaleString()}đ</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-bold">
          <span>Tổng cộng</span>
          <span className="text-primary">{total.toLocaleString()}đ</span>
        </div>
      </div>
    </Card>
  )
}
