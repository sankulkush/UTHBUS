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

  // Sync internal query when parent value changes or on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(value)
    }
  }, [value, isOpen])

  // Close on outside click (click event)
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

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
      inputRef.current?.focus()
    }
  }, [isOpen])

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
    console.log("[CitySelect] selected:", cityName)
    onChange(cityName)
    setIsOpen(false)
  }

  const displayValue = isOpen ? searchQuery : value

  const Dropdown = () => (
    <div
      ref={dropdownRef}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50"
      style={dropdownPosition}
    >
      <div className="p-2">
        {filteredPopular.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 mb-2 px-2">POPULAR</div>
            {filteredPopular.map(city => (
              <div
                key={city.id}
                onClick={() => handleCitySelect(city.name)}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-md"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{city.name}</div>
                  <div className="text-xs text-gray-500">
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
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2 mt-4">OTHERS</div>
            )}
            {filteredOther.map(city => (
              <div
                key={city.id}
                onClick={() => handleCitySelect(city.name)}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-md"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">{city.name}</div>
                  <div className="text-xs text-gray-500">
                    {city.district}, {city.province}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {filteredCities.length === 0 && searchQuery && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No cities found for “{searchQuery}”</p>
          </div>
        )}
        {!searchQuery && filteredCities.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">Start typing to search</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className="flex items-center border rounded-md px-3 py-2 bg-white cursor-text"
        onClick={handleInputClick}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 outline-none bg-transparent text-sm"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
        {value && !isOpen && (
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
        <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-400" />
      </div>
      {isOpen && createPortal(<Dropdown />, document.body)}
    </div>
  )
}
