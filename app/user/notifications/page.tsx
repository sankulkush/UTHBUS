import { Bell } from "lucide-react"
import ComingSoon from "@/components/ComingSoon"

export default function NotificationsPage() {
  return (
    <ComingSoon
      title="Notification"
      description="Manage your notification preferences and view alerts"
      icon={Bell}
    />
  )
}