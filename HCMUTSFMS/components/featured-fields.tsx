import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fields = [
  {
    id: 1,
    name: "Central Soccer Complex",
    sport: "Soccer",
    location: "Downtown",
    price: "$45/hour",
    rating: 4.8,
    image: "/soccer-field-green-grass.png",
    availability: "Available Today",
  },
  {
    id: 2,
    name: "Urban Basketball Court",
    sport: "Basketball",
    location: "Midtown",
    price: "$35/hour",
    rating: 4.6,
    image: "/indoor-basketball-court.png",
    availability: "Available Today",
  },
  {
    id: 3,
    name: "Tennis Paradise",
    sport: "Tennis",
    location: "Westside",
    price: "$50/hour",
    rating: 4.9,
    image: "/professional-tennis-court.jpg",
    availability: "Available Tomorrow",
  },
  {
    id: 4,
    name: "Cricket Ground Elite",
    sport: "Cricket",
    location: "Eastside",
    price: "$60/hour",
    rating: 4.7,
    image: "/cricket-field-with-pitch.jpg",
    availability: "Available Today",
  },
]

export function FeaturedFields() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Fields</h2>
          <p className="text-muted-foreground text-lg">Popular sports fields available for booking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.map((field) => (
            <Card key={field.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={field.image || "/placeholder.svg"}
                  alt={field.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {field.availability}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{field.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {field.sport} • {field.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-primary">{field.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-foreground">{field.rating}</span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Book Now</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
