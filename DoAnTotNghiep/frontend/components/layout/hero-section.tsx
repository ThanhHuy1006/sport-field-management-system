import type React from "react"
interface HeroSectionProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  children?: React.ReactNode
  className?: string
}

export function HeroSection({ title, subtitle, backgroundImage, children, className = "" }: HeroSectionProps) {
  return (
    <section className={`relative min-h-[300px] flex items-center overflow-hidden ${className}`}>
      {/* Background image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background/90" />

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{title}</h1>
        {subtitle && <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
