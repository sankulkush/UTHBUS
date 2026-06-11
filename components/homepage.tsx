"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/firebaseConfig"
import { useUserAuth } from "@/contexts/user-auth-context"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import CitySelect from "@/components/city-select"
import DatePicker from "@/components/date-picker"
import {
  Search,
  ArrowLeftRight,
  Bus,
  MapPin,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  TrendingUp,
  Tag,
} from "lucide-react"

// ── Types & Data ──────────────────────────────────────────────────────────────

interface RouteData {
  name: string
  image: string
  gradient: string
  description: string
  busesPerDay: number
  avgFare: string
  distanceKm: number
  fromCities: string[]
  peakTimes: string[]
  fareNote: string
  highlight: string
}

// Maps route name → dedicated SEO page (where one exists)
const ROUTE_SEO_PAGES: Record<string, string> = {
  Pokhara:    "/kathmandu-to-pokhara-bus",
  Biratnagar: "/biratnagar-to-kathmandu-bus",
  Damak:      "/kathmandu-to-damak-bus",
  Kakarvitta: "/kakarvitta-to-kathmandu-bus",
  Itahari:    "/kathmandu-to-itahari-bus",
  Dharan:     "/kathmandu-to-dharan-bus",
}

const ALL_ROUTES: RouteData[] = [
  {
    name: "Kathmandu",
    image: "/Destinations/kathmandu.jpg",
    gradient: "from-sky-700 to-blue-500",
    description: "Capital City",
    busesPerDay: 80,
    avgFare: "Rs. 150–400",
    distanceKm: 0,
    fromCities: ["Pokhara", "Biratnagar", "Dharan", "Damak"],
    peakTimes: ["6:00 AM – 9:00 AM", "4:00 PM – 8:00 PM"],
    fareNote: "Fares surge 40–50% around Dashain & Tihar due to high demand.",
    highlight: "Nepal's capital — hub for all inter-city routes",
  },
  {
    name: "Pokhara",
    image: "/Destinations/pokhara.png",
    gradient: "from-blue-600 to-cyan-500",
    description: "Lake City",
    busesPerDay: 48,
    avgFare: "Rs. 700–900",
    distanceKm: 200,
    fromCities: ["Kathmandu", "Butwal", "Biratnagar"],
    peakTimes: ["6:00 AM – 9:00 AM", "4:00 PM – 7:00 PM"],
    fareNote: "Fares rise 25–35% during Dashain & Tihar festivals.",
    highlight: "Scenic Prithvi Highway along Trishuli River",
  },
  {
    name: "Biratnagar",
    image: "/Destinations/biratnagar.png",
    gradient: "from-orange-500 to-amber-400",
    description: "Industrial Hub",
    busesPerDay: 55,
    avgFare: "Rs. 1,000–1,300",
    distanceKm: 395,
    fromCities: ["Kathmandu", "Dharan", "Damak", "Itahari"],
    peakTimes: ["5:30 AM – 8:30 AM", "3:00 PM – 6:00 PM"],
    fareNote: "Fares peak during Chhath Puja and Dashain by 30–40%.",
    highlight: "Connects to Indian border crossing at Jogbani",
  },
  {
    name: "Dharan",
    image: "/Destinations/dharan.png",
    gradient: "from-green-600 to-emerald-400",
    description: "Eastern Nepal",
    busesPerDay: 32,
    avgFare: "Rs. 900–1,100",
    distanceKm: 360,
    fromCities: ["Kathmandu", "Biratnagar", "Itahari"],
    peakTimes: ["5:00 AM – 8:00 AM", "2:00 PM – 5:00 PM"],
    fareNote: "Overnight buses popular; fares 10–15% higher in monsoon.",
    highlight: "Gateway to Koshi Hills & Dhankuta trekking",
  },
  {
    name: "Damak",
    image: "/Destinations/damak.jpg",
    gradient: "from-lime-600 to-green-400",
    description: "Garden City",
    busesPerDay: 18,
    avgFare: "Rs. 1,100–1,400",
    distanceKm: 420,
    fromCities: ["Kathmandu", "Biratnagar", "Birtamod"],
    peakTimes: ["5:00 AM – 8:00 AM", "2:00 PM – 5:00 PM"],
    fareNote: "Budget seasonal buses added during Chhath & Tihar.",
    highlight: "Known for tea gardens & Green City initiative",
  },
  {
    name: "Kakarvitta",
    image: "/Destinations/kakadvitta.jpg",
    gradient: "from-purple-600 to-indigo-400",
    description: "Border Gateway",
    busesPerDay: 14,
    avgFare: "Rs. 1,200–1,500",
    distanceKm: 490,
    fromCities: ["Kathmandu", "Biratnagar", "Damak"],
    peakTimes: ["5:00 AM – 7:30 AM", "1:00 PM – 4:00 PM"],
    fareNote: "Border proximity drives fare surges during Indian holidays.",
    highlight: "Nepal–India border crossing · Entry to Sikkim",
  },
  {
    name: "Itahari",
    image: "/Destinations/itahari.jpg",
    gradient: "from-rose-600 to-pink-400",
    description: "Junction City",
    busesPerDay: 42,
    avgFare: "Rs. 950–1,200",
    distanceKm: 380,
    fromCities: ["Kathmandu", "Dharan", "Biratnagar"],
    peakTimes: ["5:00 AM – 9:00 AM", "3:00 PM – 7:00 PM"],
    fareNote: "Being the key junction, fares are competitive and stable.",
    highlight: "Major road junction connecting eastern Nepal",
  },
]

