import type { Metadata } from "next"
import Link from "next/link"
import {
  BusIcon,
  MapPinIcon,
  ClockIcon,
  MoonIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowRightIcon,
  CompassIcon,
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
  title: "Kakarvitta to Kathmandu Bus Tickets | Book Purwa Bus Online | UTHBUS",
  description:
    "Book Kakarvitta to Kathmandu bus tickets online. One of Nepal's longest highway routes — overnight Purwa buses, real-time seat availability, no counter visit required. UTHBUS.",
  keywords: [
    "kakarvitta to kathmandu bus",
    "kakarvitta to kathmandu bus ticket",
    "kakarvitta to kathmandu bus booking",
    "kakarbhitta to kathmandu bus",
    "purwa bus tickets nepal",
    "purwa bus booking",
    "east nepal bus to kathmandu",
    "online bus booking nepal",
  ],
  openGraph: {
    title: "Kakarvitta to Kathmandu Bus Tickets – UTHBUS",
    description:
      "Nepal's far-eastern corridor to the capital. Book your Purwa bus seat online before it fills.",
    type: "website",
  },
}

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
  { icon: MapPinIcon,     label: "Distance",    value: "~680 km" },
  { icon: ClockIcon,      label: "Travel time", value: "14–18 hrs" },
  { icon: MoonIcon,       label: "Departure",   value: "Night bus" },
  { icon: CreditCardIcon, label: "Fare from",   value: "Rs. 1,300" },
]

const busOptions = [
  {
    type: "AC Sleeper",
    price: "Rs. 2,500 – 3,500",
    badge: "Best for 16+ hours",
    desc: "Full reclining berths or wide sleeper seats with AC. If you need to arrive in Kathmandu able to function — for an exam, a job, a first day at work — this is the one worth the extra cost. Availability is limited; book these early.",
  },
  {
    type: "AC Deluxe",
    price: "Rs. 2,000 – 2,800",
    badge: "Most popular",
    desc: "Air-conditioned coach with reclining seats and fewer stops. The most common choice for experienced travelers on this route. Comfortable enough for a full overnight ride at a price most people consider fair.",
  },
  {
    type: "Deluxe (Non-AC)",
    price: "Rs. 1,300 – 1,800",
    badge: null,
    desc: "Reclining seats, no air conditioning. Acceptable when the weather is cool — less so in the pre-monsoon heat of April and May. If you're traveling in summer, spending the extra few hundred rupees on AC is genuinely worth it.",
  },
]

const faqs = [
  {
    q: "How long is the Kakarvitta to Kathmandu bus journey?",
    a: "Between 14 and 18 hours depending on road conditions, traffic near Biratnagar and Itahari junction, and the approach into Kathmandu through Nagdhunga. Under good conditions, 15–16 hours is realistic. During festival season or after monsoon-related road damage, 18 hours or more is possible. Plan around this if you have something fixed the morning you arrive.",
  },
  {
    q: "Are overnight buses available on this route?",
    a: "Yes — and overnight is essentially the standard on this route. Given the 14–18 hour journey, almost all buses depart Kakarvitta in the evening (typically 6 PM to 9 PM) and arrive in Kathmandu the next morning. Morning departures also exist but are less common and arrive late at night, which most passengers find less practical.",
  },
  {
    q: "Why do people call this the Purwa bus?",
    a: "In Nepali, purwa or purba means east. Bus workers and long-distance travelers in Nepal informally call buses going to and from eastern Nepal the Purwa buses. At Gongabu bus park in Kathmandu, if you ask for the Purwa bus, the staff know exactly what you mean — a bus heading toward Jhapa, Morang, or beyond. The name isn't on any ticket, but it's how people from the east have always referred to this corridor.",
  },
  {
    q: "What type of bus is best for Purwa travel?",
    a: "For a journey of 15–16 hours, the minimum you should book is a Deluxe service with reclining seats. A standard fixed-seat bus for that duration is genuinely punishing. If your budget allows, an AC Deluxe or Sleeper service is a better investment — you arrive in Kathmandu able to do something with your day rather than needing to sleep it off.",
  },
  {
    q: "When should I book tickets for this route?",
    a: "Outside festival season, 3–5 days in advance is usually enough. For Chhath, Dashain, and Tihar — which drive some of the heaviest travel in the east — book at least 2 weeks ahead. Sleeper and AC seats go first. Waiting until the week before a major festival means you may only find standard buses or no seats at all.",
  },
  {
    q: "Is this route available every day?",
    a: "Yes, multiple operators run daily services between Kakarvitta and Kathmandu. Frequency is higher around festival periods, though those extra seats fill quickly too. UthBus shows live availability by date, so you can check exactly what's running on any given day.",
  },
]

