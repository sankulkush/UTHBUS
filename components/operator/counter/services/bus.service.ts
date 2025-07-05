import type { IBusService, IBus } from "../types/counter.types"

// Real data structure for 5 operators
const realOperators = [
  { id: "OP001", name: "Greenline Tours", companyName: "Greenline Tours Pvt. Ltd." },
  { id: "OP002", name: "Buddha Air Express", companyName: "Buddha Air Express Pvt. Ltd." },
  { id: "OP003", name: "Sajha Yatayat", companyName: "Sajha Yatayat Pvt. Ltd." },
  { id: "OP004", name: "Himalayan Express", companyName: "Himalayan Express Pvt. Ltd." },
  { id: "OP005", name: "Nepal Transport", companyName: "Nepal Transport Services Pvt. Ltd." },
]

// Real bus data for the 5 operators
const realBusData: IBus[] = [
  // Greenline Tours (OP001)
  {
    id: "BUS001",
    operatorId: "OP001",
    name: "Greenline Express 001",
    type: "Deluxe",
    model: "Volvo 9400",
    isAC: true,
    amenities: ["wifi", "charger", "recliner", "tv", "blanket", "water"],
    routes: ["Kathmandu-Pokhara"],
    startPoint: "Kathmandu",
    endPoint: "Pokhara",
    boardingPoints: ["New Bus Park", "Kalanki", "Thankot"],
    droppingPoints: ["Pokhara Bus Park", "Lakeside", "Mahendrapul"],
    photos: ["/buses/greenline-1.jpg"],
    status: "Active",
    nextRoute: "Kathmandu-Pokhara",
    nextDeparture: "07:00",
    departureTime: "07:00",
    arrivalTime: "13:30",
    duration: "6h 30m",
    price: 1200,
    seatCapacity: 45,
  },
  {
    id: "BUS002",
    operatorId: "OP001",
    name: "Greenline Express 002",
    type: "AC Deluxe",
    model: "Volvo 9700",
    isAC: true,
    amenities: ["wifi", "charger", "recliner", "tv", "blanket", "water", "snacks"],
    routes: ["Kathmandu-Chitwan"],
    startPoint: "Kathmandu",
    endPoint: "Chitwan",
    boardingPoints: ["New Bus Park", "Kalanki"],
    droppingPoints: ["Bharatpur Bus Park", "Sauraha"],
    photos: ["/buses/greenline-2.jpg"],
    status: "Active",
    nextRoute: "Kathmandu-Chitwan",
    nextDeparture: "09:00",
    departureTime: "09:00",
    arrivalTime: "13:30",
    duration: "4h 30m",
    price: 800,
    seatCapacity: 40,
  },
  // Buddha Air Express (OP002)
  {
    id: "BUS003",
    operatorId: "OP002",
    name: "Buddha Express 001",
    type: "Deluxe",
    model: "Ashok Leyland Viking",
    isAC: true,
    amenities: ["charger", "tv", "blanket"],
    routes: ["Kathmandu-Biratnagar"],
    startPoint: "Kathmandu",
    endPoint: "Biratnagar",
    boardingPoints: ["New Bus Park", "Koteshwor"],
    droppingPoints: ["Biratnagar Bus Park", "Traffic Chowk"],
    photos: ["/buses/buddha-1.jpg"],
    status: "Active",
    nextRoute: "Kathmandu-Biratnagar",
    nextDeparture: "14:30",
    departureTime: "14:30",
    arrivalTime: "06:30",
    duration: "16h 0m",
    price: 1500,
    seatCapacity: 50,
  },
  // Sajha Yatayat (OP003)
  {
    id: "BUS004",
    operatorId: "OP003",
    name: "Sajha Express 001",
    type: "Micro",
    model: "Tata Starbus",
    isAC: false,
    amenities: ["charger"],
    routes: ["Kathmandu-Butwal"],
    startPoint: "Kathmandu",
    endPoint: "Butwal",
    boardingPoints: ["New Bus Park", "Kalanki"],
    droppingPoints: ["Butwal Bus Park", "Traffic Chowk"],
    photos: ["/buses/sajha-1.jpg"],
    status: "Active",
    nextRoute: "Kathmandu-Butwal",
    nextDeparture: "08:00",
    departureTime: "08:00",
    arrivalTime: "15:00",
    duration: "7h 0m",
    price: 600,
    seatCapacity: 55,
  },
  // Himalayan Express (OP004)
  {
    id: "BUS005",
    operatorId: "OP004",
    name: "Himalayan Express 001",
    type: "AC Deluxe",
    model: "Mercedes Benz",
    isAC: true,
    amenities: ["wifi", "charger", "recliner", "tv", "blanket", "water", "snacks", "gps"],
    routes: ["Kathmandu-Pokhara"],
    startPoint: "Kathmandu",
    endPoint: "Pokhara",
    boardingPoints: ["New Bus Park", "Balaju"],
    droppingPoints: ["Pokhara Bus Park", "Lakeside"],
    photos: ["/buses/himalayan-1.jpg"],
    status: "Active",
    nextRoute: "Kathmandu-Pokhara",
    nextDeparture: "15:00",
    departureTime: "15:00",
    arrivalTime: "21:00",
    duration: "6h 0m",
    price: 1500,
    seatCapacity: 35,
  },
  // Nepal Transport (OP005)
  {
    id: "BUS006",
    operatorId: "OP005",
    name: "Nepal Transport 001",
    type: "Micro",
    model: "Hiace",
    isAC: false,
    amenities: ["charger"],
    routes: ["Kathmandu-Dharan"],
    startPoint: "Kathmandu",
    endPoint: "Dharan",
    boardingPoints: ["New Bus Park"],
    droppingPoints: ["Dharan Bus Park"],
    photos: ["/buses/nepal-1.jpg"],
    status: "Active",
    nextRoute: "Kathmandu-Dharan",
    nextDeparture: "06:00",
    departureTime: "06:00",
    arrivalTime: "18:00",
    duration: "12h 0m",
    price: 1000,
    seatCapacity: 15,
  },
]

export class BusService implements IBusService {
  async getBuses(operatorId: string): Promise<IBus[]> {
    // Return buses for specific operator
    return realBusData.filter((bus) => bus.operatorId === operatorId)
  }

  async createBus(bus: Omit<IBus, "id">): Promise<IBus> {
    const newBus: IBus = {
      ...bus,
      id: `BUS${String(realBusData.length + 1).padStart(3, "0")}`,
    }
    realBusData.push(newBus)
    return newBus
  }

  async updateBus(id: string, updates: Partial<IBus>): Promise<IBus> {
    const busIndex = realBusData.findIndex((bus) => bus.id === id)
    if (busIndex === -1) throw new Error("Bus not found")

    realBusData[busIndex] = { ...realBusData[busIndex], ...updates }
    return realBusData[busIndex]
  }

  async deleteBus(id: string): Promise<void> {
    const busIndex = realBusData.findIndex((bus) => bus.id === id)
    if (busIndex === -1) throw new Error("Bus not found")

    realBusData.splice(busIndex, 1)
  }

  async searchBuses(from: string, to: string, date: string): Promise<IBus[]> {
    // Search buses that match the route
    return realBusData.filter(
      (bus) =>
        bus.startPoint.toLowerCase() === from.toLowerCase() &&
        bus.endPoint.toLowerCase() === to.toLowerCase() &&
        bus.status === "Active",
    )
  }

  // Method to get all buses for homepage search
  static async getAllActiveBuses(): Promise<IBus[]> {
    return realBusData.filter((bus) => bus.status === "Active")
  }
}
