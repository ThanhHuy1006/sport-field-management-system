"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Zap } from "lucide-react"

export function SearchSection() {
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [sport, setSport] = useState("")

  return (
    <section className="bg-gradient-to-b from-background to-muted py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Find Your Perfect Field</h2>
          <p className="text-muted-foreground text-lg">Search and book the best sports facilities in your area</p>
        </div>

        {/* Search Card with prominent styling */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Location Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </label>
              <Input
                placeholder="Enter city or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-12 px-4 bg-muted border-2 border-muted hover:border-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors text-base"
              />
            </div>

            {/* Sport Type Select */}
            <div className="group">
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Sport Type
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full h-12 px-4 bg-muted border-2 border-muted hover:border-primary/50 focus:border-primary rounded-lg text-foreground transition-colors text-base font-medium"
              >
                <option value="">Select sport</option>
                <option value="soccer">Soccer</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="cricket">Cricket</option>
                <option value="badminton">Badminton</option>
              </select>
            </div>

            {/* Date Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-4 bg-muted border-2 border-muted hover:border-primary/50 focus:border-primary text-foreground transition-colors text-base"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-lg transition-all hover:shadow-lg">
                Search Fields
              </Button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {["Soccer near me", "Basketball courts", "Tennis courts", "Badminton halls"].map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-4 py-2 bg-muted hover:bg-primary/10 text-foreground text-sm rounded-full border border-border hover:border-primary transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
