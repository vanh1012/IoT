"use client"

import { Card } from "./ui/card"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { useState } from "react"

export function Notifications({ notifications }) {
    const [visibleNotifications, setVisibleNotifications] = useState(notifications)

    const getIcon = (type) => {
        switch (type) {
            case "warning":
                return AlertCircle
            case "success":
                return CheckCircle
            case "info":
                return Info
            default:
                return Info
        }
    }

    const getColors = (type) => {
        switch (type) {
            case "warning":
                return { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", text: "text-orange-700" }
            case "success":
                return { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", text: "text-green-700" }
            case "info":
                return { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-700" }
            default:
                return { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600", text: "text-gray-700" }
        }
    }

    const removeNotification = (id) => {
        setVisibleNotifications(visibleNotifications.filter((n) => n.id !== id))
    }

    return (
        <div className="space-y-3">
            {visibleNotifications.map((notification) => {
                const IconComponent = getIcon(notification.type)
                const colors = getColors(notification.type)

                return (
                    <Card
                        key={notification.id}
                        className={`${colors.bg} border ${colors.border} p-4 flex items-start gap-3 justify-between`}
                    >
                        <div className="flex items-start gap-3 flex-1">
                            <IconComponent className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                            <div>
                                <p className={`font-semibold ${colors.text}`}>{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className={`p-1 ${colors.icon} opacity-50 hover:opacity-100 transition-opacity`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </Card>
                )
            })}
        </div>
    )
}
