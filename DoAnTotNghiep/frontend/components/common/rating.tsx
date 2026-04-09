import { Star } from "lucide-react"

interface RatingProps {
  value: number
  reviews?: number
  size?: "sm" | "md" | "lg"
  showReviews?: boolean
}

export function Rating({ value, reviews, size = "md", showReviews = true }: RatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className="flex items-center gap-1">
      <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      <span className={`font-semibold text-foreground ${textSizeClasses[size]}`}>{value}</span>
      {showReviews && reviews !== undefined && (
        <span className={`text-muted-foreground ${textSizeClasses[size]}`}>({reviews} đánh giá)</span>
      )}
    </div>
  )
}
