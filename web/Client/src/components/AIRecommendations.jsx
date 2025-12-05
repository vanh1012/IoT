"use client"

import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Lightbulb, Loader, Droplets, Sun, Thermometer, Wind } from "lucide-react"

export function AIRecommendations({
    sensorData,
    thresholds,
}) {
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(false)

    const getIcon = (type) => {
        switch (type) {
            case "watering":
                return <Droplets className="w-5 h-5 text-blue-500" />
            case "light":
                return <Sun className="w-5 h-5 text-yellow-500" />
            case "temperature":
                return <Thermometer className="w-5 h-5 text-red-500" />
            case "humidity":
                return <Wind className="w-5 h-5 text-cyan-500" />
            default:
                return <Lightbulb className="w-5 h-5 text-green-500" />
        }
    }

    const fetchRecommendations = async () => {
        setLoading(true)
        setTimeout(() => {
            const mockRecommendations = [
                {
                    title: "Tưới nước thêm",
                    description: "Độ ẩm đất ở mức 62%, nên tưới thêm để đạt 70-75%",
                    type: "watering",
                    action: "Bật máy bơm 15 phút",
                },
                {
                    title: "Bật ánh sáng",
                    description: "Cây cần ánh sáng hơn. Hôm nay chỉ có 4 giờ ánh sáng.",
                    type: "light",
                    action: "Bật ánh sáng 3 giờ",
                },
                {
                    title: "Kiểm tra nhiệt độ",
                    description: "Nhiệt độ dự kiến tăng 2-3°C vào ngày mai",
                    type: "temperature",
                    action: "Chuẩn bị tăng tưới",
                },
                {
                    title: "Tăng độ ẩm",
                    description: "Độ ẩm không khí 68%, có thể phun nước vào tối",
                    type: "humidity",
                    action: "Phun nước vào 18:00",
                },
            ]
            setRecommendations(mockRecommendations)
            setLoading(false)
        }, 500)
    }

    useEffect(() => {
        fetchRecommendations()
        const interval = setInterval(fetchRecommendations, 300000) // Refresh every 5 minutes
        return () => clearInterval(interval)
    }, [sensorData, thresholds])

    return (
        <Card className="p-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-emerald-900">Khuyến Nghị AI Hôm Nay & Ngày Mai</h2>
                </div>
                <Button onClick={fetchRecommendations} disabled={loading} variant="outline" size="sm">
                    {loading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                            Đang tải...
                        </>
                    ) : (
                        "Cập Nhật"
                    )}
                </Button>
            </div>

            {loading && recommendations.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-emerald-600" />
                    <p className="ml-3 text-emerald-700">Đang tạo khuyến nghị...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, idx) => (
                        <Card
                            key={idx}
                            className="p-4 border-l-4 hover:shadow-md transition-shadow"
                            style={{
                                borderLeftColor:
                                    rec.type === "watering"
                                        ? "#0ea5e9"
                                        : rec.type === "light"
                                            ? "#eab308"
                                            : rec.type === "temperature"
                                                ? "#ef4444"
                                                : "#06b6d4",
                            }}
                        >
                            <div className="flex gap-3">
                                {getIcon(rec.type)}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">💡 {rec.action}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p>
                    <strong>🔄 Dự đoán ngày mai:</strong> Nhiệt độ tăng 2-3°C, độ ẩm giảm 10%. Hãy chuẩn bị tăng tần suất tưới
                    nước.
                </p>
            </div>
        </Card>
    )
}
