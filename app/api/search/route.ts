// app/api/buses/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { BusSearchService } from '@/lib/services/busSearchService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    // Validate required parameters
    if (!from || !to || !date) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          message: 'Please provide from, to, and date parameters' 
        },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { 
          error: 'Invalid date format', 
          message: 'Date must be in YYYY-MM-DD format' 
        },
        { status: 400 }
      )
    }

    // Search for buses
    const buses = await BusSearchService.searchBuses(from, to, date)

    return NextResponse.json({
      success: true,
      data: buses,
      count: buses.length,
      searchParams: { from, to, date }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in bus search API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Unable to fetch bus data at this time' 
      },
      { status: 500 }
    )
  }
}

// Optional: Add POST method for more complex search criteria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to, date, filters } = body

    if (!from || !to || !date) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          message: 'Please provide from, to, and date in request body' 
        },
        { status: 400 }
      )
    }

    // Search for buses
    const buses = await BusSearchService.searchBuses(from, to, date)

    // Apply additional filters if provided
    let filteredBuses = buses
    if (filters) {
      filteredBuses = applyFilters(buses, filters)
    }

    return NextResponse.json({
      success: true,
      data: filteredBuses,
      count: filteredBuses.length,
      searchParams: { from, to, date, filters }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in bus search POST API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Unable to process search request' 
      },
      { status: 500 }
    )
  }
}

// Helper function to apply filters
function applyFilters(buses: any[], filters: any) {
  return buses.filter(bus => {
    // Bus type filters
    if (filters.busType && filters.busType.length > 0) {
      const busTypeMatch = filters.busType.some((type: string) => 
        bus.busType.toLowerCase().includes(type.toLowerCase())
      )
      if (!busTypeMatch) return false
    }

    // Seat type filters
    if (filters.seatType && filters.seatType.length > 0) {
      const seatTypeMatch = filters.seatType.some((type: string) => 
        bus.amenities.some((amenity: string) => 
          amenity.toLowerCase().includes(type.toLowerCase())
        )
      )
      if (!seatTypeMatch) return false
    }

    // Price range filter
    if (filters.minPrice && bus.price < filters.minPrice) return false
    if (filters.maxPrice && bus.price > filters.maxPrice) return false

    // Rating filter
    if (filters.minRating && bus.rating < filters.minRating) return false

    // Departure time filter
    if (filters.departureTimeSlot) {
      const depTime = parseInt(bus.departureTime.split(':')[0])
      const slot = filters.departureTimeSlot
      
      let timeMatch = false
      if (slot === 'morning' && depTime >= 6 && depTime < 12) timeMatch = true
      if (slot === 'afternoon' && depTime >= 12 && depTime < 18) timeMatch = true
      if (slot === 'evening' && depTime >= 18 && depTime < 24) timeMatch = true
      if (slot === 'night' && (depTime >= 0 && depTime < 6)) timeMatch = true
      
      if (!timeMatch) return false
    }

    return true
  })
}