"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  ShieldCheck,
  Zap,
  Headphones,
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
                <h2 className="text-white text-xl font-bold leading-snug">{route.name}</h2>
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Peak Travel Hours
                </p>
                <div className="flex flex-wrap gap-2">
                  {route.peakTimes.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs font-medium px-2.5 py-0.5">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Popular origins */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Popular Departure Cities
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
                Search Buses to {route.name}
              </Button>
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
          <DialogTitle className="text-base">All Available Routes</DialogTitle>
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
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [isSearching, setIsSearching] = useState(false)
  const [fromError, setFromError] = useState("")
  const [toError, setToError] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)
  const [viewAllOpen, setViewAllOpen] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const router = useRouter()

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
    <div className="min-h-screen bg-background">

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
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live seat availability · 50+ routes
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-2 md:mb-3 animate-slide-up">
              Book Bus Tickets
              <br />
              <span className="text-primary">Across Nepal</span>
            </h1>
            <p className="text-center text-orange-400 text-base sm:text-xl md:text-2xl font-semibold mb-5 md:mb-8 animate-slide-up [animation-delay:100ms]">
              सरल बुकिंग, सफल यात्रा
            </p>

            {/* ── Search card ─────────────────────────────────────────── */}
            <div className="animate-slide-up [animation-delay:200ms]">
              <div className="bg-gray-100/85 dark:bg-slate-800/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 dark:border-white/10">

                {/* ── Desktop layout ── */}
                <div className="hidden md:flex items-stretch">
                  {/* FROM */}
                  <div className="flex-1 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> Departure
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
                  <div className="flex-1 px-5 py-4 border-l border-border/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> Destination
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
                  <div className="flex-[1.1] px-5 py-4 border-l border-border/50">
                    <DatePicker value={date} onChange={setDate} />
                  </div>

                  {/* Search — rounded right edge matches card */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="relative flex items-center justify-center gap-2.5 min-w-[130px] self-stretch px-8 text-sm font-semibold tracking-wide disabled:opacity-50 text-white rounded-r-2xl transition-all duration-200 bg-gradient-to-b from-[#f04535] to-[#c02818] hover:from-[#f55545] hover:to-[#d03020] [box-shadow:0_4px_20px_-2px_rgba(192,40,24,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:[box-shadow:0_6px_28px_-2px_rgba(192,40,24,0.65),inset_0_1px_0_rgba(255,255,255,0.25)]"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    {isSearching ? "Searching…" : "Search"}
                  </button>
                </div>

                {/* ── Mobile layout ── */}
                <div className="md:hidden flex flex-col">
                  {/* FROM + TO with overlaid swap */}
                  <div className="relative">
                    {/* FROM */}
                    <div className="px-3 pt-3 pb-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> From
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
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> To
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
                      className="w-full h-11 rounded-xl text-sm font-semibold tracking-wide disabled:opacity-50 text-white transition-all duration-200 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#f04535] to-[#c02818] hover:from-[#f55545] hover:to-[#d03020] [box-shadow:0_4px_16px_-2px_rgba(192,40,24,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:[box-shadow:0_6px_22px_-2px_rgba(192,40,24,0.65),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    >
                      <Search className="w-4 h-4 shrink-0" />
                      {isSearching ? "Searching…" : "Search Buses"}
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
      <section className="pt-2 pb-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Available Routes</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Click any route to see insights & fare data</p>
            </div>
            <Button
              variant="outline"
              className="font-medium shrink-0"
              onClick={() => setViewAllOpen(true)}
            >
              View All
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
                        <h3 className="text-white font-bold text-lg leading-tight">{route.name}</h3>
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

      {/* ── Why UthBus ────────────────────────────────────────────────────── */}
      <section className="py-14 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Why travel with UthBus?</h2>
            <p className="text-muted-foreground text-sm mt-1">Built for Nepal, built for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Operators",
                desc: "Every operator is screened, licensed, and reviewed by real passengers.",
              },
              {
                icon: Zap,
                title: "Instant Confirmation",
                desc: "Your seat is locked and your e-ticket delivered within seconds.",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                desc: "Reach us by phone or chat any time you need help.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-soft transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <div className="text-xl font-extrabold mb-4 tracking-tight">
                <span className="text-blue-400">uth</span>
                <span className="text-primary">bus</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nepal&apos;s trusted bus booking platform. Travel safely and comfortably across the country.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
                Quick Links
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/about" className="hover:text-slate-100 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-slate-100 transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-slate-100 transition-colors">Help</a></li>
                <li><a href="#" className="hover:text-slate-100 transition-colors">Terms</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
                Popular Routes
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                {["Kathmandu – Pokhara", "Kathmandu – Biratnagar", "Kathmandu – Damak", "Biratnagar – Kakarvitta"].map(
                  (r) => <li key={r}><a href="#" className="hover:text-slate-100 transition-colors">{r}</a></li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
                Operator Portal
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/operator/login" className="hover:text-slate-100 transition-colors">Operator Login</Link></li>
                <li><Link href="/operator/register" className="hover:text-slate-100 transition-colors">Register as Operator</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
                Contact
              </h4>
              <div className="space-y-2 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+977 9815355501</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>info@uthbus.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-600 text-sm">
            <p>&copy; 2025 UthBus. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
