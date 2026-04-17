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
  title: "Kathmandu to Itahari Bus Tickets | Book Online | UTHBUS",
  description:
    "Book Kathmandu to Itahari bus tickets online. Morning and evening departures daily, real-time seat availability, no counter visit required. Compare operators and fares on UTHBUS.",
  keywords: [
    "kathmandu to itahari bus",
    "kathmandu to itahari bus ticket",
    "kathmandu to itahari bus booking",
    "itahari bus ticket nepal",
    "east nepal bus booking",
    "online bus booking nepal",
    "kathmandu east nepal bus",
  ],
  openGraph: {
    title: "Kathmandu to Itahari Bus Tickets – UTHBUS",
    description:
      "Daily buses from Kathmandu to Itahari. Book your seat online without visiting a counter.",
    type: "website",
  },
}

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
  { icon: MapPinIcon,     label: "Distance",    value: "~480 km" },
  { icon: ClockIcon,      label: "Travel time", value: "10–12 hrs" },
  { icon: SunIcon,        label: "Departure",   value: "Day or Night" },
  { icon: CreditCardIcon, label: "Fare from",   value: "Rs. 900" },
]

const schedule = [
  {
    window: "6:00 – 8:00 AM",
    label:  "Morning departure",
    note:   "Arrive in Itahari by evening",
  },
  {
    window: "7:00 – 9:00 PM",
    label:  "Evening departure",
    note:   "Most popular — arrive next morning",
  },
  {
    window: "10 PM – 12 AM",
    label:  "Late night option",
    note:   "Fewer buses, quieter highway",
  },
]

const fares = [
  { type: "Standard Bus",  range: "Rs. 900 – 1,200",  note: "Fixed seats, frequent stops" },
  { type: "Deluxe Bus",    range: "Rs. 1,300 – 1,700", note: "Reclining seats, fewer halts" },
  { type: "AC Deluxe",     range: "Rs. 1,700 – 2,300", note: "Air conditioning, USB ports" },
]

const whyUthbus = [
  {
    icon: CalendarIcon,
    title: "Know what's running before you leave",
    desc: "Check live availability for Kathmandu–Itahari buses by date without calling anyone. No guessing, no counter visit.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Operators rated by real passengers",
    desc: "Multiple companies run this route with varying levels of service. Reviews on UthBus come from people who've made the actual journey.",
  },
  {
    icon: ClockIcon,
    title: "What you see is what's available",
    desc: "The seat count on the map reflects actual availability right now — not an estimate someone gave over the phone.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay once, confirmed immediately",
    desc: "eSewa, Khalti, or card. Your e-ticket arrives the moment payment clears. Nothing else required at the bus park.",
  },
]

const faqs = [
  {
    q: "How long is the Kathmandu to Itahari bus journey?",
    a: "Most buses take 10 to 12 hours. The route typically follows the BP Highway through Sindhuli, which is reasonably well-maintained. Morning departures in clear conditions often arrive closer to 10 hours. Traffic near Itahari junction or road work near Sindhuli can push it to 12 hours or beyond.",
  },
  {
    q: "What time do buses from Kathmandu to Itahari depart?",
    a: "Buses depart across three windows: morning (6–8 AM), arriving before dark; evening (7–9 PM), the most common choice; and late night (10 PM–midnight) for passengers who prefer quieter highway travel. UthBus shows exact departure times by operator and date.",
  },
  {
    q: "Can I connect to Biratnagar or Dharan after arriving in Itahari?",
    a: "Yes. Itahari is a junction town — local buses, tempos, and shared taxis run to Biratnagar (roughly 20 km east) and Dharan (roughly 15 km north) throughout the day. If you're heading there, Itahari is a practical first stop, though direct buses from Kathmandu to both cities are also available.",
  },
  {
    q: "What is the fare from Kathmandu to Itahari?",
    a: "Standard buses start around Rs. 900. Deluxe services typically run Rs. 1,300 to 1,700. AC Deluxe buses are Rs. 1,700 to 2,300. Prices rise during Dashain, Tihar, and Chhath. If you're traveling around a major festival, book at least a week in advance.",
  },
  {
    q: "Which bus type should I book for this route?",
    a: "For a 10 to 12 hour journey, a Deluxe service with reclining seats is the sensible minimum. Standard fixed-seat buses are available at lower cost but become tiring over this distance. If you're traveling overnight, AC Deluxe is worth the extra few hundred rupees.",
  },
]

