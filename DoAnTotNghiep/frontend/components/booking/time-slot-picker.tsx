"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot: string | null
  onSelect: (time: string) => void
  className?: string
}

export function TimeSlotPicker({ slots, selectedSlot, onSelect, className }: TimeSlotPickerProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {slots.map((slot) => (
        <Button
          key={slot.time}
          variant={selectedSlot === slot.time ? "default" : "outline"}
          size="sm"
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.time)}
          className={cn(
            "text-sm",
            !slot.available && "opacity-50 cursor-not-allowed",
            selectedSlot === slot.time && "bg-primary text-primary-foreground",
          )}
        >
          {slot.time}
        </Button>
      ))}
    </div>
  )
}
