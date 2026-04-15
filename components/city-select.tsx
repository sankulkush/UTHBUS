"use client"

import React, { useState, useRef, useEffect } from "react"
import { MapPinIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { nepalCities, getPopularCities } from "@/lib/data"
import { createPortal } from "react-dom"

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
}

export default function CitySelect({ value, onChange, placeholder, label }: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const popularCities = getPopularCities()
  const filteredCities = nepalCities
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
  const filteredPopular = popularCities
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
  const filteredOther = filteredCities.filter(c => !c.popular)

  useEffect(() => {
    if (!isOpen) setSearchQuery(value)
  }, [value, isOpen])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        containerRef.current && !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleOutside)
    return () => document.removeEventListener("click", handleOutside)
  }, [])

  const updatePosition = () => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    window.addEventListener("scroll", updatePosition, { passive: true })
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  })

  const handleInputClick = () => setIsOpen(true)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
  }
  const handleClear = () => {
    onChange("")
    setSearchQuery("")
    setIsOpen(true)
  }
  const handleCitySelect = (cityName: string) => {
    onChange(cityName)
    setIsOpen(false)
  }

  const displayValue = isOpen ? searchQuery : value

  const Dropdown = () => (
    <div
      ref={dropdownRef}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      className="fixed bg-card border border-border rounded-xl shadow-soft-lg max-h-80 overflow-y-auto z-[9999]"
      style={dropdownPosition}
    >
      <div className="p-2">
        {filteredPopular.length > 0 && (
          <>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 px-2 pt-1">
              Popular
            </div>
            {filteredPopular.map(city => (
              <div
                key={city.id}
                onClick={() => handleCitySelect(city.name)}
                className="flex items-center space-x-3 p-2.5 hover:bg-muted/60 cursor-pointer rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">{city.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {city.district}, {city.province}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {filteredOther.length > 0 && (
          <>
            {filteredPopular.length > 0 && (
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 px-2 mt-3">
                Other Cities
              </div>
            )}
            {filteredOther.map(city => (
              <div
                key={city.id}
                onClick={() => handleCitySelect(city.name)}
                className="flex items-center space-x-3 p-2.5 hover:bg-muted/60 cursor-pointer rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">{city.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {city.district}, {city.province}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {filteredCities.length === 0 && searchQuery && (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No cities found for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
        {!searchQuery && filteredCities.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">Start typing to search</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}
      <div
        className="flex items-center border border-border/60 rounded-lg px-3 py-3 bg-slate-100 dark:bg-white/8 cursor-text hover:border-ring/60 transition-colors"
        onClick={handleInputClick}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 outline-none bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/70"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
        {value && !isOpen && (
          <button
            type="button"
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClear}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
        <ChevronDownIcon className="w-4 h-4 ml-2 text-muted-foreground shrink-0" />
      </div>
      {isOpen && createPortal(<Dropdown />, document.body)}
    </div>
  )
}