// ── Route Insight Modal ───────────────────────────────────────────────────────

function RouteInsightModal({
  route,
  onClose,
  onSearch,
}: {
  route: RouteData | null
  onClose: () => void
  onSearch: (to: string) => void
}) {
  const [modalImgError, setModalImgError] = useState(false)

  useEffect(() => { setModalImgError(false) }, [route?.name])

  return (
    <Dialog open={!!route} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-border gap-0 [&>button]:z-10 [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100 [&>button]:top-3 [&>button]:right-3 [&>button]:bg-black/30 [&>button]:rounded-full [&>button]:w-7 [&>button]:h-7 [&>button]:flex [&>button]:items-center [&>button]:justify-center">
        <DialogTitle className="sr-only">{route?.name ?? "Route Details"}</DialogTitle>
        {route && (
          <>
            {/* Image header */}
            <div className="relative h-44 bg-muted shrink-0">
              {modalImgError ? (
                <div className={`absolute inset-0 bg-gradient-to-br ${route.gradient}`} />
              ) : (
                <Image
                  src={route.image}
                  alt={route.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 448px"
                  quality={80}
                  onError={() => setModalImgError(true)}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="font-display text-white text-xl font-bold leading-snug">{route.name}</h2>
                <p className="text-white/65 text-sm mt-0.5 leading-snug">{route.highlight}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Bus, value: `${route.busesPerDay}+`, label: "Buses / day" },
                  { icon: Tag, value: route.avgFare, label: "Avg fare" },
                  { icon: MapPin, value: route.distanceKm ? `${route.distanceKm} km` : "Hub", label: "Distance" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="bg-muted rounded-xl p-3 text-center">
                    <Icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
                    <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Peak Hours */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Busiest departure times
                </p>
                <div className="flex flex-wrap gap-2">
                  {route.peakTimes.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs font-medium px-2.5 py-0.5">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Popular origins */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Where people travel from
                </p>
                <div className="flex flex-wrap gap-2">
                  {route.fromCities.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>

              {/* Seasonal note */}
              <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">{route.fareNote}</p>
              </div>

              {/* CTA */}
              <Button className="w-full h-11 font-semibold" onClick={() => onSearch(route.name)}>
                <Search className="w-4 h-4 mr-2" />
                Find buses to {route.name}
              </Button>

              {/* SEO page link — only shown when a dedicated route guide exists */}
              {ROUTE_SEO_PAGES[route.name] && (
                <Link
                  href={ROUTE_SEO_PAGES[route.name]}
                  className="flex items-center justify-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Read the full route guide
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── All Routes Modal ──────────────────────────────────────────────────────────

function AllRoutesModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (route: RouteData) => void
}) {
  const [gridImgErrors, setGridImgErrors] = useState<Set<string>>(new Set())

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 rounded-2xl overflow-hidden border-border gap-0">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <DialogTitle className="text-base font-display">Every city we serve</DialogTitle>
        </DialogHeader>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[68vh] overflow-y-auto">
          {ALL_ROUTES.map((route) => (
            <button
              key={route.name}
              onClick={() => { onClose(); onSelect(route) }}
              className="group relative h-28 rounded-xl overflow-hidden cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {gridImgErrors.has(route.name) ? (
                <div className={`absolute inset-0 bg-gradient-to-br ${route.gradient}`} />
              ) : (
                <Image
                  src={route.image}
                  alt={route.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.07]"
                  sizes="(max-width: 640px) 50vw, 185px"
                  quality={55}
                  onError={() => setGridImgErrors((prev) => new Set(prev).add(route.name))}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3">
                <p className="text-white font-semibold text-sm leading-tight">{route.name}</p>
                <p className="text-white/60 text-xs">{route.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Homepage ──────────────────────────────────────────────────────────────────

export default function Homepage() {
  const [from, setFrom] = useState("Kathmandu")
  const [to, setTo] = useState("Biratnagar")
  const [date, setDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })
  const [isSearching, setIsSearching] = useState(false)
  const [fromError, setFromError] = useState("")
  const [toError, setToError] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)
  const [viewAllOpen, setViewAllOpen] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { userProfile } = useUserAuth()
  const { operator } = useOperatorAuth()

  const isOperatorLoggedIn = !!operator && operator.isOperator === true && operator.isUser === false
  const isUserLoggedIn = !!userProfile && userProfile.isUser === true && userProfile.isOperator === false

  // Operators always belong in the counter portal — redirect on homepage.
  // Guard against corrupted accounts that own BOTH a users/{uid} and an
  // operators/{uid} doc: that would loop with counter-layout's user bounce.
  useEffect(() => {
    if (isUserLoggedIn && isOperatorLoggedIn) {
      console.error("Auth corruption: UID owns both a user and operator profile. Signing out.")
      signOut(auth).catch(() => {})
      return
    }
    if (isOperatorLoggedIn) {
      router.replace("/operator/counter")
    }
  }, [isUserLoggedIn, isOperatorLoggedIn, router])

  if (isOperatorLoggedIn && !isUserLoggedIn) return null

  const handleSearch = async () => {
    setFromError("")
    setToError("")
    let hasError = false
    if (!from) { setFromError("Please select a departure city"); hasError = true }
    if (!to) { setToError("Please select a destination city"); hasError = true }
    if (hasError) return
    if (from === to) { setToError("Destination must differ from departure"); return }
    setIsSearching(true)
    try {
      router.push(`/search?${new URLSearchParams({ from, to, date }).toString()}`)
    } catch {
      setIsSearching(false)
    }
  }

  const handleSwap = () => {
    const tmp = from
    setFrom(to)
    setTo(tmp)
    setFromError("")
    setToError("")
  }

  const handleSearchToRoute = (toCity: string) => {
    setSelectedRoute(null)
    setTo(toCity)
    router.push(`/search?${new URLSearchParams({ from, to: toCity, date }).toString()}`)
  }

  return (
    <div className="min-h-screen bg-background bg-doodle">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16">
        {/* Wrapper — mobile: fixed height + cover; desktop: natural image height */}
        <div className="relative min-h-[620px] sm:min-h-[580px] md:min-h-0">

          {/* Image — natural size on desktop (no crop), cover on mobile */}
          <Image
            src="/Destinations/hero3.png"
            width={1808}
            height={592}
            priority
            quality={80}
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover md:static md:w-full md:h-auto block"
            alt="Travel across Nepal"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/20 z-[1]" />

          {/* Bottom fade into page background */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none z-[2]" />

          {/* Content — overlaid */}
          <div className="absolute inset-0 z-[3] flex flex-col justify-center pt-6 pb-6 sm:pt-10 sm:pb-10 md:pt-16 md:pb-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto w-full">

            {/* Live pill */}
            <div className="flex justify-center mb-3 md:mb-5 animate-fade-in">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live seats on 50+ routes
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-2 md:mb-3 animate-slide-up">
              Bus tickets across Nepal,
              <br />
              <span className="text-primary">booked in minutes</span>
            </h1>
            <p className="text-center text-white/70 text-base sm:text-lg md:text-xl font-medium mb-5 md:mb-8 animate-slide-up [animation-delay:100ms]">
              सरल बुकिंग, सफल यात्रा
            </p>

            {/* ── Search card ─────────────────────────────────────────── */}
            <div className="animate-slide-up [animation-delay:200ms]">
              <div className="bg-gray-100/85 dark:bg-slate-800/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 dark:border-white/10">

                {/* ── Desktop layout ── */}
                <div className="hidden md:flex items-stretch">
                  {/* FROM */}
                  <div className="flex-1 min-w-0 px-4 lg:px-5 py-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> From
                    </p>
                    <CitySelect
                      value={from}
                      onChange={(v) => { setFrom(v); setFromError("") }}
                      placeholder="Kathmandu"
                    />
                    {fromError && <p className="text-destructive text-xs mt-1">{fromError}</p>}
                  </div>

                  {/* Swap */}
                  <div className="flex items-center justify-center px-0.5">
                    <button
                      type="button"
                      onClick={handleSwap}
                      title="Swap cities"
                      className="w-8 h-8 rounded-full bg-muted border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary flex items-center justify-center transition-all duration-200 hover:rotate-180"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* TO */}
                  <div className="flex-1 min-w-0 px-4 lg:px-5 py-4 border-l border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> To
                    </p>
                    <CitySelect
                      value={to}
                      onChange={(v) => { setTo(v); setToError("") }}
                      placeholder="Biratnagar"
                    />
                    {toError && <p className="text-destructive text-xs mt-1">{toError}</p>}
                  </div>

                  {/* Divider */}
                  <div className="self-stretch w-px bg-border/50 my-3" />

                  {/* DATE */}
                  <div className="flex-[1.1] min-w-0 px-4 lg:px-5 py-4 border-l border-border/50">
                    <DatePicker value={date} onChange={setDate} />
                  </div>

                  {/* Search — rounded right edge matches card */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="relative shrink-0 flex items-center justify-center gap-2.5 min-w-[120px] lg:min-w-[140px] self-stretch px-5 lg:px-8 text-sm font-semibold disabled:opacity-50 bg-primary text-primary-foreground rounded-r-2xl transition-all duration-200 hover:bg-primary/90 shadow-glow hover:shadow-glow-lg whitespace-nowrap"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    {isSearching ? "Searching…" : "Find buses"}
                  </button>
                </div>

                {/* ── Mobile layout ── */}
                <div className="md:hidden flex flex-col">
                  {/* FROM + TO with overlaid swap */}
                  <div className="relative">
                    {/* FROM */}
                    <div className="px-3 pt-3 pb-2.5">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> From
                      </p>
                      <CitySelect
                        value={from}
                        onChange={(v) => { setFrom(v); setFromError("") }}
                        placeholder="Kathmandu"
                      />
                      {fromError && <p className="text-destructive text-xs mt-1">{fromError}</p>}
                    </div>

                    {/* Divider with overlaid swap button */}
                    <div className="h-px bg-border/50 mx-3" />
                    <button
                      type="button"
                      onClick={handleSwap}
                      title="Swap cities"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-all z-10"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                    </button>

                    {/* TO */}
                    <div className="px-3 pt-2.5 pb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> To
                      </p>
                      <CitySelect
                        value={to}
                        onChange={(v) => { setTo(v); setToError("") }}
                        placeholder="Biratnagar"
                      />
                      {toError && <p className="text-destructive text-xs mt-1">{toError}</p>}
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="border-t border-border/50 px-3 py-2.5">
                    <DatePicker value={date} onChange={setDate} />
                  </div>

                  {/* Search */}
                  <div className="px-3 pb-3 pt-2">
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="w-full h-11 rounded-xl text-sm font-semibold disabled:opacity-50 bg-primary text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-primary/90 shadow-glow"
                    >
                      <Search className="w-4 h-4 shrink-0" />
                      {isSearching ? "Searching…" : "Find buses"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{/* closes z-[3] content wrapper */}
    </div>{/* closes min-h wrapper */}
  </section>

      {/* ── Route cards ───────────────────────────────────────────────────── */}
      <section className="pt-2 pb-14">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">Where do you want to go?</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Tap a city for fares, timings and travel tips.</p>
            </div>
            <Button
              variant="outline"
              className="font-medium shrink-0"
              onClick={() => setViewAllOpen(true)}
            >
              All routes
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ALL_ROUTES.slice(0, 4).map((route, i) => (
              <button
                key={route.name}
                onClick={() => setSelectedRoute(route)}
                className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card hover:shadow-soft-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-left animate-slide-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="relative h-52 bg-muted">
                  {imgErrors.has(route.name) ? (
                    <div className={`absolute inset-0 bg-gradient-to-br ${route.gradient}`} />
                  ) : (
                    <Image
                      src={route.image}
                      alt={route.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={60}
                      onError={() => setImgErrors((prev) => new Set(prev).add(route.name))}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <h3 className="font-display text-white font-bold text-lg leading-tight">{route.name}</h3>
                        <p className="text-white/65 text-sm">{route.description}</p>
                      </div>
                      <span className="shrink-0 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
                        {route.busesPerDay}+ daily
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <RouteInsightModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onSearch={handleSearchToRoute}
      />
      <AllRoutesModal
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        onSelect={(route) => {
          setViewAllOpen(false)
          setSelectedRoute(route)
        }}
      />
    </div>
  )
}
