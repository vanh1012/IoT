"use client"

import { Card } from "./ui/card"
import { Power, Settings, AlertCircle, Trash2, TrendingDown, TrendingUp } from "lucide-react"
export function ActivityLogs({ history }) {
    const defaultHistory = [
        {
            id: "1",
            action: "THRESHOLD_HIGH",
            device: "Độ Ẩm Đất",
            timestamp: "Hôm nay 14:35",
            value: 82,
            limit: 80,
            threshold: "Cao hơn ngưỡng",
        },
        {
            id: "2",
            action: "ON",
            device: "Máy Bơm",
            duration: 10,
            timestamp: "Hôm nay 14:30",
        },
        {
            id: "3",
            action: "THRESHOLD_LOW",
            device: "Độ Ẩm Không Khí",
            timestamp: "Hôm nay 12:15",
            value: 48,
            limit: 50,
            threshold: "Thấp hơn ngưỡng",
        },
        {
            id: "4",
            action: "ON",
            device: "Ánh Sáng",
            duration: 120,
            timestamp: "Hôm nay 08:00",
        },
        {
            id: "5",
            action: "SCHEDULE",
            device: "Lịch biểu: Máy Bơm",
            timestamp: "Hôm nay 07:45",
        },
        {
            id: "6",
            action: "THRESHOLD_HIGH",
            device: "Nhiệt Độ",
            timestamp: "Hôm qua 16:20",
            value: 29,
            limit: 28,
            threshold: "Cao hơn ngưỡng",
        },
        {
            id: "7",
            action: "OFF",
            device: "Ánh Sáng",
            timestamp: "Hôm qua 18:00",
        },
    ]

    const logs = history && history.length > 0 ? history : defaultHistory

    const getIcon = (action) => {
        switch (action) {
            case "ON":
            case "OFF":
                return Power
            case "SCHEDULE":
                return Settings
            case "THRESHOLD_HIGH":
                return TrendingUp
            case "THRESHOLD_LOW":
                return TrendingDown
            default:
                return AlertCircle
        }
    }

    const getColor = (action) => {
        switch (action) {
            case "ON":
                return "bg-green-100 text-green-600"
            case "OFF":
                return "bg-red-100 text-red-600"
            case "SCHEDULE":
                return "bg-purple-100 text-purple-600"
            case "THRESHOLD_HIGH":
                return "bg-orange-100 text-orange-600"
            case "THRESHOLD_LOW":
                return "bg-yellow-100 text-yellow-600"
            default:
                return "bg-gray-100 text-gray-600"
        }
    }

    const getActionText = (log) => {
        switch (log.action) {
            case "ON":
                return `Bật ${log.device}${log.duration ? ` (${log.duration}m)` : ""}`
            case "OFF":
                return `Tắt ${log.device}`
            case "SCHEDULE":
                return `${log.device}`
            case "THRESHOLD_HIGH":
                return `${log.device} ${log.threshold} - ${log.value}° / ${log.limit}°`
            case "THRESHOLD_LOW":
                return `${log.device} ${log.threshold} - ${log.value}% / ${log.limit}%`
            default:
                return log.action
        }
    }

    return (
        <Card className="bg-white shadow-lg border-0 p-6 md:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nhật Ký Hoạt Động</h2>
                <p className="text-sm text-gray-500">Lịch sử tất cả các hoạt động điều khiển</p>
            </div>

            <div className="space-y-3">
                {logs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có hoạt động nào</p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const IconComponent = getIcon(log.action)
                        return (
                            <div
                                key={log.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-2 rounded-lg ${getColor(log.action)}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{getActionText(log)}</p>
                                        <p className="text-sm text-gray-500">{log.timestamp}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </Card>
    )
}
