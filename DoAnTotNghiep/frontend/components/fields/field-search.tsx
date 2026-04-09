"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface FieldSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function FieldSearch({
  value,
  onChange,
  placeholder = "Tìm kiếm theo tên sân hoặc địa chỉ...",
  className = "",
}: FieldSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
      />
    </div>
  )
}
