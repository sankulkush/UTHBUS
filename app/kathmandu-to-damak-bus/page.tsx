import type { Metadata } from "next"
import Link from "next/link"
import {
  BusIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowRightIcon,
  SunIcon,
  LeafIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import SearchCTA from "./SearchCTA"

export const metadata: Metadata = {
  title: "Kathmandu to Damak Bus Tickets | Book Online | UTHBUS",
  description:
    "Book Kathmandu to Damak bus tickets online. Daily buses to Jhapa's green city — real-time seat availability, no counter visit needed. Compare operators and fares on UTHBUS.",
  keywords: [
    "kathmandu to damak bus",
    "kathmandu to damak bus ticket",
    "kathmandu to damak bus booking",
    "damak bus ticket nepal",
    "jhapa bus booking",
    "east nepal bus booking",
    "online bus booking nepal",
  ],
  openGraph: {
    title: "Kathmandu to Damak Bus Tickets – UTHBUS",
    description:
      "Daily buses from Kathmandu to Damak, Jhapa. Book your seat online without visiting a counter.",
    type: "website",
  },
}

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
  { icon: MapPinIcon,     label: "Distance",    value: "~420 km" },
  { icon: ClockIcon,      label: "Travel time", value: "9–12 hrs" },
  { icon: SunIcon,        label: "Departure",   value: "Day or Night" },
  { icon: CreditCardIcon, label: "Fare from",   value: "Rs. 1,100" },
]

const busTypes = [
  {
    type: "Standard Bus",
    price: "Rs. 1,100 – 1,400",
    badge: null,
    desc: "Fixed seats, multiple stops, lowest price. Works if you're comfortable for 10+ hours. The cost difference over Deluxe is small enough that most passengers skip this.",
  },
  {
    type: "Deluxe Bus",
    price: "Rs. 1,400 – 1,800",
    badge: "Most popular",
    desc: "Reclining seats, fewer halts. The most common choice on this route — good comfort for the journey length without paying for full AC.",
  },
  {
    type: "AC Deluxe",
    price: "Rs. 1,800 – 2,400",
    badge: "Best in summer",
    desc: "Air conditioning matters on the Jhapa terai, where summer temperatures are high. In April–June, AC Deluxe is a genuine quality-of-life upgrade for this route.",
  },
]

const schedule = [
  { window: "6:00 – 8:00 AM",  label: "Morning departure",  note: "Arrive in Damak before dark" },
  { window: "7:00 – 9:00 PM",  label: "Evening departure",  note: "Overnight — arrives next morning" },
  { window: "10 PM – 12 AM",   label: "Late night option",  note: "Fewer buses, quieter highway" },
]

const whyUthbus = [
  {
    icon: CalendarIcon,
    title: "Book from anywhere in advance",
    desc: "No need to visit Gongabu or call the operator. Lock in your seat online 3–7 days ahead and travel on your schedule.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Real reviews from Jhapa route passengers",
    desc: "Multiple operators serve Kathmandu–Damak with varying quality. Ratings on UthBus come from people who've actually made this specific journey.",
  },
  {
    icon: ClockIcon,
    title: "Live seat availability",
    desc: "The count you see is current — not a guess. Book with confidence knowing exactly what's available on your date.",
  },
  {
    icon: CreditCardIcon,
    title: "Instant e-ticket, no follow-up",
    desc: "Pay with eSewa, Khalti, or card. Your ticket is confirmed immediately. Present it at the bus park — nothing else needed.",
  },
]

const faqs = [
  {
    q: "How long does the Kathmandu to Damak bus journey take?",
    a: "Most buses take 9 to 12 hours depending on the route, operator, and road conditions. Morning departures in good conditions can arrive in under 10 hours. Evening buses traveling overnight take similar time but arrive at a more practical hour for most passengers.",
  },
  {
    q: "What time do buses from Kathmandu to Damak depart?",
    a: "Buses leave in two main windows: morning (6–8 AM), arriving in Damak before evening; and evening (7–9 PM), traveling overnight and arriving the next morning. Late-night departures also exist on some operators. Check UthBus for exact times by date.",
  },
  {
    q: "What is Damak and why do people travel there?",
    a: "Damak is a municipality in Jhapa district, eastern Nepal — sometimes called the Green City for its tea gardens and open spaces. It connects Kathmandu residents with family in Jhapa, and is a common stop for travelers heading further east toward Birtamod or Kakarvitta. The Jhapa region is one of the most agriculturally productive in Nepal.",
  },
  {
    q: "What is the bus fare from Kathmandu to Damak?",
    a: "Standard buses start around Rs. 1,100. Deluxe services range from Rs. 1,400 to 1,800. AC Deluxe typically costs Rs. 1,800 to 2,400. Fares rise during Chhath, Dashain, and Tihar — sometimes by 30 to 50%. Book ahead during those periods.",
  },
  {
    q: "Which bus type should I book for Kathmandu to Damak?",
    a: "For a 9 to 12 hour trip, Deluxe with reclining seats is the right default. In summer months (April–June), AC Deluxe is worth the extra cost — Jhapa's climate is warm and the temperature in the bus matters for that length of journey.",
  },
  {
    q: "Can I connect to Biratnagar or Kakarvitta from Damak?",
    a: "Yes. Damak is well-connected to Biratnagar (roughly 50 km east) and Birtamod, which connects onward to Kakarvitta. Local buses, tempos, and shared vehicles run regularly between these towns. If you're heading to the Jhapa border area, Damak is a practical intermediate stop.",
  },
]

