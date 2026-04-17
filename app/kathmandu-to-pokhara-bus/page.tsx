import type { Metadata } from "next"
import Link from "next/link"
import {
  BusIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  StarIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import SearchCTA from "./SearchCTA"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Kathmandu to Pokhara Bus Tickets | Book Online – UthBus",
  description:
    "Book Kathmandu to Pokhara bus tickets online instantly. Compare operators, choose your seat, and travel comfortably along the Prithvi Highway. Daily buses from Rs. 700. Instant e-ticket on UthBus.",
  keywords: [
    "kathmandu to pokhara bus",
    "kathmandu to pokhara bus ticket",
    "kathmandu to pokhara bus booking",
    "bus tickets nepal",
    "online bus booking nepal",
    "prithvi highway bus",
  ],
  openGraph: {
    title: "Kathmandu to Pokhara Bus Tickets – UthBus",
    description:
      "Nepal's most-travelled highway route. Book your seat online in under two minutes.",
    type: "website",
  },
}

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
  { icon: MapPinIcon,    label: "Distance",     value: "~200 km" },
  { icon: ClockIcon,     label: "Travel Time",  value: "6–7 hrs" },
  { icon: BusIcon,       label: "Daily Buses",  value: "40+ departures" },
  { icon: CreditCardIcon,label: "Fare from",    value: "Rs. 700" },
]

const schedule = [
  { time: "6:00 AM", type: "Tourist / Deluxe",   duration: "~6.5 hrs", note: "Most popular morning slot" },
  { time: "7:00 AM", type: "AC Deluxe Express",  duration: "~6 hrs",   note: "Fewer stops, faster arrival" },
  { time: "8:00 AM", type: "Standard",           duration: "~7 hrs",   note: "Budget-friendly option" },
  { time: "10:00 AM",type: "Tourist Coach",      duration: "~6.5 hrs", note: "Panoramic windows, WiFi" },
  { time: "7:00 PM", type: "Night Deluxe",       duration: "~7 hrs",   note: "Arrive early morning Pokhara" },
]

const priceTable = [
  { type: "Standard Bus",   price: "Rs. 700 – 900",    features: "Basic seating, no AC, frequent stops" },
  { type: "Deluxe Bus",     price: "Rs. 900 – 1,200",  features: "Reclining seats, more legroom, fewer stops" },
  { type: "AC Deluxe",      price: "Rs. 1,200 – 1,600",features: "Air conditioning, USB charging ports" },
  { type: "Tourist Coach",  price: "Rs. 1,500 – 2,000",features: "Full AC, panoramic windows, WiFi onboard" },
]

const whyUthbus = [
  {
    icon: ShieldCheckIcon,
    title: "Verified operators only",
    desc: "Every bus company on UthBus is screened, licensed, and reviewed by real passengers who've made the trip.",
  },
  {
    icon: CreditCardIcon,
    title: "Secure online payment",
    desc: "Pay with eSewa, Khalti, or card. Your seat is confirmed instantly — no counter, no cash, no queue.",
  },
  {
    icon: ClockIcon,
    title: "Live seat availability",
    desc: "Real counts, not guesses. What you see is exactly what's left on the bus right now.",
  },
  {
    icon: StarIcon,
    title: "Honest passenger reviews",
    desc: "Ratings come from travellers who actually made this journey. No paid reviews, no inflated scores.",
  },
]

const faqs = [
  {
    q: "How long does the Kathmandu to Pokhara bus journey take?",
    a: "Most buses cover the 200 km route in 6 to 7 hours via the Prithvi Highway. AC Express services with fewer stops often arrive in around 6 hours, while standard buses with more halts typically take 7 to 8 hours. Road conditions and traffic near Kathmandu can affect timings.",
  },
  {
    q: "What is the bus fare from Kathmandu to Pokhara?",
    a: "Standard non-AC buses start from around Rs. 700. Deluxe services range from Rs. 900 to Rs. 1,200, while AC tourist coaches can cost Rs. 1,500 to Rs. 2,000. Fares spike significantly around Dashain, Tihar, and Chhath — book well ahead during festival season.",
  },
  {
    q: "Which is the best bus from Kathmandu to Pokhara?",
    a: "Green Line and Sarathi Tourist are consistently the highest-rated AC Deluxe operators on this route. For comfort on a budget, look for Deluxe services that offer reclining seats without the full tourist-coach price tag.",
  },
  {
    q: "Where do Kathmandu to Pokhara buses depart from?",
    a: "Most local and standard buses depart from Gongabu Bus Park (New Bus Park) or Kalanki. Tourist coaches and AC Deluxe services often have a Thamel pickup point. Always check your ticket for the exact boarding location — they can differ between operators.",
  },
  {
    q: "Can I book a Kathmandu to Pokhara bus ticket online?",
    a: "Yes — that's exactly what UthBus is for. Search available buses, compare operators and prices, pick your seat on a visual seat map, pay online, and receive your e-ticket immediately. No need to visit a counter or call anyone.",
  },
  {
    q: "Is the Prithvi Highway safe for bus travel?",
    a: "The Prithvi Highway is a well-maintained national highway and is generally safe year-round. During the monsoon (June–August), landslides can occasionally close sections of the road and cause delays of a few hours. It's worth checking road conditions if you're travelling during heavy rain.",
  },
  {
    q: "What time should I book to get the best seat?",
    a: "Window seats on the left side of the bus face the Trishuli River and offer the best views. These go quickly. Booking 2–3 days ahead is usually enough outside festival season. During Dashain or Tihar, book at least a week in advance.",
  },
]

