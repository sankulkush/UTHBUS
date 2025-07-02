export interface City {
  id: number
  name: string
  district: string
  province: string
  popular: boolean
}

export const nepalCities: City[] = [
  // Popular cities
  { id: 1, name: "Kathmandu", district: "Kathmandu", province: "Bagmati", popular: true },
  { id: 2, name: "Pokhara", district: "Kaski", province: "Gandaki", popular: true },
  { id: 3, name: "Biratnagar", district: "Morang", province: "Koshi", popular: true },
  { id: 4, name: "Dharan", district: "Sunsari", province: "Koshi", popular: true },
  { id: 5, name: "Chitwan", district: "Chitwan", province: "Bagmati", popular: true },
  { id: 6, name: "Butwal", district: "Rupandehi", province: "Lumbini", popular: true },
  { id: 7, name: "Nepalgunj", district: "Banke", province: "Lumbini", popular: true },
  { id: 8, name: "Janakpur", district: "Dhanusha", province: "Madhesh", popular: true },
  
  // Other cities
  { id: 9, name: "Bhaktapur", district: "Bhaktapur", province: "Bagmati", popular: false },
  { id: 10, name: "Lalitpur", district: "Lalitpur", province: "Bagmati", popular: false },
  { id: 11, name: "Birgunj", district: "Parsa", province: "Madhesh", popular: false },
  { id: 12, name: "Hetauda", district: "Makwanpur", province: "Bagmati", popular: false },
  { id: 13, name: "Dhangadhi", district: "Kailali", province: "Sudurpashchim", popular: false },
  { id: 14, name: "Itahari", district: "Sunsari", province: "Koshi", popular: false },
  { id: 15, name: "Gorkha", district: "Gorkha", province: "Gandaki", popular: false },
  { id: 16, name: "Lumbini", district: "Rupandehi", province: "Lumbini", popular: false },
  { id: 17, name: "Baglung", district: "Baglung", province: "Gandaki", popular: false },
  { id: 18, name: "Palpa", district: "Palpa", province: "Lumbini", popular: false },
  { id: 19, name: "Syangja", district: "Syangja", province: "Gandaki", popular: false },
  { id: 20, name: "Nawalpur", district: "Nawalpur", province: "Gandaki", popular: false },
  { id: 21, name: "Dang", district: "Dang", province: "Lumbini", popular: false },
  { id: 22, name: "Bardiya", district: "Bardiya", province: "Lumbini", popular: false },
  { id: 23, name: "Kanchanpur", district: "Kanchanpur", province: "Sudurpashchim", popular: false },
  { id: 24, name: "Dadeldhura", district: "Dadeldhura", province: "Sudurpashchim", popular: false },
  { id: 25, name: "Bajhang", district: "Bajhang", province: "Sudurpashchim", popular: false },
]

export const getPopularCities = (): City[] => {
  return nepalCities.filter(city => city.popular)
}

export const getCityByName = (name: string): City | undefined => {
  return nepalCities.find(city => city.name.toLowerCase() === name.toLowerCase())
}

export const searchCities = (query: string): City[] => {
  if (!query) return nepalCities
  return nepalCities.filter(city => 
    city.name.toLowerCase().includes(query.toLowerCase()) ||
    city.district.toLowerCase().includes(query.toLowerCase()) ||
    city.province.toLowerCase().includes(query.toLowerCase())
  )
}

// Bus operators data
export interface BusOperator {
  id: number
  name: string
  rating: number
  totalBuses: number
  routes: string[]
  amenities: string[]
  priceRange: { min: number; max: number }
}

export const busOperators: BusOperator[] = [
  {
    id: 1,
    name: "Sapana Yatayat",
    rating: 4.1,
    totalBuses: 15,
    routes: ["Kathmandu-Biratnagar", "Kathmandu-Pokhara", "Pokhara-Chitwan"],
    amenities: ["AC", "Sofa Seat", "TV", "Charging Port"],
    priceRange: { min: 800, max: 1500 }
  },
  {
    id: 2,
    name: "Green Line",
    rating: 4.3,
    totalBuses: 25,
    routes: ["Kathmandu-Pokhara", "Kathmandu-Chitwan", "Pokhara-Lumbini"],
    amenities: ["AC", "Sleeper", "WiFi", "TV", "Blanket"],
    priceRange: { min: 1200, max: 2500 }
  },
  {
    id: 3,
    name: "Sundar Birat Yatra",
    rating: 4.0,
    totalBuses: 12,
    routes: ["Kathmandu-Biratnagar", "Kathmandu-Dharan", "Biratnagar-Pokhara"],
    amenities: ["AC", "Sofa Seat", "TV"],
    priceRange: { min: 900, max: 1600 }
  },
  {
    id: 4,
    name: "Apsara Yatayat",
    rating: 3.9,
    totalBuses: 8,
    routes: ["Kathmandu-Butwal", "Kathmandu-Nepalgunj", "Butwal-Pokhara"],
    amenities: ["Deluxe Seat", "TV", "Music System"],
    priceRange: { min: 700, max: 1200 }
  },
  {
    id: 5,
    name: "Buddha Air Transport",
    rating: 4.2,
    totalBuses: 18,
    routes: ["Kathmandu-Lumbini", "Kathmandu-Janakpur", "Pokhara-Lumbini"],
    amenities: ["AC", "Reclining Seat", "TV", "Refreshments"],
    priceRange: { min: 1000, max: 1800 }
  }
]

// Routes data
export interface Route {
  id: number
  from: string
  to: string
  distance: number
  duration: string
  popular: boolean
  operators: number[]
}

export const routes: Route[] = [
  { id: 1, from: "Kathmandu", to: "Pokhara", distance: 200, duration: "6-7 hours", popular: true, operators: [1, 2, 5] },
  { id: 2, from: "Kathmandu", to: "Biratnagar", distance: 540, duration: "12-14 hours", popular: true, operators: [1, 3] },
  { id: 3, from: "Kathmandu", to: "Chitwan", distance: 150, duration: "4-5 hours", popular: true, operators: [2, 4] },
  { id: 4, from: "Kathmandu", to: "Butwal", distance: 300, duration: "7-8 hours", popular: true, operators: [4, 5] },
  { id: 5, from: "Kathmandu", to: "Dharan", distance: 500, duration: "11-12 hours", popular: true, operators: [3] },
  { id: 6, from: "Kathmandu", to: "Nepalgunj", distance: 520, duration: "12-13 hours", popular: true, operators: [4] },
  { id: 7, from: "Kathmandu", to: "Janakpur", distance: 380, duration: "8-9 hours", popular: true, operators: [5] },
  { id: 8, from: "Pokhara", to: "Chitwan", distance: 120, duration: "3-4 hours", popular: false, operators: [1, 2] },
  { id: 9, from: "Pokhara", to: "Lumbini", distance: 180, duration: "5-6 hours", popular: false, operators: [2, 5] },
  { id: 10, from: "Biratnagar", to: "Dharan", distance: 50, duration: "1-2 hours", popular: false, operators: [3] },
]

export const getRoutesBetweenCities = (from: string, to: string): Route[] => {
  return routes.filter(route => 
    (route.from.toLowerCase() === from.toLowerCase() && route.to.toLowerCase() === to.toLowerCase()) ||
    (route.from.toLowerCase() === to.toLowerCase() && route.to.toLowerCase() === from.toLowerCase())
  )
}

export const getPopularRoutes = (): Route[] => {
  return routes.filter(route => route.popular)
}