"use client"

import { useState, useRef, useEffect } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
}

// Returns YYYY-MM-DD using local time, never UTC — avoids timezone day-shift bugs
// e.g. for Nepal (UTC+5:45), new Date().toISOString() can return yesterday's date
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarStyle, setCalendarStyle] = useState<React.CSSProperties>({})
  const calendarRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        calendarRef.current && !calendarRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close calendar on any scroll — position is stale once the page moves
  useEffect(() => {
    if (!showCalendar) return
    const handler = () => setShowCalendar(false)
    window.addEventListener("scroll", handler, { passive: true, capture: true })
    return () => window.removeEventListener("scroll", handler, { capture: true })
  }, [showCalendar])

  // Recalculate position whenever the calendar opens
  useEffect(() => {
    if (!showCalendar || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const CALENDAR_W = 288 // w-72
    const CALENDAR_H = 330 // approximate rendered height

    const isMobile = window.innerWidth < 640

    if (isMobile) {
      // Center horizontally; position below trigger but clamp to viewport
      const left = Math.max(8, Math.min(
        (window.innerWidth - CALENDAR_W) / 2,
        window.innerWidth - CALENDAR_W - 8,
      ))
      const spaceBelow = window.innerHeight - rect.bottom - 8
      const top = spaceBelow >= CALENDAR_H
        ? rect.bottom + 8
        : Math.max(8, window.innerHeight - CALENDAR_H - 8)
      setCalendarStyle({ top, left })
    } else {
      // Desktop: anchor below trigger, flip above if not enough space below
      const left = Math.min(rect.left, window.innerWidth - CALENDAR_W - 8)
      const top = rect.bottom + 8 + CALENDAR_H > window.innerHeight
        ? Math.max(8, rect.top - CALENDAR_H - 8)
        : rect.bottom + 8
      setCalendarStyle({ top: Math.max(8, top), left: Math.max(8, left) })
    }
  }, [showCalendar])

  const getTodayDate = () => toLocalDateStr(new Date())
  const getTomorrowDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return toLocalDateStr(d)
  }

  // Parse YYYY-MM-DD as local date (not UTC) to avoid display off-by-one
  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number)
    const date = new Date(y, m - 1, d)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    }
  }

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const handleDateSelect = (day: number) => {
    // Build date string from local parts — avoids UTC shift bug
    const d = String(day).padStart(2, "0")
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0")
    const y = currentMonth.getFullYear()
    onChange(`${y}-${m}-${d}`)
    setShowCalendar(false)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      return next
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const today = new Date()
    // Parse value as local date parts to avoid UTC-shift in comparisons
    const [sy, sm, sd] = value ? value.split("-").map(Number) : [0, 0, 0]
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth.getMonth() &&
        today.getFullYear() === currentMonth.getFullYear()
      const isSelected =
        sd === day &&
        sm - 1 === currentMonth.getMonth() &&
        sy === currentMonth.getFullYear()
      const isPast =
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) <
        new Date(today.getFullYear(), today.getMonth(), today.getDate())

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={`w-8 h-8 text-sm rounded-full transition-colors ${
            isSelected
              ? "bg-primary text-primary-foreground font-semibold"
              : isToday
              ? "bg-primary/10 text-primary font-semibold"
              : isPast
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "hover:bg-muted text-foreground"
          }`}
        >
          {day}
        </button>
      )
    }
    return days
  }

  const { day, month, year, weekday } = formatDate(value)

  const CalendarDropdown = () => (
    <div
      ref={calendarRef}
      className="fixed bg-card border border-border rounded-xl shadow-soft-lg p-4 w-72"
      style={{ ...calendarStyle, zIndex: 9999 }}
    >
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="p-1 h-7 w-7 hover:bg-muted">
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-foreground text-sm">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="p-1 h-7 w-7 hover:bg-muted">
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1.5 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      <div className="flex justify-between mt-3 pt-3 border-t border-border">
        <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)} className="text-muted-foreground text-xs h-7">
          Cancel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { onChange(getTodayDate()); setShowCalendar(false) }}
          className="text-primary text-xs h-7"
        >
          Today
        </Button>
      </div>
    </div>
  )

  const isToday = value === getTodayDate()
  const isTomorrow = value === getTomorrowDate()

  const ChipButtons = (
    <div className="flex flex-wrap gap-1.5 min-w-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(getTodayDate()) }}
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-200 ${
          isToday
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
        }`}
      >
        Today
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(getTomorrowDate()) }}
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-200 ${
          isTomorrow
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
        }`}
      >
        Tomorrow
      </button>
    </div>
  )

  return (
    <div ref={triggerRef}>
      {/* Stacked layout matching From/To fields: label → date text → chips */}
      <div
        className="cursor-pointer"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <CalendarIcon className="w-3 h-3" />
          Date
        </p>
        <p className="text-sm font-semibold text-foreground whitespace-nowrap truncate mb-2 tabular-nums">
          {weekday}, {day} {month} {year}
        </p>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        {ChipButtons}
      </div>

      {showCalendar && typeof window !== "undefined" && createPortal(<CalendarDropdown />, document.body)}
    </div>
  )
}
