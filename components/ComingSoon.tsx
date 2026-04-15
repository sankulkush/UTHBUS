import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  compact?: boolean
}

export default function ComingSoon({ title, description, icon: Icon, compact = false }: ComingSoonProps) {
  if (compact) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">{description}</p>
        <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Coming soon</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Coming Soon</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            We&apos;re working on this feature. It will be available soon.
          </p>
          <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-lg px-5 py-2.5">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Under development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
