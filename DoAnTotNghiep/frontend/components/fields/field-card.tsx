import Link from "next/link"
import { Star, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Field } from "@/types"
import { FIELD_IMAGES } from "@/lib/constants"

interface FieldCardProps {
  field: Field
  viewMode?: "grid" | "list"
}

// function getFieldImage(type: string, fallbackImage: string): string {
//   return FIELD_IMAGES[type] || fallbackImage
// }
function getFieldImage(type: string, fallbackImage?: string | null): string {
  return FIELD_IMAGES[type] || fallbackImage || "/placeholder.svg"
}

export function FieldCard({ field, viewMode = "grid" }: FieldCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all bg-card border-border">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
            <img
              src={getFieldImage(field.type, field.image) || "/placeholder.svg"}
              alt={field.name}
              className="w-full h-full object-cover"
            />
            <Badge
              className={`absolute top-3 left-3 ${
                field.available ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              } text-white`}
            >
              {field.available ? "Còn trống" : "Hết chỗ"}
            </Badge>
            <Badge className="absolute bottom-3 left-3 bg-black/70 hover:bg-black/80 text-white">{field.type}</Badge>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-2">{field.name}</h3>

              <div className="flex items-center gap-1 text-sm mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{field.rating}</span>
                <span className="text-muted-foreground">({field.reviews} đánh giá)</span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{field.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {field.openTime} - {field.closeTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Giá từ</p>
                <p className="text-xl font-bold text-primary">
                  {(field.price / 1000).toFixed(0)}K
                  <span className="text-sm font-normal text-muted-foreground">/giờ</span>
                </p>
              </div>
              <Link href={`/field/${field.id}`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Xem chi tiết</Button>
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Grid view (default)
  return (
    <Link href={`/field/${field.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all h-full group bg-card border-border">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getFieldImage(field.type, field.image) || "/placeholder.svg"}
            alt={field.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge
            className={`absolute top-3 right-3 ${
              field.available ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            {field.available ? "Còn trống" : "Hết chỗ"}
          </Badge>
          <Badge className="absolute bottom-3 left-3 bg-black/70 hover:bg-black/80 text-white">{field.type}</Badge>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-bold text-foreground mb-2 line-clamp-1">{field.name}</h3>

          <div className="flex items-center gap-1 text-sm mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">{field.rating}</span>
            <span className="text-muted-foreground">({field.reviews})</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{field.location}</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Clock className="w-4 h-4" />
            <span>
              {/* {field.openTime} - {field.closeTime} */}
              {field.openTime ?? "--:--"} - {field.closeTime ?? "--:--"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Giá từ</p>
              <p className="text-lg font-bold text-primary">
                {(field.price / 1000).toFixed(0)}K
                <span className="text-xs font-normal text-muted-foreground">/giờ</span>
              </p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Đặt ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
