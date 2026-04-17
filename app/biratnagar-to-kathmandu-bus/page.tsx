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
  UsersIcon,
  BriefcaseIcon,
  HeartIcon,
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
  title: "Biratnagar to Kathmandu Bus Tickets | Book Online in Nepal | UTHBUS",
  description:
    "Book Biratnagar to Kathmandu bus tickets online. Evening departures, overnight journey, real-time seat availability. Compare operators and fares — no counter visit required. UTHBUS.",
  keywords: [
    "biratnagar to kathmandu bus",
    "biratnagar to kathmandu bus ticket",
    "biratnagar to kathmandu bus booking",
    "biratnagar kathmandu overnight bus",
    "east nepal bus to kathmandu",
    "online bus booking nepal",
    "province 1 to kathmandu bus",
  ],
  openGraph: {
    title: "Biratnagar to Kathmandu Bus Tickets – UTHBUS",
    description:
      "Evening departures, 12–16 hour overnight journey. Secure your seat before it's gone.",
    type: "website",
  },
}

// ── Static data ───────────────────────────────────────────────────────────────

const stats = [
  { icon: MapPinIcon,     label: "Distance",    value: "~550 km" },
  { icon: ClockIcon,      label: "Travel time", value: "12–16 hrs" },
  { icon: MoonIcon,       label: "Departure",   value: "Evening" },
  { icon: CreditCardIcon, label: "Fare from",   value: "Rs. 1,200" },
]

const travelerTypes = [
  {
    icon: UsersIcon,
    title: "Students & job seekers",
    desc: "A large share of passengers from Morang, Sunsari, and surrounding districts are young people heading to Kathmandu for college admissions, entrance exams, or their first job. For many, this is one of the most important journeys they make.",
  },
  {
    icon: BriefcaseIcon,
    title: "Traders & business travelers",
    desc: "Biratnagar is a genuine industrial and commercial hub — jute mills, manufacturing, trade with the Indian border. Business travelers on this route have schedules to keep, which makes reliable booking and punctual operators matter more than extras.",
  },
  {
    icon: HeartIcon,
    title: "Families visiting relatives",
    desc: "There's a significant population from Province 1 settled in Kathmandu, and they travel back regularly. Around Chhath, Dashain, and Tihar the demand on this route spikes hard — sometimes weeks before the festival itself.",
  },
]

const busTypes = [
  {
    type: "Standard Bus",
    price: "Rs. 1,000 – 1,300",
    badge: null,
    desc: "Fixed seats, no recline, frequent stops. Viable for six hours. For a thirteen-hour overnight journey, it's a hard call — only book this if budget is the primary constraint.",
  },
  {
    type: "Deluxe Bus",
    price: "Rs. 1,400 – 1,800",
    badge: "Most popular",
    desc: "Reclining seats and fewer scheduled stops. The most common choice for this route, and the right one for most passengers — enough comfort to rest without paying a premium.",
  },
  {
    type: "AC Deluxe / Sleeper",
    price: "Rs. 2,000 – 3,000",
    badge: "Best for overnight",
    desc: "Full air conditioning, wider reclining seats, sometimes full sleeper berths. If you need to arrive in Kathmandu ready for a morning meeting or an exam, this is the one worth paying for.",
  },
]

const departureTimes = [
  { time: "5:00 PM", note: "Early evening — seats fill quickly" },
  { time: "6:00 PM", note: "Most popular slot" },
  { time: "7:00 PM", note: "Peak departure window" },
  { time: "8:00 PM", note: "Latest common evening departure" },
]

const whyUthbus = [
  {
    icon: CalendarIcon,
    title: "Book before you're stuck",
    desc: "On a route this busy, showing up at the counter the same day is a gamble. UthBus lets you lock in your seat days ahead — from your phone, from anywhere.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Operators are reviewed by real passengers",
    desc: "Not all buses on this route are the same. UthBus shows ratings from people who've actually made the Biratnagar–Kathmandu trip — so you can pick based on what actually matters.",
  },
  {
    icon: ClockIcon,
    title: "Accurate seat availability",
    desc: "The numbers on the seat map reflect what's actually left — not an estimate from a phone call. What you see is what's available right now.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay online, no follow-up needed",
    desc: "eSewa, Khalti, or card. Once payment goes through, your e-ticket is confirmed immediately. No calling the operator back, no re-confirming at the counter.",
  },
]

