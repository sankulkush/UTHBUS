import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BusIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ClockIcon,
  UsersIcon,
  StarIcon
} from "lucide-react"

const stats = [
  { value: "50+", label: "Routes Covered" },
  { value: "10K+", label: "Happy Passengers" },
  { value: "99.2%", label: "On-time Rate" },
  { value: "24/7", label: "Support Available" },
]

const values = [
  {
    icon: ShieldCheckIcon,
    title: "Safe & Reliable",
    description: "Every bus and driver on our platform is verified and regularly inspected to ensure your safety.",
  },
  {
    icon: ClockIcon,
    title: "Always On Time",
    description: "We take punctuality seriously. Real-time tracking keeps you informed every step of the journey.",
  },
  {
    icon: UsersIcon,
    title: "Passenger First",
    description: "From easy booking to instant refunds, every decision we make puts passengers at the centre.",
  },
  {
    icon: StarIcon,
    title: "Premium Experience",
    description: "Clean buses, comfortable seats, and polite staff — because travel should be a pleasure.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="bg-card border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <BusIcon className="w-4 h-4" />
            About UthBus
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Connecting cities, <br />
            <span className="text-primary">one journey at a time</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            UthBus is a modern bus booking platform built to make inter-city travel
            simple, affordable, and comfortable for everyone.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              UthBus was founded with a single mission: make bus travel as seamless as
              catching a flight. We noticed that despite buses being the backbone of
              regional transportation, the booking experience was stuck in the past —
              long queues, paper tickets, and uncertainty about seat availability.
            </p>
            <p>
              We built a platform that puts everything in one place: search routes,
              compare operators, pick your seat, and pay — all from your phone in
              under two minutes.
            </p>
            <p>
              Today UthBus serves passengers across dozens of routes, partnering with
              trusted operators who share our commitment to quality and reliability.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <Card key={v.title} className="border-border">
                <CardContent className="p-6 flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <MapPinIcon className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to travel?</h2>
          <p className="text-muted-foreground mb-6">
            Search hundreds of routes and book your seat in seconds.
          </p>
          <Button asChild size="lg">
            <Link href="/">Search Buses</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
