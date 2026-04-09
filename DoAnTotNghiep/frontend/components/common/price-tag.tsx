interface PriceTagProps {
  price: number
  unit?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PriceTag({ price, unit = "/giờ", size = "md", className = "" }: PriceTagProps) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  }

  const unitSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={className}>
      <span className={`font-bold text-primary ${sizeClasses[size]}`}>{(price / 1000).toFixed(0)}K</span>
      <span className={`text-muted-foreground ${unitSizeClasses[size]}`}>{unit}</span>
    </div>
  )
}
