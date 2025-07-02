// Enhanced data structure for operators and their buses
export interface Operator {
  id: string
  name: string
  email: string
  phone: string
  address: string
  licenseNumber: string
  registrationDate: string
  status: "active" | "suspended" | "pending"
}

export interface Bus {
  id: string
  operatorId: string
  busNumber: string
  busName: string
  busType: "ac-sleeper" | "ac-seater" | "ac-sofa" | "non-ac-seater" | "deluxe" | "super-deluxe"
  seatCapacity: number
  manufacturer: string
  model: string
  yearOfManufacture: number
  registrationNumber: string
  engineNumber: string
  chassisNumber: string
  fuelType: "diesel" | "petrol" | "cng" | "electric"
  amenities: string[]
  description: string
  status: "active" | "maintenance" | "inactive"
  images: string[]
}

export interface Route {
  id: string
  operatorId: string
  busId: string
  from: string
  to: string
  distance: string
  duration: string
  price: number
  departureTime: string
  arrivalTime: string
  status: "active" | "inactive"
  daysOfWeek: string[] // ["monday", "tuesday", etc.]
  effectiveDate: string
  expiryDate?: string
}

export interface Schedule {
  id: string
  routeId: string
  date: string
  departureTime: string
  arrivalTime: string
  availableSeats: number
  bookedSeats: number
  price: number
  status: "scheduled" | "cancelled" | "completed"
}

// Mock data for operators
export const mockOperators: Operator[] = [
  {
    id: "op1",
    name: "Greenline Tours",
    email: "info@greenlinetours.com",
    phone: "+977 9841234567",
    address: "Kathmandu, Nepal",
    licenseNumber: "GL2023001",
    registrationDate: "2023-01-15",
    status: "active",
  },
  {
    id: "op2",
    name: "Sapana Yatayat",
    email: "contact@sapanayatayat.com",
    phone: "+977 9851234567",
    address: "Biratnagar, Nepal",
    licenseNumber: "SY2023002",
    registrationDate: "2023-02-20",
    status: "active",
  },
]

// Mock data for buses
export const mockBuses: Bus[] = [
  {
    id: "bus1",
    operatorId: "op1",
    busNumber: "GL-001",
    busName: "Greenline Express",
    busType: "deluxe",
    seatCapacity: 45,
    manufacturer: "Volvo",
    model: "9400",
    yearOfManufacture: 2023,
    registrationNumber: "BA 1 CHA 1234",
    engineNumber: "VLV123456",
    chassisNumber: "VLV789012",
    fuelType: "diesel",
    amenities: ["ac", "wifi", "tv", "charging", "blanket", "water"],
    description: "Luxury AC bus with premium amenities",
    status: "active",
    images: ["/buses/greenline-1.jpg"],
  },
  {
    id: "bus2",
    operatorId: "op2",
    busNumber: "SY-001",
    busName: "Sapana Express",
    busType: "ac-sofa",
    seatCapacity: 32,
    manufacturer: "Ashok Leyland",
    model: "Viking",
    yearOfManufacture: 2022,
    registrationNumber: "BA 2 CHA 5678",
    engineNumber: "AL123456",
    chassisNumber: "AL789012",
    fuelType: "diesel",
    amenities: ["ac", "tv", "charging", "blanket"],
    description: "Comfortable AC sofa seater bus",
    status: "active",
    images: ["/buses/sapana-1.jpg"],
  },
]

// Mock data for routes
export const mockRoutes: Route[] = [
  {
    id: "route1",
    operatorId: "op1",
    busId: "bus1",
    from: "Kathmandu",
    to: "Pokhara",
    distance: "200 km",
    duration: "6-7 hours",
    price: 1200,
    departureTime: "07:00",
    arrivalTime: "13:30",
    status: "active",
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    effectiveDate: "2024-01-01",
  },
  {
    id: "route2",
    operatorId: "op2",
    busId: "bus2",
    from: "Kathmandu",
    to: "Biratnagar",
    distance: "400 km",
    duration: "12-14 hours",
    price: 1500,
    departureTime: "14:30",
    arrivalTime: "06:30",
    status: "active",
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    effectiveDate: "2024-01-01",
  },
]

// Helper functions
export const getOperatorBuses = (operatorId: string): Bus[] => {
  return mockBuses.filter((bus) => bus.operatorId === operatorId)
}

export const getOperatorRoutes = (operatorId: string): Route[] => {
  return mockRoutes.filter((route) => route.operatorId === operatorId)
}

export const getBusRoutes = (busId: string): Route[] => {
  return mockRoutes.filter((route) => route.busId === busId)
}

export const searchBuses = (from: string, to: string, date: string) => {
  // Find routes that match the search criteria
  const matchingRoutes = mockRoutes.filter(
    (route) =>
      route.from.toLowerCase() === from.toLowerCase() &&
      route.to.toLowerCase() === to.toLowerCase() &&
      route.status === "active",
  )

  // Get bus details for matching routes
  const results = matchingRoutes
    .map((route) => {
      const bus = mockBuses.find((b) => b.id === route.busId)
      const operator = mockOperators.find((op) => op.id === route.operatorId)

      if (!bus || !operator) return null

      return {
        id: route.id,
        operatorName: operator.name,
        busName: bus.busName,
        busNumber: bus.busNumber,
        busType: bus.busType,
        route: `${route.from} - ${route.to}`,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
        duration: route.duration,
        price: route.price,
        amenities: bus.amenities,
        seatCapacity: bus.seatCapacity,
        availableSeats: bus.seatCapacity - Math.floor(Math.random() * 20), // Mock available seats
        rating: 4.0 + Math.random(), // Mock rating
        departureDate: date,
        arrivalDate: date, // Simplified - could be next day
      }
    })
    .filter(Boolean)

  return results
}
