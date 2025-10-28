import { Card } from "@/components/ui/card"

const features = [
  {
    icon: "⚡",
    title: "Instant Booking",
    description: "Reserve your field in seconds with our simple booking process",
  },
  {
    icon: "💰",
    title: "Best Prices",
    description: "Compare prices from multiple venues and get the best deals",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    description: "Safe and secure payment options for peace of mind",
  },
  {
    icon: "📱",
    title: "Easy Management",
    description: "Manage your bookings anytime, anywhere from your phone",
  },
]

export function Features() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why Choose FieldBook?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We make it easy to find, book, and manage your sports field reservations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
