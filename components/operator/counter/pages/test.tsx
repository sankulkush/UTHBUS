import { useState } from "react"
import CitySelect from "@/components/city-select"

export default function Test() {
  const [city, setCity] = useState("")
  return (
    <div className="p-6">
      <CitySelect
        value={city}
        onChange={setCity}
        placeholder="Pick a city"
        label="Test City"
      />
      <pre>selected: {city}</pre>
    </div>
  )
}
