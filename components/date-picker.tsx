"use client"

import { useState, useRef, useEffect } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
  const calendarRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (showCalendar && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCalendarPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
  }, [showCalendar])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    }
  }

  const getTodayDate = () => new Date().toISOString().split("T")[0]
  const getTomorrowDate = () => new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selected.toISOString().split("T")[0])
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
    const selectedDate = new Date(value)
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
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
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
      style={{ top: calendarPosition.top, left: calendarPosition.left, zIndex: 9999 }}
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

  return (
    <div ref={triggerRef}>
      {/* Date display row */}
      <div
        className="flex items-center space-x-2.5 cursor-pointer"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">Date</div>
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {weekday}, {day} {month} {year}
          </div>
        </div>
      </div>

      {/* Quick chips — below date display */}
      <div className="flex gap-1.5 mt-2">
        <button
          type="button"
          onClick={() => onChange(getTodayDate())}
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
            isToday
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onChange(getTomorrowDate())}
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
            isTomorrow
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          Tmrw
        </button>
      </div>

      {showCalendar && typeof window !== "undefined" && createPortal(<CalendarDropdown />, document.body)}
    </div>
  )
}