const relatedRoutes = [
  { label: "Kathmandu to Itahari",      href: "/kathmandu-to-itahari-bus" },
  { label: "Kathmandu to Dharan",       href: "/kathmandu-to-dharan-bus" },
  { label: "Kakarvitta to Kathmandu",   href: "/kakarvitta-to-kathmandu-bus" },
  { label: "Kathmandu to Biratnagar",   href: "/search?from=Kathmandu&to=Biratnagar" },
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

export default function KathmanduToDamakPage() {
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
                <BreadcrumbPage>Kathmandu to Damak Bus</BreadcrumbPage>
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
            Kathmandu → Damak
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Kathmandu to Damak
            <br />
            <span className="text-primary">Bus Tickets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Damak sits in Jhapa district&apos;s tea garden belt — about 420 km from
            Kathmandu, connected by daily buses serving families, students, and travelers
            heading into far-eastern Nepal.
          </p>
          <SearchCTA from="Kathmandu" to="Damak" />
        </div>
      </section>

      {/* ── Stats ── */}
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

      {/* ── About this route ── */}
      <section className="py-14 px-4 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-4 mb-7">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <LeafIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Jhapa District</span>
              <h2 className="text-2xl font-bold text-foreground mt-1">About Damak and this route</h2>
            </div>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Damak is a growing municipality in Jhapa, Nepal&apos;s easternmost hilly-terai
              district. The area is known for tea estates, a cooler microclimate compared
              to the flat terai further south, and a community that has grown significantly
              over the past two decades. Many passengers on this route are families with
              roots in Jhapa returning from Kathmandu, or young people heading home after
              studies in the capital.
            </p>
            <p>
              The journey from Kathmandu covers roughly 420 km, typically via the BP
              Highway through Sindhuli and then east along the Mahendra Highway through
              Sunsari and into Jhapa. Unlike some eastern routes that are primarily
              overnight-only, Kathmandu–Damak has enough flexibility that both morning
              and evening departures work for different passenger needs.
            </p>
            <p>
              Damak is also a practical stop for travelers continuing toward Birtamod
              or Kakarvitta — local connections to those towns run throughout the day
              from Damak&apos;s bus park.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bus types ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <BusIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bus options</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Jhapa&apos;s terai climate makes AC worth considering more than on hill routes
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {busTypes.map((b) => (
              <Card key={b.type} className="border-border relative">
                {b.badge && (
                  <div className="absolute -top-3 left-5">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {b.badge}
                    </span>
                  </div>
                )}
                <CardContent className="p-5 pt-6">
                  <p className="text-sm font-semibold text-foreground mb-1">{b.type}</p>
                  <p className="text-2xl font-bold text-primary mb-3">{b.price}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
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
              <h2 className="text-2xl font-bold text-foreground">Departure windows</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Both morning and evening buses run on this route
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden mb-5">
            {schedule.map((s, i) => (
              <div
                key={s.window}
                className={`flex items-center justify-between px-6 py-5 bg-card ${
                  i < schedule.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{s.window}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
                <p className="text-xs text-muted-foreground text-right max-w-[180px]">{s.note}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
            Chhath, Dashain, and Tihar push fares up 30–50% on Jhapa routes. Seats —
            especially Deluxe and AC — fill fast. Book at least a week ahead during
            festival weeks.
          </p>
        </div>
      </section>

      {/* ── Why UthBus ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Why book with UthBus?
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            What makes it worth booking online instead of heading to the bus park.
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
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Frequently asked questions
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Common questions about the Kathmandu–Damak bus route.
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
            <LeafIcon className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Heading to Jhapa?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            Check available buses from Kathmandu to Damak. Compare operators,
            pick your seat, and confirm your ticket in minutes — no counter needed.
          </p>
          <SearchCTA from="Kathmandu" to="Damak" />
          <p className="text-xs text-muted-foreground mt-4">
            No account required to search · Instant e-ticket on booking
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
