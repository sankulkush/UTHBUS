import type { IAuthService, IOperator } from "../types/counter.types"

// Real operator data for 5 operators
const realOperators: IOperator[] = [
  {
    id: "OP001",
    name: "Ram Sharma",
    email: "ram@greenlinetours.com",
    phone: "+977 9841234567",
    companyName: "Greenline Tours",
    licenseNumber: "GL2024001",
  },
  {
    id: "OP002",
    name: "Sita Devi",
    email: "sita@buddhaexpress.com",
    phone: "+977 9842345678",
    companyName: "Buddha Air Express",
    licenseNumber: "BA2024002",
  },
  {
    id: "OP003",
    name: "Hari Bahadur",
    email: "hari@sajhayatayat.com",
    phone: "+977 9843456789",
    companyName: "Sajha Yatayat",
    licenseNumber: "SY2024003",
  },
  {
    id: "OP004",
    name: "Maya Gurung",
    email: "maya@himalayanexpress.com",
    phone: "+977 9844567890",
    companyName: "Himalayan Express",
    licenseNumber: "HE2024004",
  },
  {
    id: "OP005",
    name: "Bikash Shrestha",
    email: "bikash@nepaltransport.com",
    phone: "+977 9845678901",
    companyName: "Nepal Transport",
    licenseNumber: "NT2024005",
  },
]

// Current logged in operator (for demo - will be replaced with real auth)
let currentOperator: IOperator | null = realOperators[0] // Default to first operator

export class AuthService implements IAuthService {
  async getCurrentOperator(): Promise<IOperator | null> {
    return currentOperator
  }

  async login(email: string, password: string): Promise<IOperator> {
    // Find operator by email
    const operator = realOperators.find((op) => op.email === email)
    if (!operator) {
      throw new Error("Invalid credentials")
    }
    currentOperator = operator
    return operator
  }

  async logout(): Promise<void> {
    currentOperator = null
  }

  // Method to switch operator for testing
  static setCurrentOperator(operatorId: string): void {
    const operator = realOperators.find((op) => op.id === operatorId)
    if (operator) {
      currentOperator = operator
    }
  }

  // Get all operators for testing
  static getAllOperators(): IOperator[] {
    return realOperators
  }
}
