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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
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
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" })
    const year = date.getFullYear()
    return { day, month, year }
  }

  // Helper function to format date without timezone issues
  const formatDateToString = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    return `${year}-${formattedMonth}-${formattedDay}`
  }

  const getTodayDate = () => {
    const today = new Date()
    return formatDateToString(today.getFullYear(), today.getMonth(), today.getDate())
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDateToString(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  }

  const handleDateAreaClick = () => {
    setShowCalendar(!showCalendar)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleDateSelect = (day: number) => {
    // Use the helper function to avoid timezone conversion issues
    const dateString = formatDateToString(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(dateString)
    setShowCalendar(false)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const today = new Date()
    
    // Parse selected date safely
    const [selectedYear, selectedMonth, selectedDay] = value.split('-').map(Number)

    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth.getMonth() &&
        today.getFullYear() === currentMonth.getFullYear()

      const isSelected =
        selectedDay === day &&
        selectedMonth - 1 === currentMonth.getMonth() && // selectedMonth is 1-based, getMonth() is 0-based
        selectedYear === currentMonth.getFullYear()

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
              ? "bg-red-600 text-white"
              : isToday
                ? "bg-blue-100 text-blue-600 font-semibold"
                : isPast
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  const CalendarDropdown = () => (
    <div
      ref={calendarRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl p-4 w-80"
      style={{
        top: calendarPosition.top,
        left: calendarPosition.left,
        zIndex: 9999,
      }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="p-1 hover:bg-gray-100">
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        <h3 className="font-semibold text-gray-800">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>

        <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="p-1 hover:bg-gray-100">
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      {/* Quick Actions */}
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
        <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)} className="text-gray-600">
          Cancel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange(getTodayDate())
            setShowCalendar(false)
          }}
          className="text-blue-600"
        >
          Today
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div ref={triggerRef}>
        <div className="flex items-center h-16 space-x-3">
          {/* Date Display - Clickable */}
          <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={handleDateAreaClick}>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Date</div>
              <div className="text-lg font-medium">
                {formatDate(value).day} {formatDate(value).month} {formatDate(value).year}
              </div>
            </div>
          </div>

          {/* Today/Tomorrow buttons - NOT clickable for calendar */}
          <div className="flex flex-col space-y-1">
            <Button
              type="button"
              onClick={() => onChange(getTodayDate())}
              variant="outline"
              size="sm"
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${
                value === getTodayDate()
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-md"
                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              Today
            </Button>
            <Button
              type="button"
              onClick={() => onChange(getTomorrowDate())}
              variant="outline"
              size="sm"
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${
                value === getTomorrowDate()
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-md"
                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              Tomorrow
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Portal - Renders outside form boundaries */}
      {showCalendar && typeof window !== "undefined" && createPortal(<CalendarDropdown />, document.body)}
    </>
  )
}