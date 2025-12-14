"use client"

import { Card } from "./ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp } from "lucide-react"

export function DataAnalytics({ sensorData }) {
    // Simulated historical data for charts
    const moistureData = [
        { time: "00:00", moisture: 45 },
        { time: "04:00", moisture: 42 },
        { time: "08:00", moisture: 50 },
        { time: "12:00", moisture: 62 },
        { time: "16:00", moisture: 58 },
        { time: "20:00", moisture: 55 },
        { time: "24:00", moisture: 62 },
    ]

    const temperatureData = [
        { time: "00:00", temp: 18 },
        { time: "04:00", temp: 16 },
        { time: "08:00", temp: 20 },
        { time: "12:00", temp: 26 },
        { time: "16:00", temp: 28 },
        { time: "20:00", temp: 23 },
        { time: "24:00", temp: 24.5 },
    ]

    const humidityData = [
        { time: "00:00", humidity: 68 },
        { time: "04:00", humidity: 72 },
        { time: "08:00", humidity: 65 },
        { time: "12:00", humidity: 58 },
        { time: "16:00", humidity: 55 },
        { time: "20:00", humidity: 62 },
        { time: "24:00", humidity: 68 },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Phân Tích Dữ Liệu</h2>
                    <p className="text-sm text-gray-500">Theo dõi xu hướng độ ẩm và nhiệt độ trong 24 giờ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Soil Moisture Chart */}
                <Card className="bg-white shadow-lg border-0 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Độ Ẩm Đất (24 giờ)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={moistureData}>
                            <defs>
                                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="time" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Area type="monotone" dataKey="moisture" stroke="#10b981" fillOpacity={1} fill="url(#colorMoisture)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Temperature Chart */}
                <Card className="bg-white shadow-lg border-0 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Nhiệt Độ (24 giờ)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={temperatureData}>
                            <defs>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="time" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Area type="monotone" dataKey="temp" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="bg-white shadow-lg border-0 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Độ Ẩm Không Khí (24 giờ)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={humidityData}>
                            <defs>
                                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="time" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fillOpacity={1} fill="url(#colorHumidity)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    )
}
