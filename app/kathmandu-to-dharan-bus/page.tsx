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
  MoonIcon,
  GraduationCapIcon,
  UsersIcon,
  Building2Icon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
  title: "Kathmandu to Dharan Bus Tickets | Book Online | UTHBUS",
  description:
    "Book Kathmandu to Dharan bus tickets online. Daily overnight buses, real-time seat availability, e-ticket on booking. Compare operators and fares — no counter visit needed. UTHBUS.",
  keywords: [
    "kathmandu to dharan bus",
    "kathmandu to dharan bus ticket",
    "kathmandu to dharan bus booking",
    "dharan bus ticket nepal",
    "sunsari bus booking",
    "east nepal bus booking",
    "online bus booking nepal",
  ],
  openGraph: {
    title: "Kathmandu to Dharan Bus Tickets – UTHBUS",
    description:
      "Overnight buses from Kathmandu to Dharan. Book your seat online, instant e-ticket.",
    type: "website",
  },
}

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
  { icon: MapPinIcon,     label: "Distance",    value: "~510 km" },
  { icon: ClockIcon,      label: "Travel time", value: "11–13 hrs" },
  { icon: MoonIcon,       label: "Departure",   value: "Night preferred" },
  { icon: CreditCardIcon, label: "Fare from",   value: "Rs. 950" },
]

const whyDharan = [
  {
    icon: GraduationCapIcon,
    title: "A medical and university hub",
    desc: "BPKIHS — B.P. Koirala Institute of Health Sciences — draws students and medical professionals from across Nepal. A significant portion of passengers on this route are heading there or returning from it.",
  },
  {
    icon: UsersIcon,
    title: "Regular family travel",
    desc: "Dharan has a large diaspora in Kathmandu — families with roots in Sunsari, Dhankuta, and surrounding hill districts who travel back regularly, especially around festivals.",
  },
  {
    icon: Building2Icon,
    title: "Gateway to the eastern hills",
    desc: "For people heading to Dhankuta, Hile, Basantapur, or Taplejung, Dharan is often the last stop before the hills begin. Many buses to those districts depart from Dharan's bus park.",
  },
]

const busTypes = [
  {
    type: "Deluxe Bus",
    price: "Rs. 1,400 – 1,900",
    badge: "Most popular",
    desc: "Reclining seats, fewer stops, reasonable legroom. The standard choice for most passengers on this route. Good balance of cost and comfort for an 11–13 hour journey.",
  },
  {
    type: "AC Deluxe",
    price: "Rs. 1,900 – 2,600",
    badge: "Recommended overnight",
    desc: "Air conditioning, wider seats, USB ports on many services. If you're traveling overnight and need to function well when you arrive, AC Deluxe is worth the extra cost.",
  },
  {
    type: "Standard Bus",
    price: "Rs. 950 – 1,300",
    badge: null,
    desc: "Fixed seats, lower price. An acceptable option for short hops but genuinely uncomfortable for 12+ hours. Reserve this for tight budgets only — a few hundred rupees more makes a meaningful difference.",
  },
]

const faqs = [
  {
    q: "How long does it take to reach Dharan from Kathmandu by bus?",
    a: "Most buses arrive in 11 to 13 hours. The BP Highway through Sindhuli is the typical route — once you drop into the terai and reach Sunsari, the bus continues past Itahari junction and then climbs slightly into Dharan. Traffic near Itahari and the Nagdhunga exit from Kathmandu are the two most common points of delay.",
  },
  {
    q: "Are there direct buses from Kathmandu to Dharan?",
    a: "Yes — multiple operators run direct services from Kathmandu's Gongabu bus park to Dharan without requiring a change at Itahari. When booking, confirm that the bus terminates in Dharan rather than Biratnagar or Itahari.",
  },
  {
    q: "What time do buses to Dharan depart from Kathmandu?",
    a: "Most buses leave in the evening between 7 and 9 PM, arriving in Dharan early the next morning. Some morning departures (6–8 AM) also run and arrive in Dharan by evening. Evening buses are more popular because you travel while you sleep and arrive at a practical hour.",
  },
  {
    q: "What is the bus fare from Kathmandu to Dharan?",
    a: "Standard buses start around Rs. 950 to 1,300. Deluxe services run Rs. 1,400 to 1,900. AC Deluxe is typically Rs. 1,900 to 2,600. Fares increase sharply around Chhath, Dashain, and Tihar — book early if you're traveling near those dates.",
  },
  {
    q: "Which bus type is best for the Kathmandu to Dharan journey?",
    a: "At 11 to 13 hours, a Deluxe service with reclining seats is the minimum worth booking. AC Deluxe is better if you're traveling overnight, if the weather is warm, or if you need to be in reasonable condition on arrival. Standard fixed-seat buses work for the price but aren't comfortable for a journey this length.",
  },
  {
    q: "Is online booking reliable for this route?",
    a: "Yes. UthBus shows real-time seat availability for Kathmandu–Dharan operators. You pay online, receive an e-ticket immediately, and present it at the bus park. There's no need to re-confirm or visit a counter. The booking works the same way for every operator listed on the platform.",
  },
]

