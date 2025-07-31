import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export default function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Icon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Construction className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
          <p className="text-gray-600 text-lg mb-6">
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-800 font-medium">
              This feature is currently under development
            </p>
            <p className="text-red-600 text-sm mt-1">
              We'll notify you once it's available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}