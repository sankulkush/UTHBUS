"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { BusService } from "../services/bus.service";
import { getOperatorById } from "../../../../services/firestore";
import type { Bus, Operator } from "../../../../lib/types";

interface CounterContextType {
  buses: Bus[];
  loading: boolean;
  operator: Operator | null;
  refreshData: () => Promise<void>;
  setBuses: (buses: Bus[]) => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [operator, setOperator] = useState<Operator | null>(null);

  const busService = new BusService();

  // You'll need to get the operator ID from your auth context or props
  const OPERATOR_ID = "your-operator-id"; // Replace with actual operator ID

  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Fetch operator data
      const operatorData = await getOperatorById(OPERATOR_ID);
      setOperator(operatorData);
      
      // Fetch buses for this operator
      if (operatorData) {
        const busesData = await busService.getBusesByOperator(operatorData.id);
        setBuses(busesData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    buses,
    loading,
    operator,
    refreshData,
    setBuses
  };

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}

export const useCounter = () => {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context;
};