const whyUthbus = [
  {
    icon: CalendarIcon,
    title: "Lock in your seat early",
    desc: "For a route this long, booking 3–5 days ahead is normal — and necessary around festivals. UthBus lets you do that from your phone without visiting any counter.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Operators with actual reviews",
    desc: "Not every bus company maintains the same standard. On this route especially, passenger comfort and driver reliability vary. UthBus shows ratings from people who've made this specific journey.",
  },
  {
    icon: ClockIcon,
    title: "Live seat counts, not estimates",
    desc: "What you see on the seat map is what's actually left. No calling the counter to double-check, no surprises when you arrive at the bus park.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay once, travel confirmed",
    desc: "eSewa, Khalti, or card. Your e-ticket arrives immediately after payment. Present it at the bus park — no follow-up, no re-confirmation.",
  },
]

const relatedRoutes = [
  { label: "Kathmandu to Kakarvitta",  href: "/search?from=Kathmandu&to=Kakarvitta" },
  { label: "Biratnagar to Kathmandu",  href: "/biratnagar-to-kathmandu-bus" },
  { label: "Kathmandu to Damak",       href: "/kathmandu-to-damak-bus" },
  { label: "Kakarvitta to Pokhara",    href: "/search?from=Kakarvitta&to=Pokhara" },
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

export default function KakarvittaToKathmanduPage() {
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
                <BreadcrumbPage>Kakarvitta to Kathmandu Bus</BreadcrumbPage>
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
            Kakarvitta → Kathmandu
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Kakarvitta to Kathmandu
            <br />
            <span className="text-primary">Bus Tickets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            From Nepal&apos;s eastern border to the capital — one of the country&apos;s
            longest bus routes, traveled every day by students, workers, and families
            heading toward Kathmandu.
          </p>
          <SearchCTA from="Kakarvitta" to="Kathmandu" />
        </div>
      </section>

      {/* ── Stats strip ── */}
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

      {/* ── The Purwa route ── */}
      <section className="py-14 px-4 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-4 mb-7">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <CompassIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Local Knowledge</span>
              <h2 className="text-2xl font-bold text-foreground mt-1">The Purwa route</h2>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Ask any bus worker at Gongabu who handles long-distance eastern routes, and
              they&apos;ll tell you: the buses going toward Jhapa and beyond are the{" "}
              <span className="text-foreground font-medium">Purwa buses</span>. Purwa —
              purba in Nepali — simply means east. But for people from Jhapa, Ilam,
              Panchthar, and Taplejung, it means something more than a direction.
            </p>
            <p>
              When someone from eastern Nepal says they&apos;re taking the Purwa bus to
              Kathmandu, they&apos;re not just naming a route. They&apos;re describing a
              journey that many eastern Nepalis know — sometimes made for the first time,
              often made for the twentieth. The Kakarvitta–Kathmandu corridor is one of
              the oldest of these eastern connections: a 680 km stretch from the border of
              Nepal to the capital, traveled by necessity more often than by choice.
            </p>
            <p>
              The name isn&apos;t official. You won&apos;t find it printed on any ticket.
              But in bus parks across eastern Nepal — and in Gongabu — if you ask about
              the Purwa bus to Kathmandu, everyone knows exactly what you mean.
            </p>
          </div>

          <div className="mt-7 border-l-4 border-primary/40 pl-5 py-1">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              Kakarvitta sits at Nepal&apos;s eastern edge — the last highway town before the
              Indian border at Panitanki. From here to Kathmandu, the bus covers nearly the
              entire width of the country.
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
              You board in the evening, usually after 7 or 8 PM, at Kakarvitta&apos;s bus
              park. The first hours are straightforward — the bus moves through Birtamod
              and Damak, then out toward Biratnagar and Itahari junction. Flat highway,
              the bus making good time, most passengers settling into their seats or
              talking quietly.
            </p>
            <p>
              Somewhere past midnight the road begins to change. The terai plains give way
              to hills, the temperature drops noticeably, and the pace slows through the
              curves. This is when the passengers who&apos;ve done this before pull out their
              jackets. Experienced Purwa travelers bring one regardless of the season —
              the temperature difference between the terai at night and the hills before
              dawn is real.
            </p>
            <p>
              Arrival in Kathmandu depends on traffic at Nagdhunga, where the highway
              meets the valley. Under normal conditions you&apos;re at Gongabu bus park
              between 9 AM and 11 AM. During Chhath week, or when the highway is affected
              by monsoon diversions, the same journey can push to noon or beyond. Build
              in time if you have something fixed that morning.
            </p>
            <p>
              One thing regulars on this route will tell you: the choice of seat matters
              more at 680 km than it does at 200. People who make this trip often bring a
              travel pillow, avoid the last two rows where the ride is roughest, and pay
              the extra cost for a reclining seat rather than spending 16 hours upright.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bus options ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <BusIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bus comfort on a long haul</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                At 16 hours, bus type is a real decision — not just a price difference
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {busOptions.map((b) => (
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
          <p className="text-xs text-muted-foreground mt-5 leading-relaxed border-l-2 border-primary/30 pl-3">
            Standard fixed-seat buses are available at lower fares, but are not recommended
            for a journey of this length. The difference in arrival condition is noticeable.
          </p>
        </div>
      </section>

      {/* ── Fares & schedule ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Fares & when buses leave</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Evening departures, early morning arrivals — this is how the route runs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Typical departure window
                </p>
                <div className="space-y-3">
                  {[
                    { time: "6:00 PM", note: "Early evening — first slot, fills fastest" },
                    { time: "7:00 PM", note: "Most popular departure" },
                    { time: "8:00 PM", note: "Peak Purwa slot" },
                    { time: "9:00 PM", note: "Latest common evening bus" },
                  ].map((d) => (
                    <div key={d.time} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{d.time}</span>
                      <span className="text-xs text-muted-foreground">{d.note}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
                  Morning departures (7–9 AM) also exist and arrive in Kathmandu late at
                  night — significantly less popular on this route.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Fare overview
                </p>
                <div className="space-y-3">
                  {[
                    { type: "Deluxe (Non-AC)", range: "Rs. 1,300 – 1,800" },
                    { type: "AC Deluxe",       range: "Rs. 2,000 – 2,800" },
                    { type: "AC Sleeper",      range: "Rs. 2,500 – 3,500" },
                  ].map((f) => (
                    <div key={f.type} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{f.type}</span>
                      <span className="text-sm font-semibold text-foreground">{f.range}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
                  Chhath is the peak season for this route. Fares rise 40–60% in the two
                  weeks surrounding it — and seats, especially sleeper, sell out well in
                  advance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Why plan with UthBus ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Why plan with UthBus?
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Long-distance travel has less room for error. These are the things UthBus
            actually does that matter on a route like this.
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
            Questions specific to the Kakarvitta–Kathmandu route.
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
            <CompassIcon className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Heading to Kathmandu from the east?
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            Check what&apos;s running tonight from Kakarvitta. See available buses,
            compare operators, pick your seat on a live map, and get your e-ticket
            in minutes — no counter visit, no calls.
          </p>
          <SearchCTA from="Kakarvitta" to="Kathmandu" />
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
