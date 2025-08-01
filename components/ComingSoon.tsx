import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  compact?: boolean // New prop for compact display in tabs
}

export default function ComingSoon({ title, description, icon: Icon, compact = false }: ComingSoonProps) {
  if (compact) {
    // Compact version for tabs
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-gray-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto">{description}</p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-orange-600" />
            <p className="text-orange-800 font-medium text-sm">Coming Soon!</p>
          </div>
          <p className="text-orange-600 text-xs">This feature is under development and will be available soon.</p>
        </div>
      </div>
    )
  }

  // Full version for pages
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
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-gray-400" />
          </div>
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