const relatedRoutes = [
  { label: "Kathmandu to Dharan",     href: "/kathmandu-to-dharan-bus" },
  { label: "Kathmandu to Biratnagar", href: "/search?from=Kathmandu&to=Biratnagar" },
  { label: "Kathmandu to Pokhara",    href: "/kathmandu-to-pokhara-bus" },
  { label: "Itahari to Kathmandu",    href: "/search?from=Itahari&to=Kathmandu" },
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

export default function KathmanduToItahariPage() {
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
                <BreadcrumbPage>Kathmandu to Itahari Bus</BreadcrumbPage>
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
            Kathmandu → Itahari
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Kathmandu to Itahari
            <br />
            <span className="text-primary">Bus Tickets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Itahari is where eastern Nepal&apos;s roads converge — a busy junction town
            about 480 km from Kathmandu, served by daily buses in both directions.
          </p>
          <SearchCTA from="Kathmandu" to="Itahari" />
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

      {/* ── About Itahari and this route ── */}
      <section className="py-14 px-4 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-5">About Itahari and this route</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              If you&apos;ve traveled around eastern Nepal, you know Itahari — you&apos;ve
              changed buses there, waited at the junction while someone sorted out a
              connection, or passed through on the way to Biratnagar, Dharan, or Dhankuta.
              It sits where roads divide: east toward Biratnagar and Jhapa, north toward
              Dharan and the hills, south toward the terai. As a destination it&apos;s a
              working commercial city. As a transit point, it&apos;s unavoidable in eastern
              Nepal.
            </p>
            <p>
              Buses between Kathmandu and Itahari run daily, serving the full range of
              east–west travelers. Students heading home after exams, families relocating,
              traders moving between the capital and Sunsari — this corridor handles all of
              it. The route is practical and high-volume, not a tourist corridor.
            </p>
            <p>
              The road from Kathmandu runs roughly 480 km, typically via the BP Highway
              through Sindhuli before dropping into the terai. Most operators arrive
              directly at Itahari&apos;s main bus park, from where the rest of eastern
              Nepal is easy to reach.
            </p>
          </div>
        </div>
      </section>

      {/* ── What the journey is like ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-5">What the journey is like</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A morning departure from Kathmandu gets you to Itahari before dark — 10 to
              12 hours of road, most of it moving at a decent pace once you clear the
              city traffic. The BP Highway through Sindhuli is the most common route:
              uphill out of Kathmandu, a long descent toward the terai, then a flat final
              stretch through Sunsari.
            </p>
            <p>
              Evening buses are the more popular choice. You board around 7 or 8 PM, cover
              most of the distance at night when the highway is quieter, and arrive in
              Itahari in the early morning hours. For most passengers, this is the more
              practical option — you don&apos;t lose a day of travel time and you arrive
              at a useful hour.
            </p>
            <p>
              Bring snacks and water. Deluxe services on this route stop infrequently, and
              the halts that exist are short. If you&apos;re on a standard bus, there are
              more stops, but the food options at highway stalls are variable.
            </p>
          </div>
        </div>
      </section>

      {/* ── When buses leave ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">When buses leave</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Three main departure windows — pick what works for your schedule
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
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
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Exact times vary by operator. Check current departures on UthBus for your travel date.
          </p>
        </div>
      </section>

      {/* ── Ticket fares ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CreditCardIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Ticket fares</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Approximate ranges — live prices shown at checkout
              </p>
            </div>
          </div>

          <Card className="border-border max-w-xl">
            <CardContent className="p-0">
              {fares.map((f, i) => (
                <div
                  key={f.type}
                  className={`flex items-center justify-between px-6 py-5 ${
                    i < fares.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.note}</p>
                  </div>
                  <p className="text-sm font-bold text-primary whitespace-nowrap ml-4">{f.range}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground mt-5 leading-relaxed border-l-2 border-primary/30 pl-3">
            Festival season — Dashain, Tihar, Chhath — pushes fares up noticeably and fills buses
            fast. If you&apos;re traveling around any of these dates, book at least a week ahead.
          </p>
        </div>
      </section>

      {/* ── Why book with UthBus ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Why book with UthBus?
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            A high-volume route like Kathmandu–Itahari has plenty of operators. Here&apos;s
            what makes it worth booking through UthBus rather than just showing up.
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
            Common questions about the Kathmandu–Itahari bus route.
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
            Heading to Itahari?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            Check what&apos;s running today from Kathmandu. Pick your departure window,
            choose your operator, and confirm your seat in minutes — no counter, no calls.
          </p>
          <SearchCTA from="Kathmandu" to="Itahari" />
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