const relatedRoutes = [
  { label: "Kathmandu to Itahari",      href: "/kathmandu-to-itahari-bus" },
  { label: "Biratnagar to Kathmandu",   href: "/biratnagar-to-kathmandu-bus" },
  { label: "Dharan to Kathmandu",       href: "/search?from=Dharan&to=Kathmandu" },
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

export default function KathmanduToDharanPage() {
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
                <BreadcrumbPage>Kathmandu to Dharan Bus</BreadcrumbPage>
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
            Kathmandu → Dharan
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Kathmandu to Dharan
            <br />
            <span className="text-primary">Bus Tickets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Dharan is a city with its own pace — foothills, a major hospital university,
            and a steady flow of people traveling between it and Kathmandu every day.
          </p>
          <SearchCTA from="Kathmandu" to="Dharan" />
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

      {/* ── Why this route matters ── */}
      <section className="py-14 px-4 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">Who travels this route</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Unlike pure transit routes, Kathmandu–Dharan has a specific passenger character.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {whyDharan.map((w) => (
              <Card key={w.title} className="border-border">
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg w-fit">
                    <w.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── What the journey is like ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-5">What the journey is like</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Buses to Dharan leave Kathmandu&apos;s Gongabu area in the evening, typically
              between 7 and 9 PM. The road follows the BP Highway through Sindhuli —
              a stretch that alternates between quiet hill sections and flatter terai
              highway as you descend toward Sunsari. Most of the distance gets covered
              through the night.
            </p>
            <p>
              Dharan doesn&apos;t sit on the flat terai floor like Biratnagar or Itahari.
              It rises into the Siwalik hills — the final approach from Itahari junction
              is a steady 15 km climb before you level out in the city. The elevation
              is modest by Nepal standards, but it&apos;s enough to notice: Dharan is
              consistently cooler than the terai, and in winter months the mornings
              can be cold. Pack something warm if you&apos;re arriving between November
              and February.
            </p>
            <p>
              Under normal road conditions you&apos;re in Dharan between 7 and 10 AM.
              Festival weeks — Chhath especially — add time near Itahari junction
              and at the highway&apos;s busiest points. If you have something fixed
              on arrival morning, account for the possibility of a later arrival.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bus types ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <BusIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bus types and comfort</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Twelve hours is long enough that the seat you pick matters
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

      {/* ── Fares & schedule (combined) ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Fares and schedule</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Evening buses dominate — plan around an early morning arrival
              </p>
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    Typical departures from Kathmandu
                  </p>
                  <div className="space-y-3">
                    {[
                      { time: "6:00 – 8:00 AM", note: "Daytime travel, arrives by evening" },
                      { time: "7:00 – 9:00 PM", note: "Most popular — overnight journey" },
                      { time: "10 PM – 12 AM",  note: "Late night, arrives early morning" },
                    ].map((d) => (
                      <div key={d.time} className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground shrink-0">{d.time}</span>
                        <span className="text-xs text-muted-foreground text-right">{d.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sm:border-l sm:border-border sm:pl-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    Fare overview
                  </p>
                  <div className="space-y-3">
                    {[
                      { type: "Standard Bus",  range: "Rs. 950 – 1,300" },
                      { type: "Deluxe Bus",    range: "Rs. 1,400 – 1,900" },
                      { type: "AC Deluxe",     range: "Rs. 1,900 – 2,600" },
                    ].map((f) => (
                      <div key={f.type} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{f.type}</span>
                        <span className="text-sm font-semibold text-foreground">{f.range}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Chhath season brings the sharpest fare increase on this route.
                    Book 10–14 days ahead for good options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Booking with UthBus (2 wide cards) ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Planning your trip with UthBus
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Two things that make a difference on a route where planning matters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Book before the bus fills
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kathmandu–Dharan is a well-traveled route and decent seats — Deluxe
                  and AC Deluxe — go first. UthBus shows real-time availability so you
                  can book 3 to 7 days ahead without visiting a counter. Around Chhath
                  and Dashain, two weeks ahead is the safer call. Once those seats are
                  gone, you&apos;re left with whatever remains.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <ShieldCheckIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Know your operator before you board
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Not all operators on this route are equivalent in reliability and
                  comfort. UthBus lists ratings from passengers who have actually
                  completed the Kathmandu–Dharan journey — not aggregate scores from
                  other routes. Use them. The difference between a well-maintained
                  Deluxe bus and a poorly maintained one on a 12-hour overnight
                  journey is not small.
                </p>
              </CardContent>
            </Card>
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
            Route-specific questions about traveling from Kathmandu to Dharan.
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
            <Building2Icon className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Traveling to Dharan?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            Check which buses are running on your date. Compare operators, pick a seat
            on a live map, and get your e-ticket in minutes — before the good seats go.
          </p>
          <SearchCTA from="Kathmandu" to="Dharan" />
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