const relatedRoutes = [
  { label: "Pokhara to Kathmandu",      href: "/search?from=Pokhara&to=Kathmandu" },
  { label: "Kathmandu to Biratnagar",   href: "/search?from=Kathmandu&to=Biratnagar" },
  { label: "Kathmandu to Dharan",       href: "/kathmandu-to-dharan-bus" },
  { label: "Kathmandu to Itahari",      href: "/kathmandu-to-itahari-bus" },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KathmanduToPokharaPage() {
  return (
    <div className="min-h-screen bg-background pt-16">

      {/* ── Breadcrumb ── */}
      <div className="px-4 py-2.5 border-b border-border/50 bg-background">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Kathmandu to Pokhara Bus</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-card border-b border-border py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <BusIcon className="w-4 h-4" />
            Kathmandu → Pokhara
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Kathmandu to Pokhara
            <br />
            <span className="text-primary">Bus Tickets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Nepal's busiest highway route — 200 km of Trishuli valley scenery connecting
            the capital to the lake city. Book your seat online and skip the counter entirely.
          </p>
          <SearchCTA from="Kathmandu" to="Pokhara" />
        </div>
      </section>

      {/* ── Route stats ── */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Route overview ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-5">About this route</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The Kathmandu–Pokhara corridor is the most-travelled long-distance bus route in Nepal.
              The Prithvi Highway runs 200 km through the Trishuli and Marsyangdi river valleys —
              a genuinely scenic ride through forested gorges and open hillsides that most travellers
              enjoy far more than they expect to.
            </p>
            <p>
              Most people take this route to reach the base for Annapurna and Dhaulagiri trekking,
              Phewa Lake, or onward flights from Pokhara airport to mountain airstrips. Buses range
              from basic local services to comfortable AC tourist coaches with panoramic windows,
              so there's a good option regardless of budget.
            </p>
            <p>
              Departure times are concentrated early morning (6–10 AM) so you arrive in Pokhara
              with most of the day ahead of you. Night services are also available if you prefer
              to travel while you sleep and start exploring the next morning.
            </p>
          </div>
        </div>
      </section>

      {/* ── Schedule ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Typical Schedule</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Representative departure windows — exact times vary by operator and season
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schedule.map((s) => (
              <Card key={s.time} className="border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="shrink-0 min-w-[72px]">
                    <p className="text-sm font-bold text-foreground">{s.time}</p>
                    <p className="text-xs text-muted-foreground">{s.duration}</p>
                  </div>
                  <div className="border-l border-border pl-4">
                    <p className="text-sm font-semibold text-foreground">{s.type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Price table ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CreditCardIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Ticket Prices</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Approximate fares — live prices shown at checkout
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priceTable.map((p) => (
              <Card key={p.type} className="border-border">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-foreground mb-1">{p.type}</p>
                  <p className="text-2xl font-bold text-primary mb-2">{p.price}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.features}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-5 leading-relaxed border-l-2 border-primary/30 pl-3">
            Fares typically rise 30–50% around Dashain, Tihar, and Chhath. If you're travelling
            during a major festival, book at least 5–7 days ahead to secure your seat at the
            standard price.
          </p>
        </div>
      </section>

      {/* ── Why UthBus ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Why book through UthBus?
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            There are plenty of ways to buy a bus ticket in Nepal. Here's what makes UthBus different.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {whyUthbus.map((w) => (
              <Card key={w.title} className="border-border">
                <CardContent className="p-6 flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit shrink-0">
                    <w.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{w.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Frequently asked questions
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Common questions from passengers booking this route.
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-5 data-[state=open]:bg-card"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Related routes ── */}
      <section className="py-10 px-4 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Related routes
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedRoutes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-full px-4 py-1.5 hover:border-primary hover:text-primary transition-colors bg-background"
              >
                {r.label}
                <ArrowRightIcon className="w-3 h-3 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
            <MapPinIcon className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to book your seat?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            Check live availability on the Kathmandu–Pokhara route. Pick your operator,
            choose your seat, and get your e-ticket in under two minutes.
          </p>
          <SearchCTA from="Kathmandu" to="Pokhara" />
          <p className="text-xs text-muted-foreground mt-4">
            No account required to search · Instant confirmation
          </p>
        </div>
      </section>

      {/* ── FAQ Schema JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

    </div>
  )
}