const faqs = [
  {
    q: "How long does the Biratnagar to Kathmandu bus journey take?",
    a: "Most buses take 12 to 16 hours. Under normal conditions with a reliable Deluxe operator, 13–14 hours is typical. Road diversions, traffic near Itahari junction, and the climb into Kathmandu can add time. It's a long trip — factor in at least 15 hours if you're planning around an arrival deadline.",
  },
  {
    q: "Are overnight buses available from Biratnagar to Kathmandu?",
    a: "Yes, and this is the standard way to travel on this route. Buses typically depart Biratnagar between 5 PM and 8 PM, arriving in Kathmandu between 6 AM and 10 AM the next morning. The evening departure is practical: you travel while you sleep, arrive with the morning ahead of you, and avoid spending money on a hotel night.",
  },
  {
    q: "When should I book tickets for Chhath, Dashain, or Tihar?",
    a: "Chhath is the most important festival in Province 1, and it drives some of the heaviest travel on this route — in both directions. For Chhath, Dashain, and Tihar, book at least 10 days to 2 weeks in advance. Seats and fares spike quickly once the festival dates approach, and last-minute options may not be available at any price.",
  },
  {
    q: "Which bus type is worth it for a 12+ hour overnight journey?",
    a: "A standard bus with fixed seats for 13 hours is genuinely uncomfortable — not just an inconvenience. At minimum, book a Deluxe service with reclining seats. If you have an important reason to arrive functional — an exam, a first day of work, a meeting — the extra cost of an AC Deluxe or Sleeper is worth it.",
  },
  {
    q: "Is online bus booking reliable for this route?",
    a: "Yes. UthBus shows real-time availability for operators running the Biratnagar–Kathmandu route. You pay online and receive your e-ticket immediately — it's accepted at the boarding point without any counter visit. The process is straightforward and works on any phone.",
  },
]

const relatedRoutes = [
  { label: "Kathmandu to Biratnagar",  href: "/search?from=Kathmandu&to=Biratnagar" },
  { label: "Kakarvitta to Kathmandu",  href: "/kakarvitta-to-kathmandu-bus" },
  { label: "Kathmandu to Damak",       href: "/kathmandu-to-damak-bus" },
  { label: "Biratnagar to Pokhara",    href: "/search?from=Biratnagar&to=Pokhara" },
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

export default function BiratnagarToKathmanduPage() {
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
                <BreadcrumbPage>Biratnagar to Kathmandu Bus</BreadcrumbPage>
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
            Biratnagar → Kathmandu
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Biratnagar to Kathmandu
            <br />
            <span className="text-primary">Bus Tickets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Most buses on this route leave Biratnagar in the evening and arrive in
            Kathmandu early the next morning. It&apos;s a long journey — planning it
            properly makes a real difference.
          </p>
          <SearchCTA from="Biratnagar" to="Kathmandu" />
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

      {/* ── About the journey ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-5">About this journey</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Biratnagar is the largest city in eastern Nepal — a genuine industrial and
              commercial centre with its own economy, its own energy, and a population that
              regularly needs to reach Kathmandu. This isn&apos;t a tourist route. Most people
              on this bus have somewhere to be: a college entrance, a job interview, a relative
              they haven&apos;t seen since the last Dashain.
            </p>
            <p>
              The journey covers roughly 550 km, passing through Itahari junction, stretching
              along the eastern terai plains, then climbing through the hills into the Kathmandu
              Valley. Almost all services depart in the evening and arrive early the next
              morning — it&apos;s a practical arrangement that most passengers prefer.
            </p>
            <p>
              Road quality and traffic vary. The stretch around Itahari can slow things down,
              and the final approach into Kathmandu through Nagdhunga adds time during peak
              hours. Build in buffer if you have something fixed the morning you arrive.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who travels this route ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">Who travels this route</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Understanding who else is on the bus helps explain why reliability matters more than frills on this route.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {travelerTypes.map((t) => (
              <Card key={t.title} className="border-border">
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg w-fit">
                    <t.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Choosing your bus ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <BusIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Choosing your bus</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Bus type matters a lot more on a 13-hour overnight trip than on a 6-hour daytime one
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
          <p className="text-xs text-muted-foreground mt-5 leading-relaxed border-l-2 border-primary/30 pl-3">
            During Chhath, Dashain, and Tihar, fares on this route rise significantly — sometimes
            40–60% above normal. The best Deluxe and AC seats are typically gone 1–2 weeks before
            major festivals. Book early.
          </p>
        </div>
      </section>

      {/* ── Departures ── */}
      <section className="py-14 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Departure windows</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Evening buses dominate this route — morning services are available but less popular
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {departureTimes.map((d) => (
              <div
                key={d.time}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <p className="text-lg font-bold text-foreground">{d.time}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{d.note}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <span className="font-medium text-foreground">Evening departures (5–8 PM)</span> are
              the norm. You board, settle in, and cover most of the distance while you sleep.
              Most passengers arrive in Kathmandu between 6 AM and 10 AM — enough morning left
              to do something with it.
            </p>
            <p>
              <span className="font-medium text-foreground">Morning departures (7–9 AM)</span> also
              exist and arrive in Kathmandu late at night. These work for passengers who want to
              travel during the day and don&apos;t need to reach Kathmandu by morning, but they
              are significantly less popular on this route.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why UthBus ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Why book through UthBus?
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Long-distance routes have less margin for error. Here&apos;s what UthBus does differently.
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
            Common questions
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Specific to the Biratnagar–Kathmandu route.
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
      <section className="py-10 px-4 border-b border-border bg-card">
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
            <BusIcon className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Your seat is waiting
          </h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">
            Check what&apos;s available on tonight&apos;s buses from Biratnagar. Compare operators,
            pick your seat on a live map, and get your e-ticket in minutes.
          </p>
          <SearchCTA from="Biratnagar" to="Kathmandu" />
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
