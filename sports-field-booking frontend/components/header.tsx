import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">⚽</span>
          </div>
          <span className="text-xl font-bold text-foreground">FieldBook</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-foreground hover:text-primary transition">
            Browse Fields
          </a>
          <a href="#" className="text-foreground hover:text-primary transition">
            How it Works
          </a>
          <a href="#" className="text-foreground hover:text-primary transition">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost">Sign In</Button>
          <Button className="bg-primary hover:bg-primary/90">Book Now</Button>
        </div>
      </div>
    </header>
  )
}
